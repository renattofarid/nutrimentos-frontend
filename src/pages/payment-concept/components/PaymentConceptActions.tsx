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
      <Button colorIcon="green" size="sm" variant="outline" onClick={onCreatePaymentConcept}>
        <Plus />
        Nuevo
      </Button>
    </ActionsWrapper>
  );
}
