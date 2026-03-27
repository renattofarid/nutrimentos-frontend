import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus, Printer } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
  excelEndpoint?: string;
  onPrint?: () => void;
  selectedCount?: number;
}

export const PurchaseActions = ({
  onCreatePurchase,
  excelEndpoint,
  onPrint,
  selectedCount = 0,
}: PurchaseActionsProps) => {
  return (
    <ActionsWrapper>
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName={`compras_${new Date().toISOString().split("T")[0]}.xlsx`}
      />
      {selectedCount === 1 && (
        <Button onClick={onPrint} size="sm" variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      )}
      <Button onClick={onCreatePurchase} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Crear Compra
      </Button>
    </ActionsWrapper>
  );
};
