import type { PaymentConceptResource } from "../lib/payment-concept.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react"; // Import the Pencil icon
import { ButtonAction } from "@/components/ButtonAction"; // Import ButtonAction component
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const PaymentConceptColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<PaymentConceptResource>[] => [
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
          className="font-mono"
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
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
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
