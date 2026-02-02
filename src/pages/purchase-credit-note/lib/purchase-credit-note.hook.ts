import { useEffect } from "react";
import { usePurchaseCreditNoteStore } from "./purchase-credit-note.store";

// Hook para listado paginado
export function usePurchaseCreditNote(params?: Record<string, unknown>) {
  const {
    purchaseCreditNotes,
    meta,
    isLoading,
    error,
    fetchPurchaseCreditNotes,
  } = usePurchaseCreditNoteStore();

  useEffect(() => {
    if (!purchaseCreditNotes) fetchPurchaseCreditNotes(params);
  }, [purchaseCreditNotes, fetchPurchaseCreditNotes]);

  return {
    data: purchaseCreditNotes,
    meta,
    isLoading,
    error,
    refetch: fetchPurchaseCreditNotes,
  };
}

// Hook para obtener todos (sin paginación)
export function useAllPurchaseCreditNotes() {
  const {
    allPurchaseCreditNotes,
    isLoadingAll,
    error,
    fetchAllPurchaseCreditNotes,
  } = usePurchaseCreditNoteStore();

  useEffect(() => {
    if (!allPurchaseCreditNotes) fetchAllPurchaseCreditNotes();
  }, [allPurchaseCreditNotes, fetchAllPurchaseCreditNotes]);

  return {
    data: allPurchaseCreditNotes,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllPurchaseCreditNotes,
  };
}

// Hook para obtener por ID
export function usePurchaseCreditNoteById(id: number) {
  const { purchaseCreditNote, isFinding, error, fetchPurchaseCreditNote } =
    usePurchaseCreditNoteStore();

  useEffect(() => {
    if (id) fetchPurchaseCreditNote(id);
  }, [id]);

  return {
    data: purchaseCreditNote,
    isFinding,
    error,
    refetch: () => fetchPurchaseCreditNote(id),
  };
}

// Hook para tipos de nota de crédito de compra
export function useAllPurchaseCreditNoteTypes() {
  const { creditNoteTypes, isLoadingTypes, error, fetchCreditNoteTypes } =
    usePurchaseCreditNoteStore();

  useEffect(() => {
    if (!creditNoteTypes) fetchCreditNoteTypes();
  }, [creditNoteTypes, fetchCreditNoteTypes]);

  return {
    data: creditNoteTypes,
    isLoading: isLoadingTypes,
    error,
    refetch: fetchCreditNoteTypes,
  };
}
