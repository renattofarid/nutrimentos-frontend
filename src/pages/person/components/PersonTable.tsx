import { DataTable } from "@/components/DataTable.tsx";
import type { PersonResource } from "../lib/person.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<PersonResource>[];
  data: PersonResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  isClientTable?: boolean;
  onRowDoubleClick?: (row: PersonResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function PersonTable({
  columns,
  data,
  children,
  isLoading,
  isClientTable = false,
  onRowDoubleClick,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onRowDoubleClick={onRowDoubleClick}
        enableRowSelection={enableRowSelection}
        enableMultiRowSelection={false}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={(row) => row.id.toString()}
        initialColumnVisibility={{
          id: false,
          email: false,
          type_person: true,
          birth_date: false,
          address: false,
          zone_name: isClientTable,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
