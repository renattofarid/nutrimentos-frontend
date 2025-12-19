import { DataTable } from "@/components/DataTable.tsx";
import type { DeliverySheetResource } from "../lib/deliverysheet.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<DeliverySheetResource>[];
  data: DeliverySheetResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function DeliverySheetTable({
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
        initialColumnVisibility={{
          id: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
