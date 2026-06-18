"use client";

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
import { useAllSales } from "@/pages/sale/lib/sale.hook";
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

  const { data: sales, isLoading: isLoadingSales } = useAllSales();

  useEffect(() => {
    if (creditNoteId) fetchCreditNote(creditNoteId);
  }, [creditNoteId]);

  useEffect(() => {
    if (creditNote?.sale?.id) {
      setSelectedSaleId(creditNote.sale.id);
    }
  }, [creditNote]);

  const selectedSale = useMemo<SaleResource | null>(() => {
    if (!sales || !selectedSaleId) return null;
    return sales.find((s) => s.id === selectedSaleId) ?? null;
  }, [sales, selectedSaleId]);

  const salesOptions = useMemo(
    () =>
      sales?.map((sale) => {
        const customer = sale.customer ?? {};
        const name =
          customer.names?.trim() ||
          customer.business_name?.trim() ||
          [customer.names, customer.father_surname, customer.mother_surname]
            .filter((s) => typeof s === "string" && s.trim() !== "")
            .join(" ");
        return {
          value: sale.id.toString(),
          label: `${sale.serie}-${sale.numero} - ${name || ""}`,
        };
      }) || [],
    [sales],
  );

  const defaultValues = useMemo<Partial<CreditNoteSchema>>(() => {
    if (!creditNote) return {};
    return {
      sale_id: creditNote.sale?.id?.toString() ?? "0",
      issue_date: creditNote.issue_date ?? "",
      credit_note_motive_id: creditNote.credit_note_motive_id?.toString() ?? "1",
      affects_stock: creditNote.affects_stock ?? true,
      observations: creditNote.observations ?? "",
      details: creditNote.details?.map((d) => ({
        sale_detail_id: d.sale_detail_id,
        product_id: d.product_id,
        product_code: d.product_code ?? "",
        product_name: d.product_name ?? "",
        product_weight: 0,
        original_quantity_sacks: parseFloat(d.quantity) ?? 0,
        original_quantity_kg: 0,
        quantity_sacks: parseFloat(d.quantity) ?? 0,
        quantity_kg: 0,
        unit_price: parseFloat(d.unit_price) ?? 0,
      })) ?? [],
    };
  }, [creditNote]);

  const handleSubmit = async (data: CreditNoteSchema) => {
    setIsSubmitting(true);
    try {
      await updateCreditNote(creditNoteId, {
        sale_id: Number(data.sale_id),
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
        sales={salesOptions}
        selectedSale={selectedSale}
        onSaleChange={setSelectedSaleId}
        readOnlySale={true}
      />
    </PageWrapper>
  );
}
