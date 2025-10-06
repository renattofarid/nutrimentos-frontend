import { DataTable } from "@/components/DataTable.tsx";
import type { JobPositionResource } from "../lib/jobposition.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<JobPositionResource>[];
  data: JobPositionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function JobPositionTable({
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
