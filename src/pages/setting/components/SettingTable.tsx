import { DataTable } from "@/components/DataTable";
import type { SettingResource } from "../lib/setting.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface SettingTableProps {
  isLoading?: boolean;
  columns: ColumnDef<SettingResource, any>[];
  data: SettingResource[];
  children?: React.ReactNode;
  onRowDoubleClick?: (row: SettingResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function SettingTable({
  isLoading, columns, data, children, onRowDoubleClick,
  enableRowSelection, rowSelection, onRowSelectionChange,
}: SettingTableProps) {
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
