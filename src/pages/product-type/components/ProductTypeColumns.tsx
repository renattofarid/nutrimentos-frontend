import type { ProductTypeResource } from "../lib/product-type.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const ProductTypeColumns = (): ColumnDef<ProductTypeResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
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
