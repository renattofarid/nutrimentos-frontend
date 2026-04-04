import { DataTable } from "@/components/DataTable";
import type { DocumentTypeResource } from "../lib/document-type.interface";
import type { ColumnDef, RowSelectionState, OnChangeFn } from "@tanstack/react-table";

interface DocumentTypeTableProps {
  isLoading?: boolean;
  columns: ColumnDef<DocumentTypeResource, any>[];
  data: DocumentTypeResource[];
  children?: React.ReactNode;
  onRowDoubleClick?: (row: DocumentTypeResource) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export default function DocumentTypeTable({
  isLoading, columns, data, children, onRowDoubleClick,
  enableRowSelection, rowSelection, onRowSelectionChange,
}: DocumentTypeTableProps) {
  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      data={data}
      onRowDoubleClick={onRowDoubleClick}
      enableRowSelection={enableRowSelection}
      enableMultiRowSelection={false}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      getRowId={(row) => row.id.toString()}
    >
      {children}
    </DataTable>
  );
}
