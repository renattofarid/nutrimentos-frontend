import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { PurchaseResource } from "../lib/purchase.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export const PurchaseColumns = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<PurchaseResource>[] => [
  {
    accessorKey: "correlativo",
    header: "Correlativo",
    cell: ({ getValue }) => (
      <span className="font-semibold font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "supplier_fullname",
    header: "Proveedor",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "document_type",
    header: "Tipo Doc.",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "document_number",
    header: "Nro. Documento",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "issue_date",
    header: "Fecha Emisión",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return new Date(date).toLocaleDateString("es-PE");
    },
  },
  {
    accessorKey: "payment_type",
    header: "Tipo Pago",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <Badge variant={type === "CONTADO" ? "default" : "secondary"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => {
      const amount = row.original.total_amount;
      const currency = row.original.currency;
      return (
        <span className="font-semibold">
          {currency === "PEN" ? "S/." : "$"} {parseFloat(amount).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const variants: Record<string, "default" | "secondary" | "destructive"> = {
        PENDIENTE: "secondary",
        APROBADA: "default",
        RECHAZADA: "destructive",
        CANCELADA: "destructive",
      };
      return <Badge variant={variants[status] || "default"}>{status}</Badge>;
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
            <DropdownMenuItem onClick={() => onView(id)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(id)}>
              Editar
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
