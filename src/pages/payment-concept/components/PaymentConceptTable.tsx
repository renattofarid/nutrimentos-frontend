import { DataTable } from "@/components/DataTable";
import type { PaymentConceptResource } from "../lib/payment-concept.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface PaymentConceptTableProps {
  isLoading: boolean;
  columns: ColumnDef<PaymentConceptResource>[];
  data: PaymentConceptResource[];
  children?: React.ReactNode;
}

export default function PaymentConceptTable({
  isLoading,
  columns,
  data,
  children,
}: PaymentConceptTableProps) {
  return (
    <DataTable isLoading={isLoading} columns={columns} data={data}>
      {children}
    </DataTable>
  );
}
