import type { BranchResource } from "../lib/branch.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Pencil, X } from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const BranchColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<BranchResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "company_social_reason",
    header: "Razón Social Empresa",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "is_invoice",
    header: "Emite Factura",
    cell: ({ getValue }) => {
      const isInvoice = getValue() as number | boolean;
      const canInvoice = isInvoice === 1 || isInvoice === true;

      return (
        <div className="flex items-center gap-2">
          {canInvoice ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm">{canInvoice ? "Sí" : "No"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "serie",
    header: "Serie",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "responsible_full_name",
    header: "Responsable",
    cell: ({ getValue }) => {
      const name = getValue() as string;
      return name ? name.trim() : "Sin responsable";
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          <ButtonAction
            icon={Pencil}
            onClick={() => onEdit(id)}
            tooltip="Editar"
          />
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
