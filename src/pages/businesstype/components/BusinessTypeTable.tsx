import { DataTable } from "@/components/DataTable.tsx";
import type { BusinessTypeResource } from "../lib/businesstype.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<BusinessTypeResource>[];
  data: BusinessTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BusinessTypeTable({
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
