import type { CompanyResource } from "../lib/company.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const CompanyColumns = (): ColumnDef<CompanyResource>[] => [
  {
    accessorKey: "social_reason",
    header: "Razón Social",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "ruc",
    header: "RUC",
    cell: ({ getValue }) => {
      const ruc = getValue() as string;
      return (
        ruc && (
          <Badge color={"secondary"} className="font-mono">
            {ruc}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "trade_name",
    header: "Nombre Comercial",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "responsible_full_name",
    header: "Nombre del Responsable",
    cell: ({ getValue }) => getValue() as string,
  },
];
