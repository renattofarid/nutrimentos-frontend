import { DataTable } from "@/components/DataTable.tsx";
import type { JobPositionResource } from "../lib/jobposition.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<JobPositionResource>[];
  data: JobPositionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: JobPositionResource) => void;
}

export default function JobPositionTable({
  columns,
  data,
  children,
  isLoading,
  onRowDoubleClick,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onRowDoubleClick={onRowDoubleClick}
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
