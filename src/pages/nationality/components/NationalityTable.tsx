import { DataTable } from "@/components/DataTable";
import type { NationalityResource } from "../lib/nationality.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface NationalityTableProps {
  isLoading: boolean;
  columns: ColumnDef<NationalityResource>[];
  data: NationalityResource[];
  children?: React.ReactNode;
  onRowDoubleClick?: (row: NationalityResource) => void;
}

export default function NationalityTable({
  isLoading,
  columns,
  data,
  children,
  onRowDoubleClick,
}: NationalityTableProps) {
  return (
    <DataTable isLoading={isLoading} columns={columns} data={data} onRowDoubleClick={onRowDoubleClick}>
      {children}
    </DataTable>
  );
}
