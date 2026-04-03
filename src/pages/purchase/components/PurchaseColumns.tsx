import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseResource } from "../lib/purchase.interface";

export const getPurchaseColumns = (): ColumnDef<PurchaseResource>[] => [
  {
    accessorKey: "correlativo",
    header: "Correlativo",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.correlativo}
      </Badge>
    ),
  },
  {
    accessorKey: "document_number",
    header: "Número Doc.",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-xs text-muted-foreground">
          {row.original.document_type}
        </span>
        <span className="font-mono font-semibold">
          {row.original.document_number}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "supplier_fullname",
    header: "Proveedor",
    cell: ({ row }) => (
      <div
        className="max-w-[200px] truncate"
        title={row.original.supplier_fullname}
      >
        {row.original.supplier_fullname}
      </div>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ row }) => <span>{row.original.warehouse_name || "N/A"}</span>,
  },
  {
    accessorKey: "issue_date",
    header: "Fecha Emisión",
    cell: ({ row }) => {
      const date = new Date(row.original.issue_date);
      return (
        <span>
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "payment_type",
    header: "Tipo Pago",
    cell: ({ row }) => (
      <Badge
        color={
          row.original.payment_type === "CONTADO" ? "default" : "secondary"
        }
      >
        {row.original.payment_type}
      </Badge>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => {
      const currency =
        row.original.currency === "PEN"
          ? "S/."
          : row.original.currency === "USD"
            ? "$"
            : "€";
      return (
        <span className="font-semibold">
          {currency} {parseFloat(row.original.total_amount).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "current_amount",
    header: "Saldo",
    cell: ({ row }) => {
      const currency =
        row.original.currency === "PEN"
          ? "S/."
          : row.original.currency === "USD"
            ? "$"
            : "€";
      const currentAmount = parseFloat(row.original.current_amount);
      const isPaid = currentAmount === 0;

      return (
        <span
          className={`font-semibold ${
            isPaid ? "text-primary" : "text-orange-600"
          }`}
        >
          {currency} {currentAmount.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" = "default";

      if (status === "REGISTRADO") variant = "secondary";
      if (status === "PAGADA") variant = "default";
      if (status === "CANCELADO") variant = "destructive";

      return <Badge color={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "details",
    header: "Detalles",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.details?.length || 0} item(s)</Badge>
    ),
  },
  {
    accessorKey: "installments",
    header: "Cuotas",
    cell: ({ row }) => {
      const hasPendingPayments = row.original.installments?.some(
        (inst) => parseFloat(inst.pending_amount) > 0,
      );

      // Recalcular el total esperado desde detalles aplicando lógica de IGV (igual que el form)
      const IGV_RATE = 0.18;
      const includeIgv = row.original.include_igv;
      const computedTotal =
        (row.original.details?.reduce((sum, d) => {
          const qty =
            d.quantity_sacks > 0 ? d.quantity_sacks : d.quantity_kg;
          const price = Number(d.unit_price);
          const subtotal = qty * price;
          return sum + (includeIgv ? subtotal : subtotal * (1 + IGV_RATE));
        }, 0) ?? parseFloat(row.original.total_amount)) -
        (row.original.discount_global || 0);

      const sumOfInstallments =
        row.original.installments?.reduce(
          (sum, inst) => sum + parseFloat(inst.amount),
          0,
        ) || 0;
      const isValid = Math.abs(computedTotal - sumOfInstallments) < 0.01;

      return (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {row.original.installments?.length || 0} cuota(s)
            </Badge>

            {!isValid && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    La suma de cuotas ({sumOfInstallments.toFixed(2)}) no
                    coincide con el total ({computedTotal.toFixed(2)}).
                    <br />
                    Por favor, sincronice las cuotas.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {hasPendingPayments && !isValid && (
              <span className="text-xs text-muted-foreground">
                Sincronizar cuotas
              </span>
            )}
          </div>
        </TooltipProvider>
      );
    },
  },
];
