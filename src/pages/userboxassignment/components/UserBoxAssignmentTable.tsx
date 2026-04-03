import { DataTable } from "@/components/DataTable.tsx";
import type { UserBoxAssignmentResource } from "../lib/userboxassignment.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<UserBoxAssignmentResource>[];
  data: UserBoxAssignmentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: UserBoxAssignmentResource) => void;
}

export default function UserBoxAssignmentTable({
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
