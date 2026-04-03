import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import {
  Eye,
  PanelRightOpen,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import ExportButtons from "@/components/ExportButtons";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
  hasSelection: boolean;
  canEditOrDelete: boolean;
  canQuickPay: boolean;
  onViewDetails: () => void;
  onManage: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onQuickPay: () => void;
  onClose: () => void;
  excelEndpoint?: string;
  onPrint: () => void;
}

export const PurchaseActions = ({
  onCreatePurchase,
  hasSelection,
  canEditOrDelete,
  canQuickPay,
  onViewDetails,
  onManage,
  onEdit,
  onDelete,
  onQuickPay,
  onClose,
  excelEndpoint,
  onPrint,
}: PurchaseActionsProps) => {
  return (
    <ActionsWrapper>
      <Button
        onClick={onCreatePurchase}
        size="sm"
        variant="outline"
        colorIcon="green"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo
      </Button>

      <Button
        onClick={onViewDetails}
        size="sm"
        variant="outline"
        disabled={!hasSelection}
        colorIcon="blue"
      >
        <Eye className="mr-2 h-4 w-4" />
        Ver detalle
      </Button>

      <Button
        onClick={onManage}
        size="sm"
        variant="outline"
        disabled={!hasSelection}
        colorIcon="orange"
      >
        <PanelRightOpen className="mr-2 h-4 w-4" />
        Gestionar
      </Button>

      <Button
        onClick={onEdit}
        size="sm"
        variant="outline"
        disabled={!canEditOrDelete}
        colorIcon="yellow"
      >
        <Pencil className="mr-2 h-4 w-4" />
        Editar
      </Button>

      <Button
        onClick={onDelete}
        size="sm"
        variant="outline"
        disabled={!canEditOrDelete}
        colorIcon="red"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </Button>

      <Button
        onClick={onQuickPay}
        size="sm"
        variant="outline"
        disabled={!canQuickPay}
        colorIcon="teal"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Pago rápido
      </Button>

      <Button
        onClick={onPrint}
        size="sm"
        variant="outline"
        disabled={!hasSelection}
        colorIcon="gray"
      >
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>

      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName={`compras_${new Date().toISOString().split("T")[0]}.xlsx`}
      />

      <Button onClick={onClose} size="sm" variant="outline">
        <X className="mr-2 h-4 w-4" />
        Cerrar
      </Button>
    </ActionsWrapper>
  );
};
