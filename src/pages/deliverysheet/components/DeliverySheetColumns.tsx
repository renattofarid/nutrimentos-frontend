import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Trash2, Eye, RefreshCcw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { DeliverySheetResource } from "../lib/deliverysheet.interface";

interface DeliverySheetColumnsProps {
  onDelete: (id: number) => void;
  onViewDetails: (deliverySheet: DeliverySheetResource) => void;
  onUpdateStatus: (deliverySheet: DeliverySheetResource) => void;
}

export const getDeliverySheetColumns = ({
  onDelete,
  onViewDetails,
  onUpdateStatus,
}: DeliverySheetColumnsProps): ColumnDef<DeliverySheetResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        #{row.original.id}
      </Badge>
    ),
  },
  {
    accessorKey: "sheet_number",
    header: "N° Planilla",
    cell: ({ row }) => (
      <div className="font-mono font-semibold">{row.original.sheet_number}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge
        variant={row.original.type === "CONTADO" ? "default" : "secondary"}
      >
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "outline";

      if (status === "PENDIENTE") variant = "secondary";
      if (status === "EN_REPARTO") variant = "default";
      if (status === "COMPLETADO") variant = "outline";
      if (status === "CANCELADO") variant = "destructive";

      return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
    },
  },
  {
    accessorKey: "zone",
    header: "Zona",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.zone?.name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.zone?.code}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="max-w-[180px] truncate">
        {row.original.customer?.full_name}
      </div>
    ),
  },
  {
    accessorKey: "issue_date",
    header: "F. Emisión",
    cell: ({ row }) => {
      const date = new Date(row.original.issue_date);
      return (
        <Badge variant="outline">
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Badge>
      );
    },
  },
  {
    accessorKey: "delivery_date",
    header: "F. Entrega",
    cell: ({ row }) => {
      const date = new Date(row.original.delivery_date);
      return (
        <Badge variant="outline">
          {date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sales_count",
    header: "Ventas",
    cell: ({ row }) => (
      <Badge variant="outline" className="cursor-pointer hover:bg-accent">
        {row.original.sales_count} venta(s)
      </Badge>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-semibold">S/. {row.original.total_amount}</span>
    ),
  },
  {
    accessorKey: "collected_amount",
    header: "Cobrado",
    cell: ({ row }) => (
      <span className="font-semibold text-primary">
        S/. {row.original.collected_amount}
      </span>
    ),
  },
  {
    accessorKey: "pending_amount",
    header: "Pendiente",
    cell: ({ row }) => {
      const pending = parseFloat(row.original.pending_amount);
      return (
        <span
          className={`font-semibold ${
            pending > 0 ? "text-orange-600" : "text-primary"
          }`}
        >
          S/. {row.original.pending_amount}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const canDelete = row.original.status === "PENDIENTE";
      // const canUpdateStatus =
      //   row.original.status === "PENDIENTE" ||
      //   row.original.status === "EN_REPARTO";

      return (
        <div className="flex items-center gap-1">
          <ButtonAction
            icon={Eye}
            onClick={() => onViewDetails(row.original)}
            tooltip="Ver Detalle"
          />
          <ButtonAction
            icon={RefreshCcw}
            onClick={() => onUpdateStatus(row.original)}
            canRender={false}
            tooltip="Cambiar Estado"
          />
          <ButtonAction
            icon={Trash2}
            variant="destructive"
            onClick={() => onDelete(row.original.id)}
            canRender={canDelete}
            tooltip="Eliminar"
          />
        </div>
      );
    },
  },
];
