import type { BoxResource } from "../lib/box.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ButtonAction } from "@/components/ButtonAction";
import { Eye, Pencil, UserPlus } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const BoxColumns = ({
  onEdit,
  onDelete,
  onAssign,
  onViewAssignments,
  onToggleStatus,
  updatingStatusId,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAssign?: (id: number) => void;
  onViewAssignments?: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: string) => void;
  updatingStatusId?: number | null;
}): ColumnDef<BoxResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "serie",
    header: "Serie",
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const id = row.original.id;
      const isUpdating = updatingStatusId === id;
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={status === "Activo"}
            onCheckedChange={() => onToggleStatus(id, status)}
            disabled={isUpdating}
          />
          <Badge
            variant={status === "Activo" ? "default" : "destructive"}
            className={`font-semibold`}
          >
            {status}
          </Badge>
        </div>
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
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {onViewAssignments && (
            <ButtonAction
              onClick={() => onViewAssignments(id)}
              icon={Eye}
              tooltip="Ver Asignaciones"
            />
          )}
          {onAssign && (
            <ButtonAction
              onClick={() => onAssign(id)}
              icon={UserPlus}
              tooltip="Asignar Usuario"
            />
          )}
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
