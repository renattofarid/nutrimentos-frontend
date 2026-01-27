import { Card, CardContent } from "@/components/ui/card";
import type { DeliverySheetById } from "../../lib/deliverysheet.interface";
import { parseFormattedNumber } from "@/lib/utils";

interface SettlementSummaryProps {
  deliverySheet: DeliverySheetById;
}

export function SettlementSummary({ deliverySheet }: SettlementSummaryProps) {
  const totalBoletas = deliverySheet.sheet_sales.length;
  const montoTotal = deliverySheet.sheet_sales
    .reduce(
      (sum, sheetSale) => sum + parseFormattedNumber(sheetSale.original_amount),
      0
    )
    .toFixed(2);
  const totalPendiente = deliverySheet.sheet_sales
    .reduce((sum, sheetSale) => {
      const creditNotesTotal = sheetSale.sale.credit_notes_total_raw || 0;
      const currentAmount = parseFormattedNumber(sheetSale.current_amount);
      return sum + (currentAmount - creditNotesTotal);
    }, 0)
    .toFixed(2);

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total de Boletas</p>
            <p className="text-2xl font-bold">{totalBoletas}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monto Total</p>
            <p className="text-2xl font-bold">S/. {montoTotal}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Pendiente</p>
            <p className="text-2xl font-bold">S/. {totalPendiente}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
