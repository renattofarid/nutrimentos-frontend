import { useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { usePermissionsCrud } from "../lib/permission.hook";
import { useMenuGroups } from "@/pages/menu-group/lib/menuGroup.hook";

import PermissionActions from "./PermissionActions";
import PermissionTable from "./PermissionTable";
import PermissionOptions from "./PermissionOptions";
import { usePermissionCrudStore } from "../lib/permission.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PermissionColumns } from "./PermissionColumns";
import { PERMISSION } from "../lib/permission.interface";
import PermissionModal from "./PermissionModal";
import PermissionBulkModal from "./PermissionBulkModal";
import { cn } from "@/lib/utils";

const { MODEL } = PERMISSION;

export default function PermissionPage() {
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data: permissions, isLoading, refetch } = usePermissionsCrud();
  const { data: menuGroups } = useMenuGroups();
  const { deletePermission } = usePermissionCrudStore();

  const selectedId = (() => {
    const key = Object.entries(rowSelection).find(([, v]) => v)?.[0];
    return key ? parseInt(key) : null;
  })();

  const groupCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    permissions.forEach((p) => {
      counts[p.group_menu_id] = (counts[p.group_menu_id] ?? 0) + 1;
    });
    return counts;
  }, [permissions]);

  const filteredData = useMemo(() => {
    let result = permissions;
    if (selectedGroupId !== null) {
      result = result.filter((p) => p.group_menu_id === selectedGroupId);
    }
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.route.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [permissions, selectedGroupId, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePermission(deleteId);
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
      <PermissionActions
        hasSelection={!!selectedId}
        onNew={() => setCreateOpen(true)}
        onBulkCreate={() => setBulkOpen(true)}
        onEdit={() => selectedId && setEditId(selectedId)}
        onDelete={() => selectedId && setDeleteId(selectedId)}
      />

      <div className="flex gap-4 items-start w-full">
        <div className="hidden md:flex flex-col w-56 shrink-0 border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setSelectedGroupId(null)}
            className={cn(
              "text-left px-3 py-2 text-sm hover:bg-muted border-b",
              selectedGroupId === null && "bg-primary/10 font-semibold"
            )}
          >
            Todos ({permissions.length})
          </button>
          {menuGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroupId(group.id)}
              className={cn(
                "text-left px-3 py-2 text-sm hover:bg-muted border-b last:border-b-0 flex justify-between",
                selectedGroupId === group.id && "bg-primary/10 font-semibold"
              )}
            >
              <span className="truncate">{group.name}</span>
              <span className="text-muted-foreground">
                {groupCounts[group.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <PermissionTable
            isLoading={isLoading}
            columns={PermissionColumns()}
            data={filteredData}
            enableRowSelection={true}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onRowDoubleClick={(row) => setEditId(row.id)}
          >
            <PermissionOptions search={search} setSearch={setSearch} />
          </PermissionTable>
        </div>
      </div>

      {createOpen && (
        <PermissionModal
          open={true}
          onClose={() => setCreateOpen(false)}
          title={`Nuevo ${MODEL.name}`}
          mode="create"
        />
      )}

      {bulkOpen && (
        <PermissionBulkModal open={true} onClose={() => setBulkOpen(false)} />
      )}

      {editId !== null && (
        <PermissionModal
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
