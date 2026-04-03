"use client";

import { useEffect, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";

import UserOptions from "./UserOptions";
import UserTable from "./UserTable";
import { UserColumns } from "./UserColumns";
import UserActions from "./UserActions";
import { useUsers } from "../lib/User.hook";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { deleteUser } from "../lib/User.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import DataTablePagination from "@/components/DataTablePagination";
import { USER } from "../lib/User.interface";
import UserModal from "./UserModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = USER;

export default function UserPage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, meta, isLoading, refetch } = useUsers();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const selectedUserId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarUser = selectedUserId
    ? (data?.find((u) => u.id.toString() === selectedUserId) ?? null)
    : null;
  const hasSelection = !!toolbarUser;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId);
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
      <UserActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => toolbarUser && setEditId(toolbarUser.id)}
        onDelete={() => toolbarUser && setDeleteId(toolbarUser.id)}
      />

      <UserTable
        isLoading={isLoading}
        columns={UserColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(user) => setEditId(user.id)}
      >
        <UserOptions search={search} setSearch={setSearch} />
      </UserTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <UserModal
          title={`Crear ${MODEL.name}`}
          mode="create"
          open={true}
          onClose={() => setOpenCreate(false)}
        />
      )}

      {editId !== null && (
        <UserModal
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
