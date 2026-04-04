import { useEffect, useState } from "react";
import { useRoles } from "../lib/role.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import RoleActions from "./RoleActions";
import RoleTable from "./RoleTable";
import RoleOptions from "./RoleOptions";
import { deleteRole } from "../lib/role.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { RoleColumns } from "./RoleColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { ROLE } from "../lib/role.interface";
import RoleModal from "./RoleModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = ROLE;

export default function RolePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useRoles();

  useEffect(() => {
    refetch({ params: { page, search, per_page } });
  }, [page, search, per_page]);

  const selectedRoleId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarRole = selectedRoleId
    ? (data?.find((r) => r.id.toString() === selectedRoleId) ?? null)
    : null;
  const hasSelection = !!toolbarRole;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRole(deleteId);
      await refetch({ params: { page, search, per_page } });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageWrapper>
      <RoleActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => toolbarRole && setEditId(toolbarRole.id)}
        onDelete={() => toolbarRole && setDeleteId(toolbarRole.id)}
      />

      <RoleTable
        isLoading={isLoading}
        columns={RoleColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(role) => setEditId(role.id)}
      >
        <RoleOptions search={search} setSearch={setSearch} />
      </RoleTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <RoleModal
          open={true}
          onOpenChange={(open) => !open && setOpenCreate(false)}
          onSuccess={() => {
            setOpenCreate(false);
            refetch({ params: { page } });
          }}
        />
      )}

      {editId !== null && (
        <RoleModal
          roleId={editId}
          open={true}
          onOpenChange={(open) => !open && setEditId(null)}
          onSuccess={() => {
            setEditId(null);
            refetch({ params: { page } });
          }}
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
