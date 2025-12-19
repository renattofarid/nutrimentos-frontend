import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatNumber } from "@/lib/formatCurrency";
import { formatDecimalTrunc } from "@/lib/utils";

export interface SaleDetailRow {
  product_id: string;
  product_name?: string;
  quantity: string;
  unit_price: string;
  subtotal: number;
  igv: number;
  total: number;
  additional_kg?: string;
  total_kg?: number;
}

interface CreateColumnsProps {
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const createSaleDetailColumns = ({
  onEdit, 
  onDelete,
}: CreateColumnsProps): ColumnDef<SaleDetailRow>[] => [
  {
    id: "producto",
    header: "Producto",
    accessorKey: "product_name",
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.original.product_name || "-"}</div>
      );
    },
  },
  {
    id: "sacos",
    header: () => <div className="text-right">Sacos</div>,
    accessorKey: "quantity",
    cell: ({ row }) => {
      return <div className="text-right">{formatDecimalTrunc(parseFloat(row.original.quantity), 6)}</div>;
    },
  },
  {
    id: "kg_total",
    header: () => <div className="text-right">Kg Total</div>,
    accessorKey: "total_kg",
    cell: ({ row }) => {
      return (
        <div className="text-right text-blue-600 font-semibold">
          {formatDecimalTrunc(row.original.total_kg || 0, 2)} kg
        </div>
      );
    },
  },
  {
    id: "precio_unitario",
    header: () => <div className="text-right">P. Unit.</div>,
    accessorKey: "unit_price",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          {formatNumber(parseFloat(row.original.unit_price))}
        </div>
      );
    },
  },
  {
    id: "subtotal",
    header: () => <div className="text-right">Subtotal</div>,
    accessorKey: "subtotal",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          {formatNumber(row.original.subtotal)}
        </div>
      );
    },
  },
  {
    id: "igv",
    header: () => <div className="text-right">IGV (18%)</div>,
    accessorKey: "igv",
    cell: ({ row }) => {
      return (
        <div className="text-right text-orange-600">
          {formatNumber(row.original.igv)}
        </div>
      );
    },
  },
  {
    id: "total",
    header: () => <div className="text-right">Total</div>,
    accessorKey: "total",
    cell: ({ row }) => {
      return (
        <div className="text-right font-bold text-primary">
          {formatNumber(row.original.total)}
        </div>
      );
    },
  },
  {
    id: "acciones",
    header: () => <div className="text-center">Acciones</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.index)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.index)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      );
    },
  },
];
