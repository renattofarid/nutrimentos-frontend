import { useEffect } from "react";
import { usePaymentConceptStore } from "./payment-concept.store";

export function usePaymentConcept(params?: Record<string, unknown>) {
  const { paymentConcepts, meta, isLoading, error, fetchPaymentConcepts } =
    usePaymentConceptStore();

  useEffect(() => {
    if (!paymentConcepts) fetchPaymentConcepts({ ...params });
  }, [paymentConcepts, fetchPaymentConcepts]);

  return {
    data: paymentConcepts,
    meta,
    isLoading,
    error,
    refetch: fetchPaymentConcepts,
  };
}

export function useAllPaymentConcepts(params?: Record<string, unknown>) {
  const { allPaymentConcepts, fetchAllPaymentConcepts } =
    usePaymentConceptStore();

  useEffect(() => {
    fetchAllPaymentConcepts(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return {
    data: allPaymentConcepts,
  };
}

export function usePaymentConceptById(id: number) {
  const { paymentConcept, isFinding, error, fetchPaymentConcept } =
    usePaymentConceptStore();

  useEffect(() => {
    if (id) {
      fetchPaymentConcept(id);
    }
  }, [id, fetchPaymentConcept]);

  return {
    data: paymentConcept,
    isFinding,
    error,
    refetch: () => fetchPaymentConcept(id),
  };
}
