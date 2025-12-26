import { DataTable } from "@/components/DataTable.tsx";
import type { SaleResource } from "../lib/sale.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<SaleResource>[];
  data: SaleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function SaleTable({
  columns,
  data,
  children,
  isLoading,
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
        enableRowSelection={enableRowSelection}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        initialColumnVisibility={{
          id: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
