import { useParams, useNavigate } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import {
  Loader,
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePurchaseById } from "../lib/purchase.hook";
import {
  PURCHASE,
  type PurchaseDetailResource,
} from "../lib/purchase.interface";

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: purchase, isFinding } = usePurchaseById(Number(id));

  const { MODEL, ICON, ROUTE } = PURCHASE;

  if (isFinding || !purchase) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive"
  > = {
    PENDIENTE: "secondary",
    APROBADA: "default",
    RECHAZADA: "destructive",
    CANCELADA: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={`${MODEL.name} - ${purchase.correlativo}`}
          subtitle={`Detalle de la ${MODEL.name.toLowerCase()}`}
          icon={ICON}
        />
        <Button variant="outline" onClick={() => navigate(ROUTE)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Información General */}
      <div className="bg-sidebar p-6 rounded-lg space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Información General</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Proveedor</p>
            <p className="font-semibold">{purchase.supplier_fullname}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Almacén</p>
            <p className="font-semibold">{purchase.warehouse_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Usuario</p>
            <p className="font-semibold">{purchase.user_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Documento</p>
            <Badge variant="outline">{purchase.document_type}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Número de Documento</p>
            <p className="font-semibold font-mono">
              {purchase.document_number}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <Badge variant={statusVariants[purchase.status] || "default"}>
              {purchase.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Información de Fechas */}
      <div className="bg-sidebar p-6 rounded-lg space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Fechas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
            <p className="font-semibold">
              {new Date(purchase.issue_date).toLocaleDateString("es-PE")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Creación</p>
            <p className="font-semibold">
              {new Date(purchase.created_at).toLocaleDateString("es-PE")}
            </p>
          </div>
        </div>
      </div>

      {/* Información de Pago */}
      <div className="bg-sidebar p-6 rounded-lg space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Información de Pago</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Pago</p>
            <Badge
              variant={
                purchase.payment_type === "CONTADO" ? "default" : "secondary"
              }
            >
              {purchase.payment_type}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Moneda</p>
            <p className="font-semibold">{purchase.currency}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">
              {purchase.currency === "PEN" ? "S/." : "$"}{" "}
              {parseFloat(purchase.total_amount).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Detalles de Compra */}
      <div className="bg-sidebar p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold">Detalles de Compra</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">IGV</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase.details.map((detail: PurchaseDetailResource) => (
              <TableRow key={detail.id}>
                <TableCell className="font-mono">
                  {detail.product.codigo}
                </TableCell>
                <TableCell>{detail.product.name}</TableCell>
                <TableCell className="text-right">{detail.quantity}</TableCell>
                <TableCell className="text-right">
                  {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {detail.unit_price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {detail.subtotal.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {detail.tax.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {detail.total.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cuotas (si existen) */}
      {purchase.installments && purchase.installments.length > 0 && (
        <div className="bg-sidebar p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Cuotas</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correlativo</TableHead>
                <TableHead>Nro. Cuota</TableHead>
                <TableHead>Días Venc.</TableHead>
                <TableHead>Fecha Venc.</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Pendiente</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.installments.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell className="font-mono">
                    {installment.correlativo}
                  </TableCell>
                  <TableCell>{installment.installment_number}</TableCell>
                  <TableCell>{installment.due_days}</TableCell>
                  <TableCell>
                    {new Date(installment.due_date).toLocaleDateString("es-PE")}
                  </TableCell>
                  <TableCell className="text-right">
                    {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                    {parseFloat(installment.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {purchase.currency === "PEN" ? "S/." : "$"}{" "}
                    {parseFloat(installment.pending_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        installment.status === "PENDIENTE"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {installment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {purchase.observations && (
        <div className="bg-sidebar p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Observaciones</h3>
          <p className="text-muted-foreground">{purchase.observations}</p>
        </div>
      )}
    </div>
  );
}
