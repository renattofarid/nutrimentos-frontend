"use client";

import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  useAllPurchaseCreditNoteTypes,
  usePurchaseCreditNoteById,
} from "../lib/purchase-credit-note.hook";

const { MODEL, ROUTE, ICON } = PURCHASE_CREDIT_NOTE;

export default function PurchaseCreditNoteEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const creditNoteId = Number(id);

  const { updatePurchaseCreditNote } = usePurchaseCreditNoteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(
    null,
  );

  const { data: creditNote, isFinding } =
    usePurchaseCreditNoteById(creditNoteId);
  const { data: purchases, isLoading: isLoadingPurchases } = useAllPurchases();
  const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();
  const { data: warehouses, isLoading: isLoadingWarehouses } =
    useAllWarehouses();
  const { data: creditNoteTypes, isLoading: isLoadingTypes } =
    useAllPurchaseCreditNoteTypes();

  const effectivePurchaseId = selectedPurchaseId ?? creditNote?.purchase_id;

  const selectedPurchase = useMemo(
    () =>
      purchases?.find((purchase) => purchase.id === effectivePurchaseId) ||
      null,
    [purchases, effectivePurchaseId],
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

  const defaultValues = useMemo(() => {
    if (!creditNote) return {};
    return {
      is_detailed: creditNote.is_detailed,
      purchase_id: creditNote.purchase_id?.toString() || "",
      supplier_id: creditNote.supplier_id?.toString() || "0",
      warehouse_id: creditNote.warehouse_id?.toString() || "",
      document_type: creditNote.document_type || "FACTURA",
      issue_date: creditNote.issue_date || "",
      affected_document_type: creditNote.affected_document_type || "FACTURA",
      affected_document_number: creditNote.affected_document_number || "",
      affected_issue_date: creditNote.affected_issue_date || "",
      credit_note_type_id: creditNote.credit_note_type_id?.toString() || "0",
      credit_note_description: creditNote.credit_note_description || "",
      currency: creditNote.currency || "PEN",
      observations: creditNote.observations || "",
      subtotal: creditNote.subtotal ? parseFloat(creditNote.subtotal) : 0,
      tax_amount: creditNote.tax_amount
        ? parseFloat(creditNote.tax_amount)
        : 0,
      total_amount: creditNote.total_amount
        ? parseFloat(creditNote.total_amount)
        : 0,
      details: creditNote.is_detailed
        ? creditNote.details?.map((d) => ({
            purchase_detail_id: d.purchase_detail_id,
            product_id: d.product_id,
            quantity_sacks: d.quantity_sacks,
            quantity_kg: d.quantity_kg,
            unit_price: parseFloat(d.unit_price),
            description: d.description || "",
            selected: true,
          }))
        : [],
    };
  }, [creditNote]);

  const handleSubmit = async (data: PurchaseCreditNoteSchema) => {
    setIsSubmitting(true);
    try {
      await updatePurchaseCreditNote(creditNoteId, {
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
        currency: data.currency || "PEN",
        observations: data.observations || null,
        subtotal: !data.is_detailed ? (data.subtotal ?? 0) : undefined,
        tax_amount: !data.is_detailed ? (data.tax_amount ?? 0) : undefined,
        total_amount: !data.is_detailed ? (data.total_amount ?? 0) : undefined,
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
            : undefined,
      });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      navigate(ROUTE);
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        ERROR_MESSAGE(MODEL, "update");
      errorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    isFinding ||
    isLoadingPurchases ||
    isLoadingSuppliers ||
    isLoadingWarehouses ||
    isLoadingTypes
  ) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title={PURCHASE_CREDIT_NOTE.TITLES.update.title}
          icon={ICON}
        />
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!creditNote) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title={PURCHASE_CREDIT_NOTE.TITLES.update.title}
          icon={ICON}
        />
        <p className="text-muted-foreground">
          No se encontró la nota de crédito.
        </p>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent
        title={PURCHASE_CREDIT_NOTE.TITLES.update.title}
        icon={ICON}
      />

      <PurchaseCreditNoteForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTE)}
        isSubmitting={isSubmitting}
        mode="update"
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
