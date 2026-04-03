import type { TypeUserResource } from "../lib/typeUser.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const TypeUserColumns = (): ColumnDef<TypeUserResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge
          color={status === "Activo" ? "default" : "destructive"}
          className={`font-semibold`}
        >
          {status}
        </Badge>
      );
    },
  },
];
