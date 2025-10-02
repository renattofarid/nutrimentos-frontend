import { DataTable } from "@/components/DataTable.tsx";
import type { RoleResource } from "../lib/role.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<RoleResource>[];
  data: RoleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function RoleTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}