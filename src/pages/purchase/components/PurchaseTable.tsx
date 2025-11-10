import { DataTable } from "@/components/DataTable.tsx";
import type { PurchaseResource } from "../lib/purchase.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<PurchaseResource>[];
  data: PurchaseResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PurchaseTable({
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
