import type { PermissionResource } from "../lib/permission.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const PermissionColumns = (): ColumnDef<PermissionResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "route",
    header: "Ruta",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "group_menu_name",
    header: "Grupo",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge
          color={status === "Activo" ? "default" : "destructive"}
          className="font-semibold"
        >
          {status}
        </Badge>
      );
    },
  },
];
