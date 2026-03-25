import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettlementHeaderProps {
  sheetNumber?: string;
  onBack: () => void;
}

export const SettlementTitle = "Pago Planilla Cobranza";

export function SettlementHeader({
  onBack,
}: SettlementHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
