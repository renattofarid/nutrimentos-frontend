"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PurchaseCreditNoteForm } from "./PurchaseCreditNoteForm";
import { type PurchaseCreditNoteSchema } from "../lib/purchase-credit-note.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PURCHASE_CREDIT_NOTE } from "../lib/purchase-credit-note.interface";
import FormWrapper from "@/components/FormWrapper";
import { usePurchaseCreditNoteStore } from "../lib/purchase-credit-note.store";
import FormSkeleton from "@/components/FormSkeleton";
import { useAllPurchases } from "@/pages/purchase/lib/purchase.hook";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllPurchaseCreditNoteTypes } from "../lib/purchase-credit-note.hook";

const { MODEL, ROUTE, ICON } = PURCHASE_CREDIT_NOTE;

export default function PurchaseCreditNoteAddPage() {
  const navigate = useNavigate();
  const { createPurchaseCreditNote } = usePurchaseCreditNoteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(
    null,
  );

  const { data: purchases, isLoading: isLoadingPurchases } = useAllPurchases();
  const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();
  const { data: warehouses, isLoading: isLoadingWarehouses } =
    useAllWarehouses();
  const { data: creditNoteTypes, isLoading: isLoadingTypes } =
    useAllPurchaseCreditNoteTypes();

  const selectedPurchase = useMemo(
    () =>
      purchases?.find((purchase) => purchase.id === selectedPurchaseId) || null,
    [purchases, selectedPurchaseId],
  );

  const purchasesOptions = useMemo(
    () =>
      purchases?.map((purchase) => ({
        value: purchase.id.toString(),
        label: `${purchase.document_type} ${purchase.document_number} - ${purchase.supplier_fullname}`,
      })) || [],
    [purchases],
  );

  const suppliersOptions = useMemo(
    () =>
      suppliers?.map((supplier) => ({
        value: supplier.id.toString(),
        label:
          supplier.business_name ||
          [supplier.names, supplier.father_surname, supplier.mother_surname]
            .filter(Boolean)
            .join(" "),
      })) || [],
    [suppliers],
  );

  const warehousesOptions = useMemo(
    () =>
      warehouses?.map((warehouse) => ({
        value: warehouse.id.toString(),
        label: warehouse.name,
      })) || [],
    [warehouses],
  );

  const creditNoteTypesOptions = useMemo(
    () =>
      creditNoteTypes?.map((type) => ({
        value: type.id.toString(),
        label: `${type.code} - ${type.name}`,
      })) || [],
    [creditNoteTypes],
  );

  const handleSubmit = async (data: PurchaseCreditNoteSchema) => {
    setIsSubmitting(true);
    try {
      await createPurchaseCreditNote({
        purchase_id:
          data.is_detailed && data.purchase_id
            ? Number(data.purchase_id)
            : null,
        supplier_id: Number(data.supplier_id),
        warehouse_id: data.warehouse_id ? Number(data.warehouse_id) : null,
        document_type: data.document_type,
        issue_date: data.issue_date,
        affected_document_type: data.affected_document_type,
        affected_document_number: data.affected_document_number,
        affected_issue_date: data.affected_issue_date,
        credit_note_type_id: Number(data.credit_note_type_id),
        credit_note_description: data.credit_note_description || null,
        currency: data.currency || null,
        observations: data.observations || null,
        subtotal: !data.is_detailed ? data.subtotal : null,
        tax_amount: !data.is_detailed ? data.tax_amount : null,
        total_amount: !data.is_detailed ? data.total_amount : null,
        details:
          data.is_detailed && data.details
            ? data.details.map((detail) => ({
                purchase_detail_id: detail.purchase_detail_id || null,
                product_id: detail.product_id,
                quantity_sacks: detail.quantity_sacks,
                quantity_kg: detail.quantity_kg,
                unit_price: detail.unit_price,
                description: detail.description || null,
              }))
            : null,
      });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        ERROR_MESSAGE(MODEL, "create");
      errorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    isLoadingPurchases ||
    isLoadingSuppliers ||
    isLoadingWarehouses ||
    isLoadingTypes
  ) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title={PURCHASE_CREDIT_NOTE.TITLES.create.title}
          icon={ICON}
        />
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent
        title={PURCHASE_CREDIT_NOTE.TITLES.create.title}
        icon={ICON}
      />

      <PurchaseCreditNoteForm
        defaultValues={{}}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTE)}
        isSubmitting={isSubmitting}
        mode="create"
        purchases={purchasesOptions}
        suppliers={suppliersOptions}
        warehouses={warehousesOptions}
        creditNoteTypes={creditNoteTypesOptions}
        selectedPurchase={selectedPurchase}
        onPurchaseChange={setSelectedPurchaseId}
      />
    </FormWrapper>
  );
}
