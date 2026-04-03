import { DataTable } from "@/components/DataTable";
import type { WarehouseDocReasonResource } from "../lib/warehousedocreason.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<WarehouseDocReasonResource>[];
  data: WarehouseDocReasonResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: WarehouseDocReasonResource) => void;
}

export default function WarehouseDocReasonTable({
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
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
