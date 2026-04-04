import { useEffect, useState } from "react";
import { useBox } from "../lib/box.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import BoxActions from "./BoxActions";
import BoxTable from "./BoxTable";
import BoxOptions from "./BoxOptions";
import { deleteBox, updateBox } from "../lib/box.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { BoxColumns } from "./BoxColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { BOX } from "../lib/box.interface";
import BoxModal from "./BoxModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import UserBoxAssignmentModal from "@/pages/userboxassignment/components/UserBoxAssignmentModal";
import BoxAssignmentsSheet from "./BoxAssignmentsSheet";
import { StatusChangeDialog } from "./StatusChangeDialog";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = BOX;

export default function BoxPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assignBoxId, setAssignBoxId] = useState<number | null>(null);
  const [viewAssignmentsBoxId, setViewAssignmentsBoxId] = useState<number | null>(null);
  const [statusChangeData, setStatusChangeData] = useState<{
    id: number;
    currentStatus: string;
  } | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useBox();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const selectedBoxId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarBox = selectedBoxId
    ? (data?.find((b) => b.id.toString() === selectedBoxId) ?? null)
    : null;
  const hasSelection = !!toolbarBox;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBox(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  const confirmStatusChange = async () => {
    if (!statusChangeData) return;
    try {
      const newStatus =
        statusChangeData.currentStatus === "Activo" ? "Inactivo" : "Activo";
      await updateBox(statusChangeData.id, { status: newStatus });
      await refetch();
      successToast(`Estado actualizado a ${newStatus}`);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al actualizar el estado",
        ERROR_MESSAGE(MODEL, "update"),
      );
    } finally {
      setStatusChangeData(null);
    }
  };

  return (
    <PageWrapper>
      <BoxActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => toolbarBox && setEditId(toolbarBox.id)}
        onDelete={() => toolbarBox && setDeleteId(toolbarBox.id)}
        onAssign={() => toolbarBox && setAssignBoxId(toolbarBox.id)}
        onViewAssignments={() => toolbarBox && setViewAssignmentsBoxId(toolbarBox.id)}
        onToggleStatus={() =>
          toolbarBox &&
          setStatusChangeData({ id: toolbarBox.id, currentStatus: toolbarBox.status })
        }
      />

      <BoxTable
        isLoading={isLoading}
        columns={BoxColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(box) => setEditId(box.id)}
      >
        <BoxOptions search={search} setSearch={setSearch} />
      </BoxTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <BoxModal
          title={`Crear ${MODEL.name}`}
          mode="create"
          open={true}
          onClose={() => setOpenCreate(false)}
        />
      )}

      {editId !== null && (
        <BoxModal
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

      {assignBoxId !== null && (
        <UserBoxAssignmentModal
          open={true}
          onClose={() => setAssignBoxId(null)}
          title="Asignar Usuario a Caja"
          mode="create"
          preselectedBoxId={assignBoxId}
          preselectedBoxName={data?.find((box) => box.id === assignBoxId)?.name}
        />
      )}

      {viewAssignmentsBoxId !== null && (
        <BoxAssignmentsSheet
          open={true}
          onOpenChange={(open) => !open && setViewAssignmentsBoxId(null)}
          boxId={viewAssignmentsBoxId}
          boxName={
            data?.find((box) => box.id === viewAssignmentsBoxId)?.name || ""
          }
        />
      )}

      {statusChangeData !== null && (
        <StatusChangeDialog
          open={true}
          onOpenChange={(open) => !open && setStatusChangeData(null)}
          onConfirm={confirmStatusChange}
          currentStatus={statusChangeData.currentStatus}
          newStatus={
            statusChangeData.currentStatus === "Activo" ? "Inactivo" : "Activo"
          }
        />
      )}
    </PageWrapper>
  );
}
