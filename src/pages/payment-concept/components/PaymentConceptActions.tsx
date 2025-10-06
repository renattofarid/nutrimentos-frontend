import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PaymentConceptActionsProps {
  onCreatePaymentConcept: () => void;
}

export default function PaymentConceptActions({
  onCreatePaymentConcept,
}: PaymentConceptActionsProps) {
  return (
    <div className="flex justify-end">
      <Button onClick={onCreatePaymentConcept}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </div>
  );
}
