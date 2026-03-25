import { useEffect, useState } from "react";
import { useWarehouseProduct } from "../lib/warehouse-product.hook";
import WarehouseProductTable from "./WarehouseProductTable";
import WarehouseProductOptions from "./WarehouseProductOptions";
import { WarehouseProductColumns } from "./WarehouseProductColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

export default function WarehouseProductPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const { data, meta, isLoading, refetch } = useWarehouseProduct();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  return (
    <PageWrapper>
      <WarehouseProductTable
        isLoading={isLoading}
        columns={WarehouseProductColumns()}
        data={data || []}
      >
        <WarehouseProductOptions search={search} setSearch={setSearch} />
      </WarehouseProductTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />
    </PageWrapper>
  );
}
