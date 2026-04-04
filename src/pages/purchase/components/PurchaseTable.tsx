import type { RowSelectionState, OnChangeFn } from "@tanstack/react-table";
import type { PurchaseResource } from "../lib/purchase.interface";
import { getPurchaseColumns } from "./PurchaseColumns";
import { DataTable } from "@/components/DataTable";

interface PurchaseTableProps {
  data: PurchaseResource[];
  isLoading: boolean;
  children?: React.ReactNode;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onRowDoubleClick?: (purchase: PurchaseResource) => void;
}

export const PurchaseTable = ({
  data,
  isLoading,
  children,
  rowSelection,
  onRowSelectionChange,
  onRowDoubleClick,
}: PurchaseTableProps) => {
  const columns = getPurchaseColumns();

  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        enableRowSelection={true}
        enableMultiRowSelection={false}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        onRowDoubleClick={onRowDoubleClick}
        getRowId={(row) => String(row.id)}
      >
        {children}
      </DataTable>
    </div>
  );
};
