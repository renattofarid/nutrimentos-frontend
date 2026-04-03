import { DataTable } from "@/components/DataTable";
import type { SettingResource } from "../lib/setting.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface SettingTableProps {
  isLoading: boolean;
  columns: ColumnDef<SettingResource>[];
  data: SettingResource[];
  children?: React.ReactNode;
  onRowDoubleClick?: (row: SettingResource) => void;
}

export default function SettingTable({
  isLoading,
  columns,
  data,
  children,
  onRowDoubleClick,
}: SettingTableProps) {
  return (
    <DataTable isLoading={isLoading} columns={columns} data={data} onRowDoubleClick={onRowDoubleClick}>
      {children}
    </DataTable>
  );
}
