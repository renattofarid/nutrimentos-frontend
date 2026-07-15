import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ExportButtons from "@/components/ExportButtons";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react";
import { useWindowManager } from "@/stores/window-manager.store";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "documentos-almacen";

interface Props {
  excelEndpoint?: string;
  hasSelection: boolean;
  selectedStatus?: string;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onPrint: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function WarehouseDocumentActions({
  excelEndpoint,
  hasSelection,
  selectedStatus,
  onNew,
  onEdit,
  onDelete,
  onView,
  onPrint,
  onConfirm,
  onCancel,
}: Props) {
  const { activeTabId, closeTab } = useWindowManager();
  const { can } = usePermission();

  const handleCerrar = () => {
    if (activeTabId) closeTab(activeTabId);
  };

  const isDraft = selectedStatus === "BORRADOR";
  const isConfirmed = selectedStatus === "CONFIRMADO";

  return (
    <div className="flex items-center justify-between mb-1 pb-1 border-b w-full">
      <div className="flex items-center gap-1">
        {can(ROUTE, ACTIONS.AGREGAR) && (
          <Button colorIcon="green" size="sm" variant="outline" onClick={onNew}>
            <Plus />
            Nuevo
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
        {can(ROUTE, ACTIONS.EDITAR) && (
          <Button
            colorIcon="amber"
            size="sm"
            variant="outline"
            onClick={onEdit}
            disabled={!hasSelection || !isDraft}
          >
            <Pencil />
            Editar
          </Button>
        )}
        {can(ROUTE, ACTIONS.IMPRIMIR) && (
          <Button
            colorIcon="blue"
            size="sm"
            variant="outline"
            onClick={onPrint}
            disabled={!hasSelection}
          >
            <Printer />
            Imprimir
          </Button>
        )}
        {can(ROUTE, ACTIONS.CONFIRMAR) && (
          <Button
            colorIcon="green"
            size="sm"
            variant="outline"
            onClick={onConfirm}
            disabled={!hasSelection || !isDraft}
          >
            <CheckCircle />
            Confirmar
          </Button>
        )}
        {can(ROUTE, ACTIONS.ELIMINAR) && (
          <Button
            colorIcon="red"
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={!hasSelection || !isDraft}
          >
            <Trash2 />
            Eliminar
          </Button>
        )}
        {can(ROUTE, ACTIONS.CANCELAR) && (
          <Button
            colorIcon="red"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={!hasSelection || !isConfirmed}
          >
            <XCircle />
            Cancelar
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
      {can(ROUTE, ACTIONS.EXPORTAR) && (
        <ExportButtons
          excelEndpoint={excelEndpoint}
          excelFileName={`documentos_almacen_${new Date().toISOString().split("T")[0]}.xlsx`}
        />
      )}
    </div>
  );
}
