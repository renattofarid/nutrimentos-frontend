import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, X, Layers, Sparkles } from "lucide-react";
import { useWindowManager } from "@/stores/window-manager.store";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "permisos";

interface Props {
  hasSelection?: boolean;
  onNew?: () => void;
  onBulkCreate?: () => void;
  onGenerateSystem?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PermissionActions({
  hasSelection = false,
  onNew,
  onBulkCreate,
  onGenerateSystem,
  onEdit,
  onDelete,
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
          <Button
            colorIcon="green"
            size="sm"
            variant="outline"
            onClick={onNew ?? (() => {})}
          >
            <Plus /> Nuevo
          </Button>
        )}
        {can(ROUTE, ACTIONS.CREAR_EN_LOTE) && (
          <Button
            colorIcon="indigo"
            size="sm"
            variant="outline"
            onClick={onBulkCreate ?? (() => {})}
          >
            <Layers /> Crear en lote
          </Button>
        )}
        {can(ROUTE, ACTIONS.AGREGAR) && false && (
          <Button
            colorIcon="violet"
            size="sm"
            variant="outline"
            onClick={onGenerateSystem ?? (() => {})}
          >
            <Sparkles /> Generar permisos
          </Button>
        )}
        {can(ROUTE, ACTIONS.EDITAR) && (
          <Button
            colorIcon="amber"
            size="sm"
            variant="outline"
            onClick={onEdit ?? (() => {})}
            disabled={!hasSelection}
          >
            <Pencil /> Editar
          </Button>
        )}
        {can(ROUTE, ACTIONS.ELIMINAR) && (
          <Button
            colorIcon="red"
            size="sm"
            variant="outline"
            onClick={onDelete ?? (() => {})}
            disabled={!hasSelection}
          >
            <Trash2 /> Eliminar
          </Button>
        )}
        <div className="h-6 mx-2">
          <Separator orientation="vertical" />
        </div>
        <Button
          colorIcon="gray"
          size="sm"
          variant="outline"
          onClick={handleCerrar}
        >
          <X /> Cerrar
        </Button>
      </div>
    </div>
  );
}
