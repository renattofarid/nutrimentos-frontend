"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { SUPPLIER_ROLE_CODE } from "@/pages/supplier/lib/supplier.interface";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { usePurchaseStore } from "../lib/purchase.store";
import type { PurchaseSchema } from "../lib/purchase.schema";
import { PURCHASE } from "../lib/purchase.interface";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

export default function PurchaseAddPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setOpen, setOpenMobile } = useSidebar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { MODEL, ICON } = PURCHASE;
  const { data: suppliers, refetch: refetchSuppliers } = useAllPersons({
    role_names: [SUPPLIER_ROLE_CODE],
  });
  const {
    data: warehouses,
    isLoading: warehousesLoading,
    refetch: refetchWarehouses,
  } = useAllWarehouses();
  const {
    data: branches,
    isLoading: branchesLoading,
    refetch: refetchBranches,
  } = useAllBranches({
    company_id: user?.company_id.toString(),
  });
  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useAllProducts();
  const { createPurchase } = usePurchaseStore();

  useEffect(() => {
    refetchSuppliers();
    refetchWarehouses();
    refetchBranches();
    refetchProducts();
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const isLoading =
    !suppliers || warehousesLoading || productsLoading || branchesLoading;

  const getDefaultValues = (): Partial<PurchaseSchema> => ({
    supplier_id: "",
    warehouse_id: "",
    purchase_order_id: "",
    document_type: "FACTURA",
    document_number: "",
    issue_date: "",
    reception_date: "",
    due_date: "",
    payment_type: "CONTADO",
    include_igv: false,
    currency: "PEN",
    details: [],
    installments: [],
  });

  const handleSubmit = async (data: PurchaseSchema) => {
    setIsSubmitting(true);
    try {
      await createPurchase(data);
      successToast("Compra creada correctamente");
      navigate("/compras");
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper size="3xl">
        <div className="mb-6 h-full">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper size="3xl">
      <div className="flex items-center gap-4 mb-4">
        <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
      </div>

      {suppliers &&
        suppliers.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        products &&
        products.length > 0 && (
          <PurchaseForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            suppliers={suppliers}
            warehouses={warehouses}
            products={products}
            branches={branches ?? []}
            onCancel={() => navigate("/compras")}
            onRefreshSuppliers={refetchSuppliers}
          />
        )}
    </PageWrapper>
  );
}
