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

  const handleCerrar = () => {
    if (activeTabId) closeTab(activeTabId);
  };

  const isDraft = selectedStatus === "BORRADOR";
  const isConfirmed = selectedStatus === "CONFIRMADO";

  return (
    <div className="flex items-center justify-between mb-1 pb-1 border-b w-full">
      <div className="flex items-center gap-1">
        <Button colorIcon="green" size="sm" variant="outline" onClick={onNew}>
          <Plus />
          Nuevo
        </Button>
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
        <div className="h-6 mx-2">
          <Separator orientation="vertical" />
        </div>
        <Button colorIcon="gray" size="sm" variant="outline" onClick={handleCerrar}>
          <X />
          Cerrar
        </Button>
      </div>
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName={`documentos_almacen_${new Date().toISOString().split("T")[0]}.xlsx`}
      />
    </div>
  );
}
