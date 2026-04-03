import type { ColumnDef } from "@tanstack/react-table";
import type { UnitResource } from "../lib/unit.interface";
import { DataTable } from "@/components/DataTable";

interface UnitTableProps {
  data: UnitResource[];
  columns: ColumnDef<UnitResource, any>[];
  isLoading?: boolean;
  children?: React.ReactNode;
  onRowDoubleClick?: (row: UnitResource) => void;
}

export default function UnitTable({
  data,
  columns,
  isLoading,
  children,
  onRowDoubleClick,
}: UnitTableProps) {
  return (
    <DataTable data={data} columns={columns} isLoading={isLoading} onRowDoubleClick={onRowDoubleClick}>
      {children}
    </DataTable>
  );
}
