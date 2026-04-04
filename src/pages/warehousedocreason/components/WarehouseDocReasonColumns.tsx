import type { WarehouseDocReasonResource } from "../lib/warehousedocreason.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const WarehouseDocReasonColumns = (): ColumnDef<WarehouseDocReasonResource>[] => [
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
          className="capitalize"
        >
          {type.toLowerCase()}
        </Badge>
      );
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
