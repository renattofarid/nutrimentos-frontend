import { Card, CardContent } from "@/components/ui/card";
import type { DeliverySheetResource } from "../../lib/deliverysheet.interface";

interface SettlementSummaryProps {
  deliverySheet: DeliverySheetResource;
}

export function SettlementSummary({ deliverySheet }: SettlementSummaryProps) {
  const totalBoletas = deliverySheet.sales.length;
  const montoTotal = deliverySheet.sales
    .reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0)
    .toFixed(2);
  const totalPendiente = deliverySheet.sales
    .reduce((sum, sale) => sum + parseFloat(sale.current_amount), 0)
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
