import { DataTable } from "@/components/DataTable.tsx";
import type { DeliverySheetResource } from "../lib/deliverysheet.interface";
import type {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<DeliverySheetResource>[];
  data: DeliverySheetResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onRowDoubleClick?: (row: DeliverySheetResource) => void;
}

export default function DeliverySheetTable({
  columns,
  data,
  children,
  isLoading,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  onRowDoubleClick,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        enableRowSelection={enableRowSelection}
        enableMultiRowSelection={false}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        onRowDoubleClick={onRowDoubleClick}
        getRowId={(row) => row.id.toString()}
        initialColumnVisibility={{
          id: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
