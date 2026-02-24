import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";
import type { BoxMovementResource } from "../lib/box-movement.interface";
import { Separator } from "@/components/ui/separator";

interface BoxMovementDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: BoxMovementResource | null;
}

function BoxMovementDetailSheet({
  open,
  onOpenChange,
  movement,
}: BoxMovementDetailSheetProps) {
  if (!movement) return null;

  const isIncome = movement.type === "INGRESO";

  const paymentMethodsArray = Object.entries(
    movement.payment_methods || {}
  ).filter(([_, amount]) => parseFloat(amount) > 0);

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalle del Movimiento"
      subtitle={movement.number_movement}
      icon="ArrowLeftRight"
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 md:gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <Badge
                color={isIncome ? "default" : "secondary"}
                className={isIncome ? "bg-green-600" : "bg-red-600"}
              >
                {movement.type}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-muted-foreground">Concepto:</span>
              <span className="font-medium text-sm text-right flex-1">
                {movement.concept}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Fecha:
              </span>
              <span className="font-medium text-sm text-right">
                {new Date(movement.movement_date).toLocaleString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monto Total */}
        <Card
          className={
            isIncome
              ? "border-green-200 bg-green-50/50"
              : "border-red-200 bg-red-50/50"
          }
        >
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Monto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-4xl font-bold ${
                isIncome ? "text-green-600" : "text-red-600"
              }`}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(movement.total_amount)}
            </p>
          </CardContent>
        </Card>

        {/* Métodos de Pago */}
        {paymentMethodsArray.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Métodos de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethodsArray.map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {method}
                  </span>
                  <span className="font-semibold text-base">
                    {formatCurrency(parseFloat(amount))}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Comentario */}
        {movement.comment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Comentario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {movement.comment}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 md:gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ID Caja:</span>
              <span className="font-medium">#{movement.box_id}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ID Turno:</span>
              <span className="font-medium">#{movement.box_shift_id}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Usuario:</span>
              <span className="font-medium">#{movement.user_id}</span>
            </div>

            {movement.customer_id > 0 && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Cliente:
                  </span>
                  <span className="font-medium">#{movement.customer_id}</span>
                </div>
              </>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Creado:</span>
              <span className="text-xs text-muted-foreground">
                {new Date(movement.created_at).toLocaleString("es-ES")}
              </span>
            </div>

            {movement.updated_at !== movement.created_at && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Actualizado:
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(movement.updated_at).toLocaleString("es-ES")}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </GeneralSheet>
  );
}

export default BoxMovementDetailSheet;
