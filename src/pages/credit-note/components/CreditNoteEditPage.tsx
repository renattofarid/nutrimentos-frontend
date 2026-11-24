"use client";

import { toDateInputValue } from "../lib/credit-note.date";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CreditNoteForm } from "./CreditNoteForm";
import { type CreditNoteSchema } from "../lib/credit-note.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import { useCreditNoteStore } from "../lib/credit-note.store";
import FormSkeleton from "@/components/FormSkeleton";
import { useSaleById } from "@/pages/sale/lib/sale.hook";
import PageWrapper from "@/components/PageWrapper";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";

const { MODEL, ROUTE } = CREDIT_NOTE;

export default function CreditNoteEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const creditNoteId = Number(id);

  const { fetchCreditNote, creditNote, isFinding, updateCreditNote } =
    useCreditNoteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  useEffect(() => {
    if (creditNoteId) fetchCreditNote(creditNoteId);
  }, [creditNoteId]);

  useEffect(() => {
    if (creditNote?.sale?.id) {
      setSelectedSaleId(creditNote.sale.id);
    }
  }, [creditNote]);

  // Solo se trae la venta de esta nota (no todo el listado)
  const { data: saleById, isLoading: isLoadingSales } = useSaleById(
    selectedSaleId ?? 0,
  );

  const selectedSale = useMemo<SaleResource | null>(
    () => (selectedSaleId ? (saleById?.data ?? null) : null),
    [saleById, selectedSaleId],
  );

  const defaultValues = useMemo<Partial<CreditNoteSchema>>(() => {
    if (!creditNote) return {};
    return {
      sale_id: creditNote.sale?.id?.toString() ?? "0",
      issue_date: toDateInputValue(creditNote.issue_date),
      credit_note_motive_id: creditNote.credit_note_motive_id?.toString() ?? "1",
      affects_stock: creditNote.affects_stock ?? true,
      observations: creditNote.observations ?? "",
      details: creditNote.details?.map((d) => ({
        sale_detail_id: d.sale_detail_id,
        product_id: d.product_id,
        product_code: d.product_code ?? "",
        product_name: d.product_name ?? "",
        product_weight: 0,
        original_quantity_sacks: 0,
        original_quantity_kg: 0,
        quantity_sacks: parseFloat(d.quantity_sacks) || 0,
        quantity_kg: parseFloat(d.quantity_kg) || 0,
        unit_price: parseFloat(d.unit_price) || 0,
      })) ?? [],
    };
  }, [creditNote]);

  const handleSubmit = async (data: CreditNoteSchema) => {
    setIsSubmitting(true);
    try {
      await updateCreditNote(creditNoteId, {
        issue_date: data.issue_date,
        credit_note_motive_id: Number(data.credit_note_motive_id),
        affects_stock: data.affects_stock,
        observations: data.observations || "",
        details: data.details.map((detail) => ({
          sale_detail_id: detail.sale_detail_id,
          product_id: detail.product_id,
          quantity_sacks: detail.quantity_sacks,
          quantity_kg: detail.quantity_kg,
          unit_price: detail.unit_price,
        })),
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

  if (isFinding || isLoadingSales) {
    return (
      <PageWrapper>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  if (!creditNote) {
    return (
      <PageWrapper>
        <p className="text-muted-foreground">No se encontró la nota de crédito.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <CreditNoteForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTE)}
        isSubmitting={isSubmitting}
        selectedSale={selectedSale}
        onSaleChange={setSelectedSaleId}
        readOnlySale={true}
        isEdit={true}
      />
    </PageWrapper>
  );
}
