import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface DetailRow {
  id: string;
  product_id: string;
  product_name: string;
  quantity_sacks: number;
  unit_price: number;
  total: number;
}

export const createWarehouseDocumentDetailsColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
  getIndex: (id: string) => number
): ColumnDef<DetailRow>[] => [
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.product_name}</span>
    ),
  },
  {
    accessorKey: "quantity_sacks",
    header: "Cantidad",
    cell: ({ row }) => (
      <div className="text-right">{row.original.quantity_sacks}</div>
    ),
  },
  {
    accessorKey: "unit_price",
    header: "Precio Unitario",
    cell: ({ row }) => (
      <div className="text-right">S/ {row.original.unit_price.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <div className="text-right font-semibold">
        S/ {row.original.total.toFixed(2)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const index = getIndex(row.original.id);
      return (
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(index)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
];
