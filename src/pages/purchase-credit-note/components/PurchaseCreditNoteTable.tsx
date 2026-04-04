import { DataTable } from "@/components/DataTable.tsx";
import type { PurchaseCreditNoteResource } from "../lib/purchase-credit-note.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<PurchaseCreditNoteResource>[];
  data: PurchaseCreditNoteResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: PurchaseCreditNoteResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function PurchaseCreditNoteTable({
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
        initialColumnVisibility={{ created_at: false }}
      >
        {children}
      </DataTable>
    </div>
  );
}
