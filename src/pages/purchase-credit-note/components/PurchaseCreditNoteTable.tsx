import { DataTable } from "@/components/DataTable.tsx";
import type { PurchaseCreditNoteResource } from "../lib/purchase-credit-note.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<PurchaseCreditNoteResource>[];
  data: PurchaseCreditNoteResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PurchaseCreditNoteTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
