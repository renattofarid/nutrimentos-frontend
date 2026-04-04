import type { PaymentConceptResource } from "../lib/payment-concept.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const PaymentConceptColumns = (_options?: {
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}): ColumnDef<PaymentConceptResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <Badge
          color={type === "INGRESO" ? "default" : "destructive"}
          className="font-mono"
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
];
