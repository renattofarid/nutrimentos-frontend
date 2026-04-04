import { DataTable } from "@/components/DataTable.tsx";
import type { UserResource } from "../lib/User.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<UserResource>[];
  data: UserResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: UserResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function UserTable({
  columns,
  data,
  children,
  isLoading,
  onRowDoubleClick,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onRowDoubleClick={onRowDoubleClick}
        enableRowSelection={enableRowSelection}
        enableMultiRowSelection={false}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={(row) => row.id.toString()}
        initialColumnVisibility={{
          business_name: false,
          type_person: false,
          type_document: false,
          address: false,
          phone: false,
          email: false,
          ocupation: false,
          status: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
