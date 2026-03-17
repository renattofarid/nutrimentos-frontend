import type { WarehouseProductResource } from "../lib/warehouse-product.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const WarehouseProductColumns = (): ColumnDef<WarehouseProductResource>[] => [
  {
    accessorKey: "product_code",
    header: "Código",
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="font-mono">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ row }) => (
      <span className="font-semibold">{row.getValue("product_name")}</span>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ getValue }) => (
      <span className="font-semibold tabular-nums">
        {parseFloat(getValue() as string).toLocaleString("es-PE")}
      </span>
    ),
  },
  {
    accessorKey: "min_stock",
    header: "Stock Mín.",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {parseFloat(getValue() as string).toLocaleString("es-PE")}
      </span>
    ),
  },
  {
    accessorKey: "max_stock",
    header: "Stock Máx.",
    cell: ({ getValue }) => (
      <span className="tabular-nums">
        {parseFloat(getValue() as string).toLocaleString("es-PE")}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Fecha de Registro",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
];
