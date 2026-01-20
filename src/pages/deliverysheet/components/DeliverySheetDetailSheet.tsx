import GeneralSheet from "@/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { GroupFormSection } from "@/components/GroupFormSection";
import {
  FileText,
  User,
  MapPin,
  Calendar,
  Truck,
  Wallet,
  Package,
  Receipt,
} from "lucide-react";
import type {
  DeliverySheetResource,
  DeliverySheetSale,
  DeliverySheetPayment,
} from "../lib/deliverysheet.interface";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { parse } from "date-fns";

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
    const date = parse(dateString, "yyyy-MM-dd", new Date());
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
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "PENDIENTE") return "secondary";
    if (status === "EN_REPARTO") return "default";
    if (status === "COMPLETADO") return "outline";
    if (status === "CANCELADO") return "destructive";
    return "outline";
  };

  const getDeliveryStatusVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "ENTREGADO") return "default";
    if (status === "PENDIENTE") return "secondary";
    if (status === "NO_ENTREGADO") return "destructive";
    if (status === "DEVUELTO") return "outline";
    return "outline";
  };

  const salesColumns: ColumnDef<DeliverySheetSale>[] = [
    {
      accessorKey: "full_document_number",
      header: "Documento",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {row.original.document_type}
          </span>
          <span className="font-mono font-semibold">
            {row.original.full_document_number}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "customer.full_name",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="max-w-[180px] truncate">
          {row.original.customer.full_name}
        </div>
      ),
    },
    {
      accessorKey: "issue_date",
      header: "Fecha",
      cell: ({ row }) => (
        <Badge variant="outline">{formatDate(row.original.issue_date)}</Badge>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Monto",
      cell: ({ row }) => (
        <div className="text-right font-semibold">
          S/. {row.original.total_amount}
        </div>
      ),
    },
    {
      accessorKey: "collected_amount",
      header: "Cobrado",
      cell: ({ row }) => (
        <div className="text-right font-semibold text-primary">
          S/. {row.original.collected_amount}
        </div>
      ),
    },
    {
      accessorKey: "delivery_status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={getDeliveryStatusVariant(row.original.delivery_status)}>
          {row.original.delivery_status.replace("_", " ")}
        </Badge>
      ),
    },
  ];

  const paymentsColumns: ColumnDef<DeliverySheetPayment>[] = [
    {
      accessorKey: "payment_date",
      header: "Fecha",
      cell: ({ row }) => (
        <Badge variant="outline">{formatDate(row.original.payment_date)}</Badge>
      ),
    },
    {
      accessorKey: "amount_cash",
      header: "Efectivo",
      cell: ({ row }) => (
        <div className="text-right">S/. {row.original.amount_cash}</div>
      ),
    },
    {
      accessorKey: "amount_card",
      header: "Tarjeta",
      cell: ({ row }) => (
        <div className="text-right">S/. {row.original.amount_card}</div>
      ),
    },
    {
      accessorKey: "amount_yape",
      header: "Yape",
      cell: ({ row }) => (
        <div className="text-right">S/. {row.original.amount_yape}</div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => (
        <div className="text-right font-semibold text-primary">
          S/. {row.original.total_amount}
        </div>
      ),
    },
    {
      accessorKey: "user.name",
      header: "Usuario",
      cell: ({ row }) => row.original.user.name,
    },
  ];

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Planilla #${deliverySheet.sheet_number}`}
      icon="FileText"
      size="4xl"
      className="overflow-y-auto p-2 !gap-0 w-full"
    >
      <div className="space-y-6 p-4">
        {/* Totales */}
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

        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <div>
            <span className="text-sm text-muted-foreground">N° Planilla</span>
            <p className="font-mono font-semibold">
              {deliverySheet.sheet_number}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Tipo</span>
            <div className="mt-1">
              <Badge
                variant={
                  deliverySheet.type === "CONTADO" ? "default" : "secondary"
                }
              >
                {deliverySheet.type}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Estado</span>
            <div className="mt-1">
              <Badge variant={getStatusVariant(deliverySheet.status)}>
                {deliverySheet.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Fecha de Emisión
            </span>
            <p className="font-semibold">
              {formatDate(deliverySheet.issue_date)}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Fecha de Entrega
            </span>
            <p className="font-semibold">
              {formatDate(deliverySheet.delivery_date)}
            </p>
          </div>
        </GroupFormSection>

        {/* Zona, Conductor, Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deliverySheet?.zone && (
            <GroupFormSection
              title="Zona"
              icon={MapPin}
              cols={{ sm: 1 }}
              className="h-full"
            >
              <div>
                <span className="text-sm text-muted-foreground">Nombre</span>
                <p className="font-semibold">{deliverySheet.zone.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Código</span>
                <p className="font-semibold">{deliverySheet.zone.code}</p>
              </div>
            </GroupFormSection>
          )}

          <GroupFormSection
            title="Conductor"
            icon={Truck}
            cols={{ sm: 1 }}
            className="h-full"
          >
            <div>
              <span className="text-sm text-muted-foreground">Nombre</span>
              <p className="font-semibold">
                {deliverySheet?.driver?.full_name}
              </p>
            </div>
            {deliverySheet?.driver?.document_number && (
              <div>
                <span className="text-sm text-muted-foreground">Documento</span>
                <p className="font-semibold">
                  {deliverySheet?.driver?.document_number}
                </p>
              </div>
            )}
          </GroupFormSection>

          {deliverySheet.customer && (
            <GroupFormSection
              title="Cliente Cobrador"
              icon={User}
              cols={{ sm: 1 }}
              className="h-full"
            >
              <div>
                <span className="text-sm text-muted-foreground">Nombre</span>
                <p className="font-semibold">
                  {deliverySheet.customer.full_name}
                </p>
              </div>
              {deliverySheet.customer.document_number && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Documento
                  </span>
                  <p className="font-semibold">
                    {deliverySheet.customer.document_number}
                  </p>
                </div>
              )}
            </GroupFormSection>
          )}
        </div>

        {/* Ventas */}
        <GroupFormSection
          title={`Ventas Incluidas (${deliverySheet.sales_count})`}
          icon={Package}
          cols={{ sm: 1 }}
        >
          <DataTable
            columns={salesColumns}
            data={deliverySheet.sales}
            isVisibleColumnFilter={false}
            variant="simple"
          />
        </GroupFormSection>

        {/* Pagos */}
        {deliverySheet.payments.length > 0 && (
          <GroupFormSection
            title={`Pagos Registrados (${deliverySheet.payments.length})`}
            icon={Wallet}
            cols={{ sm: 1 }}
          >
            <DataTable
              columns={paymentsColumns}
              data={deliverySheet.payments}
              isVisibleColumnFilter={false}
            />
          </GroupFormSection>
        )}

        {/* Observaciones */}
        {deliverySheet.observations && (
          <GroupFormSection
            title="Observaciones"
            icon={FileText}
            cols={{ sm: 1 }}
          >
            <p className="text-sm text-muted-foreground">
              {deliverySheet.observations}
            </p>
          </GroupFormSection>
        )}

        {/* Metadata */}
        <Separator />
        <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
          <span>
            Creado: {formatDateTime(deliverySheet.created_at)} por{" "}
            {deliverySheet.user.name}
          </span>
          <span>Actualizado: {formatDateTime(deliverySheet.updated_at)}</span>
        </div>
      </div>
    </GeneralSheet>
  );
}
