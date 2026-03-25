import { useState, useEffect } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { PurchaseInstallmentResource } from "../../lib/purchase.interface";
import { usePurchasePaymentStore } from "../../lib/purchase-payment.store";
import { usePurchaseInstallmentStore } from "../../lib/purchase-installment.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { PurchasePaymentForm } from "../forms/PurchasePaymentForm";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/lib/core.function";
import FormSkeleton from "@/components/FormSkeleton";

interface InstallmentPaymentsSheetProps {
  open: boolean;
  onClose: () => void;
  installment: PurchaseInstallmentResource | null;
  onPaymentSuccess?: () => void;
}

export function InstallmentPaymentsSheet({
  open,
  onClose,
  installment,
  onPaymentSuccess,
}: InstallmentPaymentsSheetProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentInstallment, setCurrentInstallment] =
    useState<PurchaseInstallmentResource | null>(installment);

  const { user } = useAuthStore();

  const {
    payments,
    payment,
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePayment,
    deletePayment,
    isSubmitting,
    resetPayment,
  } = usePurchasePaymentStore();

  const { installment: updatedInstallment, fetchInstallment } =
    usePurchaseInstallmentStore();

  useEffect(() => {
    if (installment && open) {
      setCurrentInstallment(installment);
      setShowPaymentForm(false);
      setEditingPaymentId(null);
      fetchPayments(installment.id);
      fetchInstallment(installment.id);
    }
  }, [installment, open]);

  useEffect(() => {
    if (updatedInstallment) {
      setCurrentInstallment(updatedInstallment);
    }
  }, [updatedInstallment]);

  useEffect(() => {
    if (editingPaymentId) {
      fetchPayment(editingPaymentId);
    } else {
      resetPayment();
    }
  }, [editingPaymentId]);

  const handlePaymentSubmit = async (data: any) => {
    if (!installment || !user) return;
    try {
      if (editingPaymentId) {
        await updatePayment(editingPaymentId, { user_id: user.id, ...data });
        successToast("Pago actualizado exitosamente");
      } else {
        await createPayment({
          purchase_installment_id: installment.id,
          user_id: user.id,
          route: "",
          ...data,
        });
        successToast("Pago registrado exitosamente");
      }
      setShowPaymentForm(false);
      setEditingPaymentId(null);
      await fetchPayments(installment.id);
      await fetchInstallment(installment.id);
      onPaymentSuccess?.();
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al guardar el pago");
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !installment) return;
    try {
      await deletePayment(deleteId);
      successToast("Pago eliminado exitosamente");
      await fetchPayments(installment.id);
      await fetchInstallment(installment.id);
      onPaymentSuccess?.();
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al eliminar el pago");
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!currentInstallment) return null;

  const totalPaid =
    payments?.reduce((sum, p) => sum + parseFloat(p.total_paid.toString()), 0) || 0;
  const pending = parseFloat(currentInstallment.pending_amount.toString());
  const isPaid = currentInstallment.status === "PAGADO";
  const canAddPayment = pending > 0 && !isPaid;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Pagos de Cuota ${currentInstallment.correlativo}`}
      subtitle="Gestiona los pagos realizados a esta cuota"
      icon="Wallet"
      size="3xl"
    >
      <div className="space-y-6">
        {/* Información de la Cuota */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Cuota</span>
            <span className="font-semibold">{currentInstallment.correlativo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Fecha Vencimiento</span>
            <span className="font-semibold">{formatDate(currentInstallment.due_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monto Original</span>
            <span className="font-semibold">
              {parseFloat(currentInstallment.amount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Pagado</span>
            <span className="font-semibold text-primary">{totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Saldo Pendiente</span>
            <span
              className={`font-semibold ${
                pending === 0 ? "text-primary" : "text-orange-600"
              }`}
            >
              {pending.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estado</span>
            <Badge
              color={
                currentInstallment.status === "PAGADO"
                  ? "default"
                  : currentInstallment.status === "VENCIDO"
                  ? "destructive"
                  : "secondary"
              }
            >
              {currentInstallment.status}
            </Badge>
          </div>
        </div>

        {/* Formulario o botón */}
        {showPaymentForm ? (
          <div className="border rounded-lg p-4 space-y-3">
            <p className="font-semibold text-sm">
              {editingPaymentId ? "Editar Pago" : "Registrar Pago"}
            </p>
            <PurchasePaymentForm
              payment={editingPaymentId ? payment : null}
              onSubmit={handlePaymentSubmit}
              onCancel={() => {
                setShowPaymentForm(false);
                setEditingPaymentId(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : canAddPayment ? (
          <Button
            onClick={() => {
              setEditingPaymentId(null);
              setShowPaymentForm(true);
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Pago
          </Button>
        ) : isPaid ? (
          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
              Esta cuota ha sido pagada completamente
            </p>
          </div>
        ) : null}

        {/* Historial de Pagos */}
        {!showPaymentForm && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
              Historial de Pagos ({payments?.length ?? 0})
            </h3>

            {!payments ? (
              <FormSkeleton />
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No hay pagos registrados para esta cuota
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{payment.correlativo}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.payment_date)}
                        </p>
                        {payment.reference_number && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Ref: {payment.reference_number}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-primary">
                          {parseFloat(payment.total_paid.toString()).toFixed(2)}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPaymentId(payment.id);
                              setShowPaymentForm(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(payment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Desglose del Pago
                      </p>
                      {parseFloat(payment.amount_cash.toString()) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Efectivo</span>
                          <span className="font-medium">
                            {parseFloat(payment.amount_cash.toString()).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {parseFloat(payment.amount_yape.toString()) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Yape</span>
                          <span className="font-medium">
                            {parseFloat(payment.amount_yape.toString()).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {parseFloat(payment.amount_plin.toString()) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Plin</span>
                          <span className="font-medium">
                            {parseFloat(payment.amount_plin.toString()).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {parseFloat(payment.amount_deposit.toString()) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Depósito</span>
                          <span className="font-medium">
                            {parseFloat(payment.amount_deposit.toString()).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {parseFloat(payment.amount_transfer.toString()) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Transferencia</span>
                          <span className="font-medium">
                            {parseFloat(payment.amount_transfer.toString()).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {payment.observation && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                            Observación
                          </p>
                          <p className="text-sm">{payment.observation}</p>
                        </div>
                      </>
                    )}

                    <Separator className="my-3" />
                    <div className="text-xs text-muted-foreground">
                      <p>Registrado: {formatDateTime(payment.created_at)}</p>
                      {payment.bank_number && (
                        <p>Banco/Cuenta: {payment.bank_number}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </GeneralSheet>
  );
}
