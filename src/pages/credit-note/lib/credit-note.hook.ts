import { useEffect } from "react";
import { useCreditNoteStore } from "./credit-note.store";

// Hook para listado paginado
export function useCreditNote(params?: Record<string, unknown>) {
  const { creditNotes, meta, isLoading, error, fetchCreditNotes } =
    useCreditNoteStore();

  useEffect(() => {
    if (!creditNotes) fetchCreditNotes(params);
  }, [creditNotes, fetchCreditNotes]);

  return {
    data: creditNotes,
    meta,
    isLoading,
    error,
    refetch: fetchCreditNotes,
  };
}

// Hook para obtener todos (sin paginación)
export function useAllCreditNotes() {
  const { allCreditNotes, isLoadingAll, error, fetchAllCreditNotes } =
    useCreditNoteStore();

  useEffect(() => {
    if (!allCreditNotes) fetchAllCreditNotes();
  }, [allCreditNotes, fetchAllCreditNotes]);

  return {
    data: allCreditNotes,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllCreditNotes,
  };
}

// Hook para obtener por ID
export function useCreditNoteById(id: number) {
  const { creditNote, isFinding, error, fetchCreditNote } =
    useCreditNoteStore();

  useEffect(() => {
    fetchCreditNote(id);
  }, [id]);

  return {
    data: creditNote,
    isFinding,
    error,
    refetch: () => fetchCreditNote(id),
  };
}
