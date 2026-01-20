import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TitleComponent from "@/components/TitleComponent";

interface SettlementHeaderProps {
  sheetNumber?: string;
  onBack: () => void;
}

export function SettlementHeader({ sheetNumber, onBack }: SettlementHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <TitleComponent
        title="Rendición de Planilla"
        subtitle={`Planilla ${sheetNumber} - Registre el estado y cobro de cada boleta`}
        icon="Receipt"
      />
    </div>
  );
}
