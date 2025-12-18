import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  User,
  MapPin,
  Calendar,
  Truck,
  Receipt,
  Wallet,
  Package,
} from "lucide-react";
import type { DeliverySheetResource } from "../lib/deliverysheet.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeliverySheetDetailSheetProps {
  deliverySheet: DeliverySheetResource | null;
  open: boolean;
  onClose: () => void;
}

export default function DeliverySheetDetailSheet({
  deliverySheet,
  open,
  onClose,
}: DeliverySheetDetailSheetProps) {
  if (!deliverySheet) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "PENDIENTE") return "secondary";
    if (status === "EN_REPARTO") return "default";
    if (status === "COMPLETADO") return "outline";
    if (status === "CANCELADO") return "destructive";
    return "outline";
  };

  const getDeliveryStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "ENTREGADO") return "default";
    if (status === "PENDIENTE") return "secondary";
    if (status === "NO_ENTREGADO") return "destructive";
    if (status === "DEVUELTO") return "outline";
    return "outline";
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Planilla #${deliverySheet.sheet_number}`}
      icon="FileText"
      size="3xl"
      className="overflow-y-auto p-2 !gap-0 w-full"
    >
      <div className="space-y-4 p-4">
        {/* Header con totales destacados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-muted-foreground truncate">
                    S/. {deliverySheet.total_amount}
                  </p>
                </div>
                <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Cobrado
                  </p>
                  <p className="text-2xl font-bold text-primary truncate">
                    S/. {deliverySheet.collected_amount}
                  </p>
                </div>
                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-none transition-colors !p-0 ${
              parseFloat(deliverySheet.pending_amount) === 0
                ? "bg-primary/5 hover:bg-primary/10"
                : "bg-destructive/5 hover:bg-destructive/10"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Pendiente
                  </p>
                  <p
                    className={`text-2xl font-bold truncate ${
                      parseFloat(deliverySheet.pending_amount) === 0
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    S/. {deliverySheet.pending_amount}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    parseFloat(deliverySheet.pending_amount) === 0
                      ? "bg-primary/10"
                      : "bg-destructive/10"
                  }`}
                >
                  <Package
                    className={`h-5 w-5 ${
                      parseFloat(deliverySheet.pending_amount) === 0
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información de la Planilla */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Información de la Planilla
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">N° Planilla:</span>
              <span className="font-mono font-semibold">
                {deliverySheet.sheet_number}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tipo:</span>
              <Badge
                variant={
                  deliverySheet.type === "CONTADO" ? "default" : "secondary"
                }
              >
                {deliverySheet.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(deliverySheet.status)}>
                {deliverySheet.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">F. Emisión:</span>
              <span className="font-medium">
                {formatDate(deliverySheet.issue_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">F. Entrega:</span>
              <span className="font-medium">
                {formatDate(deliverySheet.delivery_date)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Información de Zona, Conductor y Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Zona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold">{deliverySheet.zone.name}</p>
              <p className="text-muted-foreground">{deliverySheet.zone.code}</p>
            </CardContent>
          </Card>

          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Conductor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold">{deliverySheet.driver.full_name}</p>
              {deliverySheet.driver.document_number && (
                <p className="text-muted-foreground">
                  {deliverySheet.driver.document_number}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente Cobrador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold">{deliverySheet.customer.full_name}</p>
              {deliverySheet.customer.document_number && (
                <p className="text-muted-foreground">
                  {deliverySheet.customer.document_number}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ventas Incluidas */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ventas Incluidas ({deliverySheet.sales_count})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Cobrado</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliverySheet.sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {sale.document_type}
                          </span>
                          <span className="font-mono font-semibold">
                            {sale.full_document_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate">
                          {sale.customer.full_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatDate(sale.issue_date)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        S/. {sale.total_amount}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        S/. {sale.collected_amount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getDeliveryStatusVariant(
                            sale.delivery_status
                          )}
                        >
                          {sale.delivery_status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagos Registrados */}
        {deliverySheet.payments.length > 0 && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Pagos Registrados ({deliverySheet.payments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Efectivo</TableHead>
                      <TableHead className="text-right">Tarjeta</TableHead>
                      <TableHead className="text-right">Yape</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Usuario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliverySheet.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {formatDate(payment.payment_date)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          S/. {payment.amount_cash}
                        </TableCell>
                        <TableCell className="text-right">
                          S/. {payment.amount_card}
                        </TableCell>
                        <TableCell className="text-right">
                          S/. {payment.amount_yape}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          S/. {payment.total_amount}
                        </TableCell>
                        <TableCell>{payment.user.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {deliverySheet.observations && (
          <Card className="!gap-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {deliverySheet.observations}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="!gap-0 bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                Creado: {formatDateTime(deliverySheet.created_at)} por{" "}
                {deliverySheet.user.name}
              </div>
              <div>Actualizado: {formatDateTime(deliverySheet.updated_at)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GeneralSheet>
  );
}
