import { useEffect } from "react";
import { usePurchaseInstallmentStore } from "./purchaseinstallment.store";

export function usePurchaseInstallment(params?: Record<string, unknown>) {
  const { installments, meta, isLoading, error, fetchInstallments } =
    usePurchaseInstallmentStore();

  useEffect(() => {
    if (!installments) fetchInstallments(params);
  }, [installments, fetchInstallments]);

  return {
    data: installments,
    meta,
    isLoading,
    error,
    refetch: fetchInstallments,
  };
}

export function usePurchaseInstallmentById(id: number) {
  const { installment, isFinding, error, fetchInstallment } =
    usePurchaseInstallmentStore();

  useEffect(() => {
    fetchInstallment(id);
  }, [id]);

  return {
    data: installment,
    isFinding,
    error,
    refetch: () => fetchInstallment(id),
  };
}

export function useExpiringAlerts() {
  const { expiringAlerts, isLoadingAlerts, error, fetchExpiringAlerts } =
    usePurchaseInstallmentStore();

  useEffect(() => {
    fetchExpiringAlerts();
  }, []);

  return {
    data: expiringAlerts,
    isLoading: isLoadingAlerts,
    error,
    refetch: fetchExpiringAlerts,
  };
}
