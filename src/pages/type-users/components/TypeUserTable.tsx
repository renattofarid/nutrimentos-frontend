import { DataTable } from "@/components/DataTable.tsx";
import type { TypeUserResource } from "../lib/typeUser.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<TypeUserResource>[];
  data: TypeUserResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onRowDoubleClick?: (row: TypeUserResource) => void;
}

export default function TypeUserTable({
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
