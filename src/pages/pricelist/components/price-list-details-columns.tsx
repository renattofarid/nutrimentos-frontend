import type { ColumnDef } from "@tanstack/react-table";
import type { ProductPrice, WeightRange } from "../lib/pricelist.interface";
import { Badge } from "@/components/ui/badge";

export const getPriceListDetailsColumns = (
  weightRanges: WeightRange[]
): ColumnDef<ProductPrice>[] => [
  {
    accessorKey: "product.codigo",
    header: "Código",
    cell: ({ row }) => {
      const product = row.original.product;
      return (
        <span className="font-mono text-sm">{product?.codigo || "-"}</span>
      );
    },
  },
  {
    accessorKey: "product.name",
    header: "Producto",
    cell: ({ row }) => {
      const product = row.original.product;
      return (
        <div className="space-y-1">
          <span className="font-semibold block">{product?.name || "-"}</span>
          {product?.category_name && (
            <span className="text-xs text-muted-foreground">
              {product.category_name}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "product.brand_name",
    header: "Marca",
    cell: ({ row }) => {
      const product = row.original.product;
      return <span className="text-sm">{product?.brand_name || "-"}</span>;
    },
  },
  {
    accessorKey: "weight_range_id",
    header: "Rango de Peso",
    cell: ({ row }) => {
      const weightRangeId = row.original.weight_range_id;
      if (!weightRangeId) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      // Buscar el rango de peso correspondiente en el array
      const weightRange = weightRanges.find((wr) => wr.id === weightRangeId);

      if (!weightRange) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      return (
        <Badge variant="secondary" className="font-mono">
          {weightRange.formatted_range ||
            `${weightRange.min_weight}kg - ${weightRange.max_weight}kg`}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      const price = row.original.price;
      const currency = row.original.currency;
      return (
        <div className="text-right">
          <span className="font-bold text-primary">
            {currency} {parseFloat(price.toString()).toFixed(2)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "formatted_price",
    header: "Precio Formateado",
    cell: ({ row }) => {
      const formattedPrice = row.original.formatted_price;
      return (
        <Badge variant="outline" className="font-mono">
          {formattedPrice || "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
];
