import { DataTable } from "@/components/DataTable";
import type { PaymentConceptResource } from "../lib/payment-concept.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface PaymentConceptTableProps {
  isLoading: boolean;
  columns: ColumnDef<PaymentConceptResource>[];
  data: PaymentConceptResource[];
  children?: React.ReactNode;
  onRowDoubleClick?: (row: PaymentConceptResource) => void;
}

export default function PaymentConceptTable({
  isLoading,
  columns,
  data,
  children,
  onRowDoubleClick,
}: PaymentConceptTableProps) {
  return (
    <DataTable isLoading={isLoading} columns={columns} data={data} onRowDoubleClick={onRowDoubleClick}>
      {children}
    </DataTable>
  );
}
