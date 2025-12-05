"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { SUPPLIER_ROLE_CODE } from "@/pages/supplier/lib/supplier.interface";
import { usePurchaseStore } from "../lib/purchase.store";
import { PURCHASE, type PurchaseResource } from "../lib/purchase.interface";
import type { PurchaseSchema } from "../lib/purchase.schema";
import { useAllCompanies } from "@/pages/company/lib/company.hook";

export default function PurchaseEditPage() {
  const { ICON } = PURCHASE;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companies, isLoading: companiesLoading } = useAllCompanies();
  const { data: suppliers, refetch: refetchSuppliers } = useAllPersons({
    role_names: [SUPPLIER_ROLE_CODE],
  });
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  const { updatePurchase, fetchPurchase, purchase, isFinding } =
    usePurchaseStore();

  const isLoading =
    companiesLoading ||
    !suppliers ||
    warehousesLoading ||
    productsLoading ||
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
      company_id: data.company_id?.toString(),
      supplier_id: data.supplier_id?.toString(),
      warehouse_id: data.warehouse_id?.toString(),
      purchase_order_id: data.purchase_order_id?.toString() || "",
      document_type: data.document_type,
      document_number: data.document_number,
      issue_date: data.issue_date?.split("T")[0], // Formato YYYY-MM-DD
      reception_date: data.reception_date?.split("T")[0],
      due_date: data.due_date?.split("T")[0],
      payment_type: data.payment_type,
      include_igv: data.include_igv || false,
      currency: data.currency,
      details: data.details.map((detail) => ({
        product_id: detail.product.id.toString(),
        quantity: detail.quantity.toString(),
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
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!purchase) {
    return (
      <FormWrapper>
        <div className="flex items-center gap-4 mb-6">
          <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Compra no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Compra" mode="edit" icon={ICON} />
        </div>
      </div>

      {companies &&
        companies.length > 0 &&
        suppliers &&
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
            companies={companies}
            suppliers={suppliers}
            warehouses={warehouses}
            products={products}
            purchase={purchase}
            onCancel={() => navigate("/compras")}
            onRefreshSuppliers={refetchSuppliers}
          />
        )}
    </FormWrapper>
  );
}
