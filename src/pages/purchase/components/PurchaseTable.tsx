import type { RowSelectionState, OnChangeFn } from "@tanstack/react-table";
import type { PurchaseResource } from "../lib/purchase.interface";
import { getPurchaseColumns } from "./PurchaseColumns";
import { DataTable } from "@/components/DataTable";

interface PurchaseTableProps {
  data: PurchaseResource[];
  onEdit: (purchase: PurchaseResource) => void;
  onDelete: (id: number) => void;
  onViewDetails: (purchase: PurchaseResource) => void;
  onManage: (purchase: PurchaseResource) => void;
  onQuickPay: (purchase: PurchaseResource) => void;
  isLoading: boolean;
  children?: React.ReactNode;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export const PurchaseTable = ({
  data,
  onEdit,
  onDelete,
  onViewDetails,
  onManage,
  onQuickPay,
  isLoading,
  children,
  rowSelection,
  onRowSelectionChange,
}: PurchaseTableProps) => {
  const columns = getPurchaseColumns({
    onEdit,
    onDelete,
    onViewDetails,
    onManage,
    onQuickPay,
  });

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
        getRowId={(row) => String(row.id)}
      >
        {children}
      </DataTable>
    </div>
  );
};
