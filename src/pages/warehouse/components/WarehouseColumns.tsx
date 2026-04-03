import type { WarehouseResource } from "../lib/warehouse.interface";
import type { ColumnDef } from "@tanstack/react-table";

export const WarehouseColumns = (): ColumnDef<WarehouseResource>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "branch_name",
    header: "Tienda",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "capacity",
    header: "Capacidad",
    cell: ({ getValue }) => {
      const capacity = getValue() as number;
      return <span className="font-mono">{capacity.toLocaleString()}</span>;
    },
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
    header: "Responsable",
    cell: ({ getValue }) => {
      const name = getValue() as string;
      return name ? name.trim() : "Sin responsable";
    },
  },
];
