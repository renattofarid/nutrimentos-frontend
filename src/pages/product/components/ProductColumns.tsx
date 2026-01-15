import type { ProductResource } from "../lib/product.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const ProductColumns = ({
  onEdit,
  onDelete,
  onView,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}): ColumnDef<ProductResource>[] => [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ getValue }) => (
      <span className="font-semibold text-primary">{getValue() as string}</span>
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
      <Badge variant="secondary" className="font-medium">
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
      ): "default" | "destructive" | "secondary" | "outline" => {
        switch (type) {
          case "Normal":
            return "default";
          case "Kit":
            return "destructive";
          case "Servicio":
            return "secondary";
          default:
            return "outline";
        }
      };
      return (
        <Badge variant={getVariant(type)} className="font-semibold">
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
      return (
        <Badge variant={isTaxed ? "default" : "outline"}>
          {isTaxed ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_kg",
    header: "Venta por Kg",
    cell: ({ getValue }) => {
      const isKg = getValue() as number;
      return (
        <Badge variant={isKg ? "default" : "outline"}>
          {isKg ? "Sí" : "No"}
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
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <div className="flex gap-1">
          <Button size="icon-xs" onClick={() => onView(id)} variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            color="primary"
            size="icon-xs"
            onClick={() => onEdit(id)}
            variant="outline"
          >
            <Pencil />
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
