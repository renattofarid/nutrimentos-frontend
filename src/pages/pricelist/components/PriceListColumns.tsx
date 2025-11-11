import type { ColumnDef } from "@tanstack/react-table";
import type { PriceList } from "../lib/pricelist.interface";
import { SelectActions } from "@/components/SelectActions";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PriceListColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAssignClient: (id: number) => void;
}

export const PriceListColumns = ({
  onEdit,
  onDelete,
  onAssignClient,
}: PriceListColumnsProps): ColumnDef<PriceList>[] => [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ getValue }) => {
      const description = getValue() as string;
      return (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {description || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "weight_ranges",
    header: "Rangos",
    cell: ({ getValue }) => {
      const ranges = getValue() as PriceList["weight_ranges"];
      return (
        <Badge variant="secondary" className="font-mono">
          {ranges?.length || 0} rangos
        </Badge>
      );
    },
  },
  {
    accessorKey: "product_prices",
    header: "Precios",
    cell: ({ getValue }) => {
      const prices = getValue() as PriceList["product_prices"];
      return (
        <Badge variant="outline" className="font-mono">
          {prices?.length || 0} productos
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha Creación",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <SelectActions>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAssignClient(row.original.id)}>
            Asignar Cliente
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => onDelete(row.original.id)}
            className="text-destructive"
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </SelectActions>
    ),
  },
];
