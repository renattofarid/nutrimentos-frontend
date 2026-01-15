"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { CreditNoteForm } from "./CreditNoteForm";
import { type CreditNoteSchema } from "../lib/credit-note.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import FormWrapper from "@/components/FormWrapper";
import { useCreditNoteStore } from "../lib/credit-note.store";
import FormSkeleton from "@/components/FormSkeleton";
import { useAllSales } from "@/pages/sale/lib/sale.hook";
import { useAllCreditNoteMotives } from "@/pages/credit-note-motive/lib/credit-note-motive.hook";

const { MODEL, ROUTE, ICON } = CREDIT_NOTE;

export default function CreditNoteAddPage() {
  const navigate = useNavigate();
  const { createCreditNote } = useCreditNoteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // Obtener ventas y motivos
  const { data: sales, isLoading: isLoadingSales } = useAllSales();
  const { data: motives, isLoading: isLoadingMotives } =
    useAllCreditNoteMotives();

  // Obtener la venta seleccionada
  const selectedSale = useMemo(
    () => sales?.find((sale) => sale.id === selectedSaleId) || null,
    [sales, selectedSaleId]
  );

  // Transformar datos para los selects
  const salesOptions = useMemo(
    () =>
      sales?.map((sale) => {
        const customer = sale.customer ?? {};
        const name =
          customer.full_name?.trim() ||
          customer.business_name?.trim() ||
          [customer.names, customer.father_surname, customer.mother_surname]
            .filter((s) => s && s.toString().trim() !== "")
            .join(" ");
        return {
          value: sale.id.toString(),
          label: `${sale.serie}-${sale.numero} - ${name || ""}`,
        };
      }) || [],
    [sales]
  );

  const motivesOptions = useMemo(
    () =>
      motives?.map((motive) => ({
        value: motive.id.toString(),
        label: `${motive.code} - ${motive.name}`,
      })) || [],
    [motives]
  );

  const handleSubmit = async (data: CreditNoteSchema) => {
    setIsSubmitting(true);
    try {
      await createCreditNote({
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

  // Mostrar skeleton mientras cargan los datos
  if (isLoadingSales || isLoadingMotives) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title={CREDIT_NOTE.TITLES.create.title}
          icon={ICON}
        />
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent title={CREDIT_NOTE.TITLES.create.title} icon={ICON} />

      <CreditNoteForm
        defaultValues={{}}
        onSubmit={handleSubmit}
        onCancel={() => navigate(ROUTE)}
        isSubmitting={isSubmitting}
        sales={salesOptions}
        motives={motivesOptions}
        selectedSale={selectedSale}
        onSaleChange={setSelectedSaleId}
      />
    </FormWrapper>
  );
}
