import { DataTable } from "@/components/DataTable.tsx";
import type { TypeUserResource } from "../lib/typeUser.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<TypeUserResource>[];
  data: TypeUserResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: TypeUserResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function TypeUserTable({
  columns, data, children, isLoading, onRowDoubleClick,
  enableRowSelection, rowSelection, onRowSelectionChange,
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
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
