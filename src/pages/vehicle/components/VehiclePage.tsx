import { useEffect, useState } from "react";
import { useVehicle } from "../lib/vehicle.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import VehicleActions from "./VehicleActions";
import VehicleTable from "./VehicleTable";
import VehicleOptions from "./VehicleOptions";
import { deleteVehicle } from "../lib/vehicle.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, SUCCESS_MESSAGE, ERROR_MESSAGE } from "@/lib/core.function";
import { VehicleColumns } from "./VehicleColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { VEHICLE } from "../lib/vehicle.interface";
import VehicleModal from "./VehicleModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = VEHICLE;

export default function VehiclePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useVehicle();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const selectedId = Object.keys(rowSelection).find((k) => rowSelection[k]);
  const selected = selectedId ? (data?.find((r) => r.id.toString() === selectedId) ?? null) : null;
  const hasSelection = !!selected;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicle(deleteId);
      await refetch();
      setRowSelection({});
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGE(MODEL, "delete");
      errorToast(message);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageWrapper>
      <VehicleActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => selected && setEditId(selected.id)}
        onDelete={() => selected && setDeleteId(selected.id)}
      />

      <VehicleTable
        isLoading={isLoading}
        columns={VehicleColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(row) => setEditId(row.id)}
      >
        <VehicleOptions search={search} setSearch={setSearch} />
      </VehicleTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <VehicleModal title={`Crear ${MODEL.name}`} mode="create" open={true} onClose={() => setOpenCreate(false)} />
      )}
      {editId !== null && (
        <VehicleModal id={editId} open={true} onClose={() => setEditId(null)} title={`Editar ${MODEL.name}`} mode="update" />
      )}
      {deleteId !== null && (
        <SimpleDeleteDialog open={true} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} />
      )}
    </PageWrapper>
  );
}
