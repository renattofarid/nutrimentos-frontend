import type { ColumnDef } from "@tanstack/react-table";
import type { PriceList } from "../lib/pricelist.interface";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye, UserPlus } from "lucide-react"; // Import necessary icons
import { ButtonAction } from "@/components/ButtonAction"; // Import ButtonAction component
import { DeleteButton } from "@/components/SimpleDeleteDialog";

interface PriceListColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAssignClient: (id: number) => void;
  onViewDetails: (id: number) => void;
}

export const PriceListColumns = ({
  onEdit,
  onDelete,
  onAssignClient,
  onViewDetails,
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
        <Badge color="secondary" className="font-mono">
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
        <Badge color={isActive ? "default" : "destructive"}>
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
      <div className="flex gap-2">
        <ButtonAction
          onClick={() => onViewDetails(row.original.id)}
          icon={Eye}
          tooltip="Ver Detalles"
        />
        <ButtonAction
          onClick={() => onEdit(row.original.id)}
          icon={Pencil}
          tooltip="Editar"
        />
        <ButtonAction
          onClick={() => onAssignClient(row.original.id)}
          icon={UserPlus}
          tooltip="Asignar Cliente"
        />
        <DeleteButton onClick={() => onDelete(row.original.id)} />
      </div>
    ),
  },
];
