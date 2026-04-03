import type { ProductResource } from "../lib/product.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export const ProductColumns = (): ColumnDef<ProductResource>[] => [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ getValue }) => (
      <Badge className="font-semibold">{getValue() as string}</Badge>
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "category_name",
    header: "Categoría",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="font-medium">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "brand_name",
    header: "Marca",
    cell: ({ getValue }) => (
      <Badge color="secondary" className="font-medium">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "product_type_name",
    header: "Tipo",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      const getVariant = (
        type: string
      ): "default" | "destructive" | "secondary" | "muted" => {
        switch (type) {
          case "Normal":
            return "default";
          case "Kit":
            return "destructive";
          case "Servicio":
            return "secondary";
          default:
            return "muted";
        }
      };
      return (
        <Badge color={getVariant(type)} className="font-semibold">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "purchase_price",
    header: "Precio Compra",
    cell: ({ getValue }) => {
      const price = getValue() as string;
      return <span>S/ {Number(price).toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "sale_price",
    header: "Precio Venta",
    cell: ({ getValue }) => {
      const price = getValue() as string;
      return (
        <span className="font-semibold text-green-600">
          S/ {Number(price).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "is_taxed",
    header: "Gravado",
    cell: ({ getValue }) => {
      const isTaxed = getValue() as number;
      return isTaxed ? (
        <CheckCircle className="text-primary size-6" />
      ) : (
        <XCircle className="text-muted-foreground size-6" />
      );
    },
  },
  {
    accessorKey: "is_kg",
    header: "Venta por Kg",
    cell: ({ getValue }) => {
      const isKg = getValue() as number;
      return isKg ? (
        <CheckCircle className="text-primary size-6" />
      ) : (
        <XCircle className="text-muted-foreground size-6" />
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
];
