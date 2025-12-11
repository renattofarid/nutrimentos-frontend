import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
  excelEndpoint?: string;
}

export const PurchaseActions = ({
  onCreatePurchase,
  excelEndpoint,
}: PurchaseActionsProps) => {
  return (
    <ActionsWrapper>
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName={`compras_${new Date().toISOString().split("T")[0]}.xlsx`}
      />
      <Button onClick={onCreatePurchase} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Crear Compra
      </Button>
    </ActionsWrapper>
  );
};
