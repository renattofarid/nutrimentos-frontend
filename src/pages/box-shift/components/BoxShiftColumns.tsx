import type { BoxShiftResource } from "../lib/box-shift.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatCurrency";

export const BoxShiftColumns = (_options?: {
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
  onClose?: (id: number) => void;
}): ColumnDef<BoxShiftResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => (
      <span className="font-semibold">#{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "box.name",
    header: "Caja",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "box.serie",
    header: "Serie",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "open_date",
    header: "Fecha Apertura",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "started_amount",
    header: "Monto Inicial",
    cell: ({ getValue }) => (
      <span className="font-medium">
        {formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "expected_balance",
    header: "Balance Esperado",
    cell: ({ getValue }) => (
      <span className="font-medium text-blue-600">
        {formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;
      const isOpen = status === "ABIERTO";
      return (
        <Badge color={isOpen ? "default" : "secondary"} className="font-medium">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_income",
    header: "Total Ingresos",
    cell: ({ getValue }) => (
      <span className="font-medium text-green-600">
        +{formatCurrency(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "total_outcome",
    header: "Total Egresos",
    cell: ({ getValue }) => (
      <span className="font-medium text-red-600">
        -{formatCurrency(getValue() as number)}
      </span>
    ),
  },
];
