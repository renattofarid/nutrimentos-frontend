import { DataTable } from "@/components/DataTable.tsx";
import type { CreditNoteResource } from "../lib/credit-note.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface Props {
  columns: ColumnDef<CreditNoteResource>[];
  data: CreditNoteResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CreditNoteTable({
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
