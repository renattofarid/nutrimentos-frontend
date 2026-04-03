import { useEffect, useState } from "react";
import { useBranch } from "../lib/branch.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import BranchActions from "./BranchActions";
import BranchTable from "./BranchTable";
import BranchOptions from "./BranchOptions";
import { deleteBranch } from "../lib/branch.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { BranchColumns } from "./BranchColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { BRANCH } from "../lib/branch.interface";
import BranchModal from "./BranchModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = BRANCH;

export default function BranchPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useBranch();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const selectedBranchId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarBranch = selectedBranchId
    ? (data?.find((b) => b.id.toString() === selectedBranchId) ?? null)
    : null;
  const hasSelection = !!toolbarBranch;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBranch(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageWrapper>
      <BranchActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => toolbarBranch && setEditId(toolbarBranch.id)}
        onDelete={() => toolbarBranch && setDeleteId(toolbarBranch.id)}
      />

      <BranchTable
        isLoading={isLoading}
        columns={BranchColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(branch) => setEditId(branch.id)}
      >
        <BranchOptions search={search} setSearch={setSearch} />
      </BranchTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <BranchModal
          title={`Crear ${MODEL.name}`}
          mode="create"
          open={true}
          onClose={() => setOpenCreate(false)}
        />
      )}

      {editId !== null && (
        <BranchModal
          id={editId}
          open={true}
          onClose={() => setEditId(null)}
          title={`Editar ${MODEL.name}`}
          mode="update"
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </PageWrapper>
  );
}
