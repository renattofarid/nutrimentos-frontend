import { useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { useMenuGroups } from "../lib/menuGroup.hook";

import MenuGroupActions from "./MenuGroupActions";
import MenuGroupTable from "./MenuGroupTable";
import MenuGroupOptions from "./MenuGroupOptions";
import { useMenuGroupStore } from "../lib/menuGroup.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { MenuGroupColumns } from "./MenuGroupColumns";
import { MENU_GROUP } from "../lib/menuGroup.interface";
import MenuGroupModal from "./MenuGroupModal";

const { MODEL } = MENU_GROUP;

export default function MenuGroupPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, isLoading, refetch } = useMenuGroups();
  const { deleteMenuGroup } = useMenuGroupStore();

  const selectedId = (() => {
    const key = Object.entries(rowSelection).find(([, v]) => v)?.[0];
    return key ? parseInt(key) : null;
  })();

  const filteredData = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((m) => m.name.toLowerCase().includes(lower));
  }, [data, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMenuGroup(deleteId);
      await refetch();
      setRowSelection({});
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, "delete")
      );
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-2">
      <MenuGroupActions
        hasSelection={!!selectedId}
        onNew={() => setCreateOpen(true)}
        onEdit={() => selectedId && setEditId(selectedId)}
        onDelete={() => selectedId && setDeleteId(selectedId)}
      />

      <MenuGroupTable
        isLoading={isLoading}
        columns={MenuGroupColumns(data)}
        data={filteredData}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(row) => setEditId(row.id)}
      >
        <MenuGroupOptions search={search} setSearch={setSearch} />
      </MenuGroupTable>

      {createOpen && (
        <MenuGroupModal
          open={true}
          onClose={() => setCreateOpen(false)}
          title={`Nuevo ${MODEL.name}`}
          mode="create"
        />
      )}

      {editId !== null && (
        <MenuGroupModal
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
    </div>
  );
}
