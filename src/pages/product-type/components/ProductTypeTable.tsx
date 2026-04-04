import { DataTable } from "@/components/DataTable";
import type { ProductTypeResource } from "../lib/product-type.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface ProductTypeTableProps {
  isLoading?: boolean;
  columns: ColumnDef<ProductTypeResource, any>[];
  data: ProductTypeResource[];
  children?: React.ReactNode;
  onRowDoubleClick?: (row: ProductTypeResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function ProductTypeTable({
  isLoading, columns, data, children, onRowDoubleClick,
  enableRowSelection, rowSelection, onRowSelectionChange,
}: ProductTypeTableProps) {
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
