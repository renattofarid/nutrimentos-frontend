import type { ColumnDef } from "@tanstack/react-table";
import type { PriceList } from "../lib/pricelist.interface";
import { DataTable } from "@/components/DataTable";

interface PriceListTableProps {
  columns: ColumnDef<PriceList>[];
  data: PriceList[];
  isLoading: boolean;
  children?: React.ReactNode;
}

export default function PriceListTable({
  columns,
  data,
  isLoading,
  children,
}: PriceListTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      initialColumnVisibility={{
        weight_ranges: false,
        product_prices: false,
      }}
    >
      {children}
    </DataTable>
  );
}
