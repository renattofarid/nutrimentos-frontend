import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { CreditNoteResource } from "../lib/credit-note.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export const CreditNoteColumns = ({
  onDelete,
  onGeneratePdf,
}: {
  onDelete: (id: number) => void;
  onGeneratePdf: (id: number) => void;
}): ColumnDef<CreditNoteResource>[] => [
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
    accessorKey: "sale",
    header: "Venta Relacionada",
    cell: ({ row }) => {
      const sale = row.original.sale;
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="font-mono w-fit">
            {sale.serie}-{sale.numero}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {sale.document_type}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Cliente",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">
            {customer.business_name || customer.full_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {customer.document_number}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "motive",
    header: "Motivo",
    cell: ({ row }) => {
      const motive = row.original.motive;
      return (
        <div className="flex flex-col gap-1">
          <span className="font-semibold">{motive.name}</span>
          <span className="text-xs text-muted-foreground">{motive.code}</span>
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
      const symbol = currency === "USD" ? "$" : "S/.";
      return (
        <span className="font-semibold">
          {symbol} {parseFloat(total).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "affects_stock",
    header: "Afecta Stock",
    cell: ({ getValue }) => {
      const affectsStock = getValue() as boolean;
      return (
        <Badge variant={affectsStock ? "default" : "secondary"}>
          {affectsStock ? "Sí" : "No"}
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
      return <Badge variant={variant}>{status}</Badge>;
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
        <SelectActions>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => onGeneratePdf(id)}>
              <FileText className="mr-2 h-4 w-4" />
              Generar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SelectActions>
      );
    },
  },
];
