import type { TypeUserResource } from "../lib/typeUser.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";
import { Pencil, Lock } from "lucide-react";

export const TypeUserColumns = ({
  onEdit,
  onPermissions,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onPermissions: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<TypeUserResource>[] => [
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
          <ButtonAction
            onClick={() => onPermissions(id)}
            icon={Lock}
            tooltip="Permisos"
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
