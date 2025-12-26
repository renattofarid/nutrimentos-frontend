import type { ColumnDef } from "@tanstack/react-table";
import { formatNumber } from "@/lib/formatCurrency";
import { formatDecimalTrunc } from "@/lib/utils";

export interface SaleDetailRow {
  product_id: string;
  product_name?: string;
  quantity: string; // Cantidad total en decimal (ej: 1.02) - SE ENVÍA AL BACKEND
  quantity_sacks: string; // Cantidad de sacos ingresada por el usuario (ej: 1)
  quantity_kg: string; // Kg adicionales ingresados por el usuario (ej: 1)
  unit_price: string;
  subtotal: number;
  igv: number;
  total: number;
  total_kg?: number; // Peso total en kg (ej: 51)
}

export const createSaleDetailColumns = (): ColumnDef<SaleDetailRow>[] => [
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
    id: "cantidad_total",
    header: () => <div className="text-right">Cantidad Total</div>,
    accessorKey: "quantity",
    cell: ({ row }) => {
      return <div className="text-right font-semibold text-blue-600">{formatDecimalTrunc(parseFloat(row.original.quantity), 6)}</div>;
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
];
