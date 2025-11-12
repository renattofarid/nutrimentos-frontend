import type { ColumnDef } from "@tanstack/react-table";
import type { DocumentTypeResource } from "../lib/document-type.interface";
import { DataTable } from "@/components/DataTable";

interface DocumentTypeTableProps {
  data: DocumentTypeResource[];
  columns: ColumnDef<DocumentTypeResource, any>[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function DocumentTypeTable({
  data,
  columns,
  isLoading,
  children,
}: DocumentTypeTableProps) {
  return (
    <DataTable data={data} columns={columns} isLoading={isLoading}>
      {children}
    </DataTable>
  );
}

