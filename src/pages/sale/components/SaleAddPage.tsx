"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { SaleForm } from "./SaleForm";
import { type SaleSchema } from "../lib/sale.schema";
import { useSaleStore } from "../lib/sales.store";
import { useClients } from "@/pages/client/lib/client.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { SALE } from "../lib/sale.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

export const SaleAddPage = () => {
  const { ICON } = SALE;
  const { setOpen, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { data: branches, isLoading: branchesLoading } = useAllBranches({
    company_id: user?.company_id,
  });
  const {
    data: customers,
    isLoading: customersLoading,
    refetch: onRefreshClients,
  } = useClients();
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const { createSale } = useSaleStore();

  const isLoading =
    branchesLoading || customersLoading || warehousesLoading || productsLoading;

  const getDefaultValues = (): Partial<SaleSchema> => ({
    branch_id: "",
    customer_id: "",
    warehouse_id: "",
    vendedor_id: "",
    document_type: "",
    issue_date: "",
    payment_type: "",
    currency: "",
    observations: "",
    details: [],
    installments: [],
  });

  const handleSubmit = async (data: SaleSchema) => {
    setIsSubmitting(true);
    try {
      await createSale(data);
      successToast("Venta creada correctamente");
      navigate("/ventas");
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Venta" mode="create" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <PageWrapper fluid>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Venta" mode="create" icon={ICON} />
        </div>
      </div>

      {branches &&
        branches.length > 0 &&
        customers &&
        customers.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        products &&
        products.length > 0 && (
          <SaleForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            branches={branches}
            customers={customers}
            warehouses={warehouses}
            products={products}
            onCancel={() => navigate("/ventas")}
            onRefreshClients={onRefreshClients}
          />
        )}
    </PageWrapper>
  );
};
