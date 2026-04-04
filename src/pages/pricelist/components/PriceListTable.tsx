import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";
import type { PriceList } from "../lib/pricelist.interface";
import { DataTable } from "@/components/DataTable";

interface PriceListTableProps {
  columns: ColumnDef<PriceList>[];
  data: PriceList[];
  isLoading: boolean;
  children?: React.ReactNode;
  onRowDoubleClick?: (row: PriceList) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function PriceListTable({
  columns,
  data,
  isLoading,
  children,
  onRowDoubleClick,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
}: PriceListTableProps) {
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
      initialColumnVisibility={{
        weight_ranges: false,
        product_prices: false,
      }}
    >
      {children}
    </DataTable>
  );
}
