import type { PurchaseCreditNoteResource } from "../lib/purchase-credit-note.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const PurchaseCreditNoteColumns = (_options?: {
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}): ColumnDef<PurchaseCreditNoteResource>[] => [
  {
    accessorKey: "full_document_number",
    header: "N° Documento",
    cell: ({ getValue }) => (
      <Badge variant="default" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "issue_date",
    header: "Fecha de Emisión",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "supplier_fullname",
    header: "Proveedor",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "affected_document_number",
    header: "Doc. Afectado",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="font-mono w-fit">
            {item.affected_document_number}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {item.affected_document_type}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "credit_note_type_name",
    header: "Tipo NC",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">{item.credit_note_type_name}</span>
          <span className="text-xs text-muted-foreground">
            {item.credit_note_type_code}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => {
      const total = row.original.total_amount;
      const currency = row.original.currency;
      const symbol =
        currency === "USD" ? "$" : currency === "EUR" ? "€" : "S/.";
      return (
        <span className="font-semibold">
          {symbol} {parseFloat(total).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "is_detailed",
    header: "Tipo",
    cell: ({ row }) => {
      const isDetailed = row.original.is_detailed;
      return (
        <Badge color={isDetailed ? "default" : "secondary"}>
          {isDetailed ? "Detallada" : "Consolidada"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const variant =
        status === "REGISTRADO"
          ? "default"
          : status === "ANULADO"
            ? "destructive"
            : "secondary";
      return <Badge color={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "user_name",
    header: "Usuario",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
];
