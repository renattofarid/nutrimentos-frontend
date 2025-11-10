import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseInstallment } from "../lib/purchaseinstallment.hook";
import TitleComponent from "@/components/TitleComponent";
import PurchaseInstallmentTable from "./PurchaseInstallmentTable";
import PurchaseInstallmentOptions from "./PurchaseInstallmentOptions";
import { PurchaseInstallmentColumns } from "./PurchaseInstallmentColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PURCHASE_INSTALLMENT } from "../lib/purchaseinstallment.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = PURCHASE_INSTALLMENT;

export default function PurchaseInstallmentPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const { data, meta, isLoading, refetch } = usePurchaseInstallment();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleViewPurchase = (purchaseId: number) => {
    navigate(`/compra/${purchaseId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural || "Cuotas de Compra"}
          subtitle={MODEL.description}
          icon={ICON}
        />
      </div>

      <PurchaseInstallmentTable
        isLoading={isLoading}
        columns={PurchaseInstallmentColumns({
          onViewPurchase: handleViewPurchase,
        })}
        data={data || []}
      >
        <PurchaseInstallmentOptions search={search} setSearch={setSearch} />
      </PurchaseInstallmentTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />
    </div>
  );
}
