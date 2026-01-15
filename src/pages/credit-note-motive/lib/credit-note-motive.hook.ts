import { useEffect } from "react";
import { useCreditNoteMotiveStore } from "./credit-note-motive.store";

// Hook para listado paginado
export function useCreditNoteMotive(params?: Record<string, unknown>) {
  const { creditNoteMotives, meta, isLoading, error, fetchCreditNoteMotives } =
    useCreditNoteMotiveStore();

  useEffect(() => {
    if (!creditNoteMotives) fetchCreditNoteMotives(params);
  }, [creditNoteMotives, fetchCreditNoteMotives]);

  return {
    data: creditNoteMotives,
    meta,
    isLoading,
    error,
    refetch: fetchCreditNoteMotives,
  };
}

// Hook para obtener todos (sin paginación)
export function useAllCreditNoteMotives() {
  const {
    allCreditNoteMotives,
    isLoadingAll,
    error,
    fetchAllCreditNoteMotives,
  } = useCreditNoteMotiveStore();

  useEffect(() => {
    if (!allCreditNoteMotives) fetchAllCreditNoteMotives();
  }, [allCreditNoteMotives, fetchAllCreditNoteMotives]);

  return {
    data: allCreditNoteMotives,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllCreditNoteMotives,
  };
}

// Hook para obtener por ID
export function useCreditNoteMotiveById(id: number) {
  const { creditNoteMotive, isFinding, error, fetchCreditNoteMotive } =
    useCreditNoteMotiveStore();

  useEffect(() => {
    fetchCreditNoteMotive(id);
  }, [id]);

  return {
    data: creditNoteMotive,
    isFinding,
    error,
    refetch: () => fetchCreditNoteMotive(id),
  };
}
