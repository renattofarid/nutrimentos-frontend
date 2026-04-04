import { useEffect, useState } from "react";
import { useZone } from "../lib/zone.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import ZoneActions from "./ZoneActions";
import ZoneTable from "./ZoneTable";
import ZoneOptions from "./ZoneOptions";
import { deleteZone } from "../lib/zone.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, SUCCESS_MESSAGE, ERROR_MESSAGE } from "@/lib/core.function";
import { ZoneColumns } from "./ZoneColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { ZONE } from "../lib/zone.interface";
import ZoneModal from "./ZoneModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = ZONE;

export default function ZonePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useZone();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const selectedId = Object.keys(rowSelection).find((k) => rowSelection[k]);
  const selected = selectedId ? (data?.find((r) => r.id.toString() === selectedId) ?? null) : null;
  const hasSelection = !!selected;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteZone(deleteId);
      await refetch();
      setRowSelection({});
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageWrapper>
      <ZoneActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => selected && setEditId(selected.id)}
        onDelete={() => selected && setDeleteId(selected.id)}
      />

      <ZoneTable
        isLoading={isLoading}
        columns={ZoneColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(row) => setEditId(row.id)}
      >
        <ZoneOptions search={search} setSearch={setSearch} />
      </ZoneTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <ZoneModal title={`Crear ${MODEL.name}`} mode="create" open={true} onClose={() => setOpenCreate(false)} />
      )}
      {editId !== null && (
        <ZoneModal id={editId} open={true} onClose={() => setEditId(null)} title={`Editar ${MODEL.name}`} mode="update" />
      )}
      {deleteId !== null && (
        <SimpleDeleteDialog open={true} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} />
      )}
    </PageWrapper>
  );
}
