import {
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SelectActions } from "@/components/SelectActions";
import type { VehicleResource } from "../lib/vehicle.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const VehicleColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<VehicleResource>[] => [
  {
    accessorKey: "plate",
    header: "Placa",
    cell: ({ getValue }) => (
      <span className="font-semibold font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "brand",
    header: "Marca",
  },
  {
    accessorKey: "model",
    header: "Modelo",
  },
  {
    accessorKey: "year",
    header: "Año",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "vehicle_type",
    header: "Tipo",
    cell: ({ getValue }) => (
      <Badge variant="secondary">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "max_weight",
    header: "Peso Máx.",
    cell: ({ getValue }) => (
      <span>{getValue() as string} kg</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={status === "Activo" ? "default" : "destructive"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "owner",
    header: "Propietario",
    cell: ({ getValue }) => {
      const owner = getValue() as VehicleResource["owner"];
      return owner ? owner.full_name : "Sin propietario";
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
