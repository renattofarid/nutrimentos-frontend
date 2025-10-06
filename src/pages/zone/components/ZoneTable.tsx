import { DataTable } from "@/components/DataTable.tsx";
import type { ZoneResource } from "../lib/zone.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<ZoneResource>[];
  data: ZoneResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ZoneTable({
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
