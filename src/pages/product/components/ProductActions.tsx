import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { useWindowManager } from "@/stores/window-manager.store";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "productos";

interface Props {
  hasSelection: boolean;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export default function ProductActions({
  hasSelection,
  onNew,
  onEdit,
  onDelete,
  onView,
}: Props) {
  const { activeTabId, closeTab } = useWindowManager();
  const { can } = usePermission();

  const handleCerrar = () => {
    if (activeTabId) closeTab(activeTabId);
  };

  return (
    <div className="flex items-center justify-between mb-1 pb-1 border-b w-full">
      <div className="flex items-center gap-1">
        {can(ROUTE, ACTIONS.AGREGAR) && (
          <Button colorIcon="green" size="sm" variant="outline" onClick={onNew}>
            <Plus />
            Nuevo
          </Button>
        )}
        {can(ROUTE, ACTIONS.EDITAR) && (
          <Button
            colorIcon="amber"
            size="sm"
            variant="outline"
            onClick={onEdit}
            disabled={!hasSelection}
          >
            <Pencil />
            Editar
          </Button>
        )}
        {can(ROUTE, ACTIONS.ELIMINAR) && (
          <Button
            colorIcon="red"
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={!hasSelection}
          >
            <Trash2 />
            Eliminar
          </Button>
        )}
        {can(ROUTE, ACTIONS.VER) && (
          <Button
            colorIcon="blue"
            size="sm"
            variant="outline"
            onClick={onView}
            disabled={!hasSelection}
          >
            <Eye />
            Ver
          </Button>
        )}
        <div className="h-6 mx-2">
          <Separator orientation="vertical" />
        </div>
        <Button colorIcon="gray" size="sm" variant="outline" onClick={handleCerrar}>
          <X />
          Cerrar
        </Button>
      </div>
    </div>
  );
}
