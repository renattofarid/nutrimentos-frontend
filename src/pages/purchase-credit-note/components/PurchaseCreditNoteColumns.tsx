import type { PurchaseCreditNoteResource } from "../lib/purchase-credit-note.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const PurchaseCreditNoteColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex gap-2">
          <ButtonAction
            onClick={() => onEdit(id)}
            icon={Pencil}
            tooltip="Editar"
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
