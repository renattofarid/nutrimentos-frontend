import type { ColumnDef } from "@tanstack/react-table";
import type { DocumentTypeResource } from "../lib/document-type.interface";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface DocumentTypeColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DocumentTypeColumns = ({ onEdit, onDelete }: DocumentTypeColumnsProps): ColumnDef<DocumentTypeResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Creación",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const documentType = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(documentType.id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(documentType.id)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

