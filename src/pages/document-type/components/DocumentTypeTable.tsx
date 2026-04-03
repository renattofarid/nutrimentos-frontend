import type { ColumnDef } from "@tanstack/react-table";
import type { DocumentTypeResource } from "../lib/document-type.interface";
import { DataTable } from "@/components/DataTable";

interface DocumentTypeTableProps {
  data: DocumentTypeResource[];
  columns: ColumnDef<DocumentTypeResource, any>[];
  isLoading?: boolean;
  children?: React.ReactNode;
  onRowDoubleClick?: (row: DocumentTypeResource) => void;
}

export default function DocumentTypeTable({
  data,
  columns,
  isLoading,
  children,
  onRowDoubleClick,
}: DocumentTypeTableProps) {
  return (
    <DataTable data={data} columns={columns} isLoading={isLoading} onRowDoubleClick={onRowDoubleClick}>
      {children}
    </DataTable>
  );
}

