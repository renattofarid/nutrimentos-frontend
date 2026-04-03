import type { CategoryResource } from "../lib/category.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const CategoryColumns = (): ColumnDef<CategoryResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="flex items-center">
          <span className="font-semibold">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => (
      <Badge color="secondary" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "parent_name",
    header: "Categoría Padre",
    cell: ({ getValue }) => {
      const parentName = getValue() as string;
      return (
        parentName || (
          <span className="text-muted-foreground italic">Sin padre</span>
        )
      );
    },
  },
  {
    accessorKey: "level",
    header: "Nivel",
    cell: ({ getValue }) => (
      <Badge color="secondary" className="font-semibold">
        Nivel {getValue() as number}
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
