import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, X, Eye, UserPlus, RefreshCw } from "lucide-react";
import { useWindowManager } from "@/stores/window-manager.store";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "caja";

interface Props {
  hasSelection: boolean;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
  onViewAssignments: () => void;
  onToggleStatus: () => void;
}

export default function BoxActions({
  hasSelection,
  onNew,
  onEdit,
  onDelete,
  onAssign,
  onViewAssignments,
  onToggleStatus,
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
        <div className="h-6 mx-2">
          <Separator orientation="vertical" />
        </div>
        {can(ROUTE, ACTIONS.VER_ASIGNACIONES) && (
          <Button
            colorIcon="blue"
            size="sm"
            variant="outline"
            onClick={onViewAssignments}
            disabled={!hasSelection}
          >
            <Eye />
            Ver Asignaciones
          </Button>
        )}
        {can(ROUTE, ACTIONS.ASIGNAR_USUARIO) && (
          <Button
            size="sm"
            variant="outline"
            onClick={onAssign}
            disabled={!hasSelection}
          >
            <UserPlus />
            Asignar Usuario
          </Button>
        )}
        {can(ROUTE, ACTIONS.CAMBIAR_ESTADO) && (
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleStatus}
            disabled={!hasSelection}
          >
            <RefreshCw />
            Cambiar Estado
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
