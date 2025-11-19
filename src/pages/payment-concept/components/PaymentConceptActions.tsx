import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PaymentConceptActionsProps {
  onCreatePaymentConcept: () => void;
}

export default function PaymentConceptActions({
  onCreatePaymentConcept,
}: PaymentConceptActionsProps) {
  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={onCreatePaymentConcept}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </ActionsWrapper>
  );
}
