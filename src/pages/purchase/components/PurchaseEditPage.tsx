"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { SUPPLIER_ROLE_CODE } from "@/pages/supplier/lib/supplier.interface";
import { usePurchaseStore } from "../lib/purchase.store";
import { PURCHASE, type PurchaseResource } from "../lib/purchase.interface";
import type { PurchaseSchema } from "../lib/purchase.schema";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

export default function PurchaseEditPage() {
  const { ICON } = PURCHASE;
  const { user } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: suppliers, refetch: refetchSuppliers } = useAllPersons({
    role_names: [SUPPLIER_ROLE_CODE],
  });
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: branches, isLoading: branchesLoading } = useAllBranches({
    company_id: user?.company_id.toString(),
  });
  const { updatePurchase, fetchPurchase, purchase, isFinding } =
    usePurchaseStore();
  const { setOpen, setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const isLoading =
    !suppliers ||
    warehousesLoading ||
    productsLoading ||
    branchesLoading ||
    isFinding;

  useEffect(() => {
    if (!id) {
      navigate("/compras");
      return;
    }
    fetchPurchase(Number(id));
  }, [id, navigate, fetchPurchase]);

  const mapPurchaseToForm = (
    data: PurchaseResource
  ): Partial<PurchaseSchema> => {
    return {
      branch_id: data.branch_id?.toString(),
      supplier_id: data.supplier_id?.toString(),
      warehouse_id: data.warehouse_id?.toString(),
      purchase_order_id: data.purchase_order_id?.toString() || "",
      document_type: data.document_type,
      document_number: data.document_number,
      reference_number: data.reference_number || "",
      issue_date: data.issue_date?.split("T")[0], // Formato YYYY-MM-DD
      reception_date: data.reception_date?.split("T")[0],
      due_date: data.due_date?.split("T")[0],
      payment_type: data.payment_type,
      include_igv: data.include_igv || false,
      include_cost_account: data.include_cost_account ?? true,
      discount_global: data.discount_global || 0,
      freight_cost: data.freight_cost || 0,
      loading_cost: data.loading_cost || 0,
      currency: data.currency,
      observations: data.observations || "",
      details: data.details.map((detail) => ({
        product_id: detail.product.id.toString(),
        quantity_kg: detail.quantity_kg.toString(),
        quantity_sacks: detail.quantity_sacks.toString(),
        unit_price: detail.unit_price.toString(),
        tax: detail.tax.toString(),
      })),
      installments: data.installments.map((installment) => ({
        due_days: installment.due_days.toString(),
        amount: installment.amount.toString(),
      })),
    };
  };

  const handleSubmit = async (data: PurchaseSchema) => {
    if (!purchase || !id) return;

    setIsSubmitting(true);
    try {
      await updatePurchase(Number(id), data);
      successToast("Compra actualizada correctamente");
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
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  if (!purchase) {
    return (
      <PageWrapper size="3xl">
        <div className="flex items-center gap-4 mb-6">
          <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Compra no encontrada</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper size="3xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
        </div>
      </div>

      {suppliers &&
        suppliers.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        products &&
        products.length > 0 && (
          <PurchaseForm
            defaultValues={mapPurchaseToForm(purchase)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="update"
            suppliers={suppliers}
            warehouses={warehouses}
            products={products}
            purchase={purchase}
            branches={branches ?? []}
            onCancel={() => navigate("/compras")}
            onRefreshSuppliers={refetchSuppliers}
          />
        )}
    </PageWrapper>
  );
}
