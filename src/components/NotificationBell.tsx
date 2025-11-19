import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { useExpiringAlerts } from "@/pages/purchaseinstallment/lib/purchaseinstallment.hook";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export function NotificationBell() {
  const { data: alerts, isLoading } = useExpiringAlerts();
  const navigate = useNavigate();

  const alertCount = alerts?.length || 0;

  const handleAlertClick = (purchaseId: number) => {
    navigate(`/compras/detalle/${purchaseId}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {alertCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Cuotas por Vencer</h4>
            {alertCount > 0 && <Badge variant="secondary">{alertCount}</Badge>}
          </div>
          <Separator />
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Cargando...
            </div>
          ) : alertCount === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No hay cuotas por vencer
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {alerts?.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
                    onClick={() => handleAlertClick(alert.purchase_id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold">
                        {alert.purchase_correlativo}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Cuota {alert.installment_number}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vence:{" "}
                      {new Date(alert.due_date).toLocaleDateString("es-PE")}
                    </div>
                    <div className="text-sm font-semibold mt-1">
                      S/. {parseFloat(alert.pending_amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
