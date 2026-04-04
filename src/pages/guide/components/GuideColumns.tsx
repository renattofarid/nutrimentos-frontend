import type { ColumnDef } from "@tanstack/react-table";
import type { GuideResource } from "../lib/guide.interface";
import { Badge } from "@/components/ui/badge";

export const GuideColumns = (): ColumnDef<GuideResource>[] => [
  {
    accessorKey: "full_document_number",
    header: "N° Documento",
    cell: ({ getValue }) => (
      <Badge variant={"outline"} className="font-mono text-xs font-semibold">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "issue_date",
    header: "F. Emisión",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "transfer_date",
    header: "F. Traslado",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Cliente",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <span className="text-sm">
          {customer?.business_name || customer.full_name}
        </span>
      );
    },
  },
  {
    accessorKey: "modality",
    header: "Modalidad",
    cell: ({ getValue }) => {
      const modality = getValue() as string;
      return (
        <Badge variant="outline">
          {modality === "PUBLICO" ? "Transporte Público" : "Transporte Privado"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "carrier_name",
    header: "Transportista",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "total_weight",
    header: "Peso Total",
    cell: ({ row }) => {
      const weight = row.original.total_weight;
      const unit = row.original.unit_measurement;
      return (
        <span className="text-sm font-mono">
          {weight} {unit}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusVariant = {
        REGISTRADA: "secondary",
        ENVIADA: "default",
        ACEPTADA: "default",
        RECHAZADA: "destructive",
        ANULADA: "destructive",
      }[status] as "secondary" | "default" | "destructive";

      return <Badge color={statusVariant}>{status}</Badge>;
    },
  },
];
