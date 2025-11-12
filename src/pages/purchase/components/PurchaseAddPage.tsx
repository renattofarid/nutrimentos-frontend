"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseForm } from "./PurchaseForm";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { SUPPLIER_ROLE_CODE } from "@/pages/supplier/lib/supplier.interface";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { usePurchaseStore } from "../lib/purchase.store";
import type { PurchaseSchema } from "../lib/purchase.schema";

export default function PurchaseAddPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companies, isLoading: companiesLoading } = useAllCompanies();
  const suppliers = useAllPersons({ role_names: [SUPPLIER_ROLE_CODE] });
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  const { createPurchase } = usePurchaseStore();

  const isLoading =
    companiesLoading || !suppliers || warehousesLoading || productsLoading;

  const getDefaultValues = (): Partial<PurchaseSchema> => ({
    company_id: "",
    supplier_id: "",
    warehouse_id: "",
    purchase_order_id: "",
    document_type: "",
    document_number: "",
    issue_date: "",
    reception_date: "",
    due_date: "",
    payment_type: "",
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
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BackButton to="/compras" />
            <TitleFormComponent title="Compra" mode="create" />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title="Compra" mode="create" />
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
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            companies={companies}
            suppliers={suppliers}
            warehouses={warehouses}
            products={products}
            onCancel={() => navigate("/compras")}
          />
        )}
    </FormWrapper>
  );
}
