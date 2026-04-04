import { DataTable } from "@/components/DataTable";
import type { NationalityResource } from "../lib/nationality.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface NationalityTableProps {
  isLoading?: boolean;
  columns: ColumnDef<NationalityResource, any>[];
  data: NationalityResource[];
  children?: React.ReactNode;
  onRowDoubleClick?: (row: NationalityResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function NationalityTable({
  isLoading, columns, data, children, onRowDoubleClick,
  enableRowSelection, rowSelection, onRowSelectionChange,
}: NationalityTableProps) {
  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={data}
      onRowDoubleClick={onRowDoubleClick}
      enableRowSelection={enableRowSelection}
      enableMultiRowSelection={false}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      getRowId={(row) => row.id.toString()}
    >
      {children}
    </DataTable>
  );
}
