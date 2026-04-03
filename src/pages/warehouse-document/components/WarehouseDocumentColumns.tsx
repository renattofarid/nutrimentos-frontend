import type { WarehouseDocumentResource } from "../lib/warehouse-document.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  getDocumentTypeLabel,
  getDocumentStatusVariant,
} from "../lib/warehouse-document.constants";
import { parse } from "date-fns";

export const WarehouseDocumentColumns = (): ColumnDef<WarehouseDocumentResource>[] => [
  {
    accessorKey: "document_number",
    header: "Número de Documento",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "warehouse_origin.name",
    header: "Almacén",
    cell: ({ getValue }) =>
      getValue() && (
        <Badge variant="outline" className="font-medium">
          {getValue() as string}
        </Badge>
      ),
  },
  {
    accessorKey: "document_type",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const type = row.original.document_type;
      const isEntry = type.startsWith("ENTRADA_");
      return (
        type && (
          <Badge
            color={isEntry ? "default" : "secondary"}
            className="font-medium"
          >
            {getDocumentTypeLabel(type)}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "motive",
    header: "Motivo",
    cell: ({ row }) => {
      const motive = row.original.motive;
      return (
        motive && (
          <Badge variant="outline" className="font-medium">
            {motive}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "person_fullname",
    header: "Responsable",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "movement_date",
    header: "Fecha del Movimiento",
    cell: ({ getValue }) => {
      const date = parse(getValue() as string, "yyyy-MM-dd", new Date());
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = getDocumentStatusVariant(status);
      return (
        <Badge color={variant} className="font-semibold">
          {status}
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
    accessorKey: "updated_at",
    header: "Fecha de Actualización",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
];
