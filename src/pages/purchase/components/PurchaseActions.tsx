import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PurchaseActionsProps {
  onCreatePurchase: () => void;
}

export const PurchaseActions = ({ onCreatePurchase }: PurchaseActionsProps) => {
  return (
    <ActionsWrapper>
      <Button onClick={onCreatePurchase} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Crear Compra
      </Button>
    </ActionsWrapper>
  );
};
