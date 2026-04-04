import { DataTable } from "@/components/DataTable.tsx";
import type { ZoneResource } from "../lib/zone.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<ZoneResource>[];
  data: ZoneResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: ZoneResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function ZoneTable({
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
