import { ColumnDef } from "@tanstack/react-table";
import { SettingResource } from "../lib/setting.interface";
import { SettingActions } from "./SettingActions";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export const SettingColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}): ColumnDef<SettingResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "branch_name",
    header: "Sucursal",
  },
  {
    accessorKey: "default_currency",
    header: "Moneda",
    cell: ({ row }) => {
      const currency = row.getValue("default_currency") as string;
      return <Badge variant="outline">{currency}</Badge>;
    },
  },
  {
    accessorKey: "tax_percentage",
    header: "Impuesto (%)",
    cell: ({ row }) => {
      const tax = row.getValue("tax_percentage") as string;
      return `${tax}%`;
    },
  },
  {
    accessorKey: "allow_multiple_prices",
    header: "Múltiples Precios",
    cell: ({ row }) => {
      const allowed = row.getValue("allow_multiple_prices") as number;
      return allowed === 1 ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-red-600" />
      );
    },
  },
  {
    accessorKey: "allow_invoice",
    header: "Facturación",
    cell: ({ row }) => {
      const allowed = row.getValue("allow_invoice") as number;
      return allowed === 1 ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-red-600" />
      );
    },
  },
  {
    accessorKey: "allow_negative_stock",
    header: "Stock Negativo",
    cell: ({ row }) => {
      const allowed = row.getValue("allow_negative_stock") as number;
      return allowed === 1 ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-red-600" />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const setting = row.original;
      return (
        <SettingActions
          id={setting.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];
