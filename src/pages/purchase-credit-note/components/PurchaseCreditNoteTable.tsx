import { DataTable } from "@/components/DataTable.tsx";
import type { PurchaseCreditNoteResource } from "../lib/purchase-credit-note.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<PurchaseCreditNoteResource>[];
  data: PurchaseCreditNoteResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: PurchaseCreditNoteResource) => void;
}

export default function PurchaseCreditNoteTable({
  columns,
  data,
  children,
  isLoading,
  onRowDoubleClick,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onRowDoubleClick={onRowDoubleClick}
        initialColumnVisibility={{
          created_at: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
