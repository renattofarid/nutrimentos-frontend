import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

export const PurchaseActions = ({
  onCreatePurchase,
  onExport,
  isExporting = false
}: PurchaseActionsProps) => {
  return (
    <ActionsWrapper>
      <Button
        onClick={onExport}
        size="sm"
        variant="outline"
        disabled={isExporting}
      >
        <FileDown className="mr-2 h-4 w-4" />
        {isExporting ? "Exportando..." : "Exportar Excel"}
      </Button>
      <Button onClick={onCreatePurchase} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Crear Compra
      </Button>
    </ActionsWrapper>
  );
};
