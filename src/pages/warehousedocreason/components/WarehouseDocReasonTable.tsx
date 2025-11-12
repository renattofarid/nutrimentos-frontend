import { DataTable } from "@/components/DataTable";
import type { WarehouseDocReasonResource } from "../lib/warehousedocreason.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<WarehouseDocReasonResource>[];
  data: WarehouseDocReasonResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WarehouseDocReasonTable({
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
