import type { CategoryResource } from "../lib/category.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react"; // Import the Pencil icon
import { ButtonAction } from "@/components/ButtonAction"; // Import ButtonAction component
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const CategoryColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<CategoryResource>[] => [
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
      <Badge variant="secondary" className="font-mono">
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
      <Badge variant="secondary" className="font-semibold">
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
