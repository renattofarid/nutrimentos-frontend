import { DataTable } from "@/components/DataTable";
import type { PaymentConceptResource } from "../lib/payment-concept.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface PaymentConceptTableProps {
  isLoading?: boolean;
  columns: ColumnDef<PaymentConceptResource, any>[];
  data: PaymentConceptResource[];
  children?: React.ReactNode;
  onRowDoubleClick?: (row: PaymentConceptResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function PaymentConceptTable({
  isLoading, columns, data, children, onRowDoubleClick,
  enableRowSelection, rowSelection, onRowSelectionChange,
}: PaymentConceptTableProps) {
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
