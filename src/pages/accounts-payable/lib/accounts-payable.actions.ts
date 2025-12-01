import { api } from "@/lib/config";
import type {
  PurchaseInstallmentResource,
  PurchasePaymentResource,
  CreatePurchasePaymentRequest,
} from "./accounts-payable.interface";
import { ACCOUNTS_PAYABLE_ENDPOINT } from "./accounts-payable.interface";

// ============================================
// Obtener todas las cuotas de compras (cuentas por pagar)
// ============================================

export const getAllPurchaseInstallments = async (): Promise<
  PurchaseInstallmentResource[]
> => {
  const response = await api.get<PurchaseInstallmentResource[]>(
    ACCOUNTS_PAYABLE_ENDPOINT,
    {
      params: { all: true },
    }
  );
  return response.data;
};

// ============================================
// Pagos de cuotas de compras
// ============================================

export const getPurchaseInstallmentPayments = async (
  installmentId: number
): Promise<PurchasePaymentResource[]> => {
  const response = await api.get<PurchasePaymentResource[]>(
    `/purchaseinstallment/${installmentId}/payments`
  );
  return response.data;
};

export const createPurchaseInstallmentPayment = async (
  installmentId: number,
  data: CreatePurchasePaymentRequest
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `/purchaseinstallment/${installmentId}/payments`,
    data
  );
  return response.data;
};

export const deletePurchaseInstallmentPayment = async (
  installmentId: number,
  paymentId: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/purchaseinstallment/${installmentId}/payments/${paymentId}`
  );
  return response.data;
};
