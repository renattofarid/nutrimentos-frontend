import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TitleComponent from "@/components/TitleComponent";

interface SettlementHeaderProps {
  sheetNumber?: string;
  onBack: () => void;
}

export function SettlementHeader({
  sheetNumber,
  onBack,
}: SettlementHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <TitleComponent
        title="Rendición de Planilla"
        subtitle={
          sheetNumber
            ? `Planilla ${sheetNumber} - Registre el estado y cobro de cada boleta`
            : "Seleccione una planilla para comenzar la rendición"
        }
        icon="Receipt"
      />
    </div>
  );
}
