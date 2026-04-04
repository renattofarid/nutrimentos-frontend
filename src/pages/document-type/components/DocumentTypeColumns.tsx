import type { ColumnDef } from "@tanstack/react-table";
import type { DocumentTypeResource } from "../lib/document-type.interface";

export const DocumentTypeColumns = (_options?: {
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}): ColumnDef<DocumentTypeResource>[] => [
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
];
