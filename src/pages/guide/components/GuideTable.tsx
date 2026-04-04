import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";
import type { GuideResource } from "../lib/guide.interface";
import { DataTable } from "@/components/DataTable";

interface GuideTableProps {
  columns: ColumnDef<GuideResource>[];
  data: GuideResource[];
  isLoading: boolean;
  children?: React.ReactNode;
  onRowDoubleClick?: (row: GuideResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function GuideTable({
  columns,
  data,
  isLoading,
  children,
  onRowDoubleClick,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
}: GuideTableProps) {
  return (
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
    >
      {children}
    </DataTable>
  );
}
