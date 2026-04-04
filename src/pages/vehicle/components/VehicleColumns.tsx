import type { VehicleResource } from "../lib/vehicle.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const VehicleColumns = (): ColumnDef<VehicleResource>[] => [
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
      <Badge color="secondary">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "max_weight",
    header: "Peso Máx.",
    cell: ({ getValue }) => <span>{getValue() as string} kg</span>,
  },
  {
    accessorKey: "mtc",
    header: "MTC",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge color={status === "Activo" ? "default" : "destructive"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "owner",
    header: "Conductor",
    cell: ({ getValue }) => {
      const owner = getValue() as VehicleResource["owner"];
      return owner ? owner.full_name : "Sin conductor";
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
];
