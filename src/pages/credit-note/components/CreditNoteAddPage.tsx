"use client";

import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";

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
import { getCreditNoteTicket } from "../lib/credit-note.actions";
import FormSkeleton from "@/components/FormSkeleton";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useAllCreditNoteMotives } from "@/pages/credit-note-motive/lib/credit-note-motive.hook";
import PageWrapper from "@/components/PageWrapper";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

const { MODEL, ROUTE } = CREDIT_NOTE;

export default function CreditNoteAddPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedSale: SaleResource | undefined = location.state?.sale;
  const isReadOnlySale = !!preselectedSale;

  const { createCreditNote } = useCreditNoteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(
    preselectedSale?.id || null,
  );
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [pendingCreditNoteId, setPendingCreditNoteId] = useState<number | null>(null);

  // Obtener ventas (solo necesario cuando no hay venta preseleccionada) y motivos
  const { data: sales, isLoading: isLoadingSales } = useAllSales();
  const { data: motives, isLoading: isLoadingMotives } =
    useAllCreditNoteMotives();

  // Obtener la venta seleccionada
  const selectedSale = useMemo(
    () =>
      preselectedSale ||
      sales?.find((sale) => sale.id === selectedSaleId) ||
      null,
    [preselectedSale, sales, selectedSaleId],
  );

  // Transformar datos para los selects (solo cuando no hay venta preseleccionada)
  const salesOptions = useMemo(
    () =>
      isReadOnlySale
        ? []
        : sales?.map((sale) => {
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
    [isReadOnlySale, sales],
  );

  const motivesOptions = useMemo(
    () =>
      motives?.map((motive) => ({
        value: motive.id.toString(),
        label: `${motive.code} - ${motive.name}`,
      })) || [],
    [motives],
  );

  const handleSubmit = async (data: CreditNoteSchema) => {
    setIsSubmitting(true);
    try {
      const creditNoteId = await createCreditNote({
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
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      if (creditNoteId) {
        setPendingCreditNoteId(creditNoteId);
        setShowPrintDialog(true);
      } else {
        navigate(ROUTE);
      }
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

  const handlePrintConfirm = async () => {
    if (pendingCreditNoteId) {
      try {
        const blob = await getCreditNoteTicket(pendingCreditNoteId);
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } catch {
        // Si falla la exportación, continuamos igual
      }
    }
    setShowPrintDialog(false);
    navigate(ROUTE);
  };

  const handlePrintCancel = () => {
    setShowPrintDialog(false);
    navigate(ROUTE);
  };

  // Mostrar skeleton mientras cargan los datos
  if ((isReadOnlySale ? false : isLoadingSales) || isLoadingMotives) {
    return (
      <PageWrapper>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <CreditNoteForm
        defaultValues={
          preselectedSale ? { sale_id: preselectedSale.id.toString() } : {}
        }
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTE)}
        isSubmitting={isSubmitting}
        sales={salesOptions}
        motives={motivesOptions}
        selectedSale={selectedSale}
        onSaleChange={setSelectedSaleId}
        readOnlySale={isReadOnlySale}
      />

      <ConfirmationDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        icon="info"
        title="Nota de crédito registrada"
        description="¿Deseas imprimir el ticket?"
        confirmText="Sí, imprimir"
        cancelText="No, omitir"
        onConfirm={handlePrintConfirm}
        onCancel={handlePrintCancel}
      />
    </PageWrapper>
  );
}
