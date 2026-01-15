import { DataTable } from "@/components/DataTable.tsx";
import type { VehicleResource } from "../lib/vehicle.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<VehicleResource>[];
  data: VehicleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleTable({
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
