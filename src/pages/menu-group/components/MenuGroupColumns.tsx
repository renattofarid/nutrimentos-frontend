import type { MenuGroupResource } from "../lib/menuGroup.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import * as LucideReact from "lucide-react";

export const MenuGroupColumns = (
  allMenuGroups: MenuGroupResource[] = []
): ColumnDef<MenuGroupResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row, getValue }) => {
      const Icon = LucideReact[
        row.original.icon as keyof typeof LucideReact
      ] as React.ComponentType<any> | undefined;
      return (
        <span className="flex items-center gap-2 font-semibold">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          {getValue() as string}
        </span>
      );
    },
  },
  {
    accessorKey: "group_menu_id",
    header: "Grupo padre",
    cell: ({ row }) => {
      const parent = allMenuGroups.find(
        (m) => m.id === row.original.group_menu_id
      );
      return parent ? (
        <span>{parent.name}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
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
