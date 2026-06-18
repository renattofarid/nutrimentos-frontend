import { useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { CreditNoteResource } from "../lib/credit-note.interface";

interface CreditNoteSearchResultsProps {
  results: CreditNoteResource[];
  isLoading: boolean;
  onManage: (note: CreditNoteResource) => void;
  onEdit: (note: CreditNoteResource) => void;
}

export default function CreditNoteSearchResults({
  results,
  isLoading,
  onManage,
  onEdit,
}: CreditNoteSearchResultsProps) {
  const columns = useMemo<ColumnDef<CreditNoteResource>[]>(
    () => [
      {
        accessorKey: "full_document_number",
        header: "N° Documento",
        cell: ({ row }) => (
          <span className="font-mono font-semibold">
            {row.original.full_document_number}
          </span>
        ),
      },
      {
        accessorKey: "issue_date",
        header: "Fecha",
        cell: ({ row }) =>
          new Date(row.original.issue_date).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
      },
      {
        id: "customer",
        header: "Cliente",
        cell: ({ row }) => {
          const c = row.original.customer;
          return c?.business_name || c?.full_name || "—";
        },
      },
      {
        id: "sale",
        header: "Venta Origen",
        cell: ({ row }) => {
          const s = row.original.sale;
          return s ? (
            <span className="font-mono">{s.serie}-{s.numero}</span>
          ) : "—";
        },
      },
      {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-mono">
            {parseFloat(row.original.total_amount).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "REGISTRADO" ? "default" : "destructive"}
            className="text-[10px]"
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              colorIcon="blue"
              className="h-6 px-2 text-[10px]"
              onClick={() => onManage(row.original)}
            >
              <Eye className="size-3" />
              Ver
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorIcon="amber"
              className="h-6 px-2 text-[10px]"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-3" />
              Editar
            </Button>
          </div>
        ),
      },
    ],
    [onManage, onEdit],
  );

  if (!isLoading && results.length === 0) return null;

  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={results}
        isLoading={isLoading}
        getRowId={(row) => row.id.toString()}
      />
    </div>
  );
}
