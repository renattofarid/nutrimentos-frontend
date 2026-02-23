import type { ZoneResource } from "../lib/zone.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const ZoneColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<ZoneResource>[] => [
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
      <Badge color="secondary" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
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
