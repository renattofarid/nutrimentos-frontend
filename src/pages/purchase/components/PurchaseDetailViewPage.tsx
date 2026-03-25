import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseInstallmentStore } from "../lib/purchase-installment.store";
import FormSkeleton from "@/components/FormSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PackageOpen,
  CreditCard,
  Wallet,
  Pencil,
  RefreshCw,
  FileText,
} from "lucide-react";
import { PurchaseDetailTable } from "./PurchaseDetailTable";
import { InstallmentPaymentsSheet } from "./sheets/InstallmentPaymentsSheet";
import { errorToast, successToast } from "@/lib/core.function";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PurchaseInstallmentResource } from "../lib/purchase.interface";
import { usePurchaseStore } from "../lib/purchase.store";
import { GroupFormSection } from "@/components/GroupFormSection";

import PageWrapper from "@/components/PageWrapper";

export const PurchaseDetailViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedInstallment, setSelectedInstallment] =
    useState<PurchaseInstallmentResource | null>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  const { purchase, fetchPurchase, isFinding } = usePurchaseStore();
  const { installments, fetchInstallments, updateInstallment } =
    usePurchaseInstallmentStore();

  useEffect(() => {
    if (!id) {
      navigate("/compras");
      return;
    }
    fetchPurchase(Number(id));
    fetchInstallments(Number(id));
  }, [id, navigate]);

  const handleEditPurchase = () => {
    if (purchase) {
      navigate(`/compras/actualizar/${purchase.id}`);
    }
  };

  const handleViewInstallmentPayments = (
    installment: PurchaseInstallmentResource,
  ) => {
    setSelectedInstallment(installment);
    setIsPaymentSheetOpen(true);
  };

  const handleSyncInstallment = async (
    installmentId: number,
    newAmount: number,
  ) => {
    if (!purchase) return;

    try {
      await updateInstallment(installmentId, {
        amount: Number(newAmount.toFixed(2)),
      });
      successToast("Cuota sincronizada exitosamente");
      fetchInstallments(Number(id));
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al sincronizar la cuota",
      );
    }
  };

  const shouldShowSyncButton = (installment: PurchaseInstallmentResource) => {
    if (!purchase) return false;
    const isCash = purchase.payment_type === "CONTADO";
    const hasNoPayments =
      parseFloat(installment.pending_amount) === parseFloat(installment.amount);
    const hasDifference =
      Math.abs(
        parseFloat(installment.amount) - parseFloat(purchase.total_amount),
      ) > 0.01;
    return isCash && hasNoPayments && hasDifference;
  };

  const currencySymbol =
    purchase?.currency === "PEN"
      ? "S/."
      : purchase?.currency === "USD"
        ? "$"
        : "€";

  if (isFinding) {
    return (
      <PageWrapper>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  if (!purchase) {
    return (
      <PageWrapper>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Compra no encontrada</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleEditPurchase}
            variant="outline"
            color="primary"
            size="sm"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Layout principal: izquierda (2/3) + resumen sticky (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna izquierda — todo el contenido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <GroupFormSection
            title="Información General"
            icon={FileText}
            cols={{ sm: 2, md: 3, lg: 3, xl: 6 }}
          >
            <div>
              <span className="text-sm text-muted-foreground">Correlativo</span>
              <p className="font-semibold">{purchase.correlativo}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Proveedor</span>
              <p className="font-semibold">{purchase.supplier_fullname}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Almacén</span>
              <p className="font-semibold">
                {purchase.warehouse_name || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Usuario</span>
              <p className="font-semibold">{purchase.user_name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Tipo de Documento
              </span>
              <p className="font-semibold">{purchase.document_type}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Número de Documento
              </span>
              <p className="font-semibold font-mono">
                {purchase.document_number}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Fecha de Emisión
              </span>
              <p className="font-semibold">
                {new Date(purchase.issue_date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Moneda</span>
              <p className="font-semibold">
                {purchase.currency === "PEN"
                  ? "Soles (S/.)"
                  : purchase.currency === "USD"
                    ? "Dólares ($)"
                    : "Euros (€)"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Tipo de Pago
              </span>
              <div className="mt-1">
                <Badge
                  color={
                    purchase.payment_type === "CONTADO"
                      ? "default"
                      : "secondary"
                  }
                >
                  {purchase.payment_type}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Estado</span>
              <div className="mt-1">
                <Badge
                  color={
                    purchase.status === "PAGADA"
                      ? "default"
                      : purchase.status === "CANCELADO"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {purchase.status}
                </Badge>
              </div>
            </div>

            {purchase.observations && (
              <div className="col-span-2 md:col-span-3 xl:col-span-6">
                <span className="text-sm text-muted-foreground">
                  Observaciones
                </span>
                <p className="mt-1 text-sm bg-sidebar p-3 rounded-md">
                  {purchase.observations}
                </p>
              </div>
            )}
          </GroupFormSection>

          {/* Detalles de la Compra */}
          <GroupFormSection
            title={`Detalles de la Compra (${purchase.details?.length || 0})`}
            icon={PackageOpen}
            cols={{ sm: 1 }}
          >
            <PurchaseDetailTable
              details={purchase.details || []}
              onEdit={() => {}}
              onRefresh={() => fetchPurchase(Number(id))}
              isPurchasePaid={purchase?.status === "PAGADO"}
            />
          </GroupFormSection>

          {/* Cuotas de la Compra */}
          <GroupFormSection
            title={`Cuotas de la Compra (${installments?.length || 0})`}
            icon={CreditCard}
            cols={{ sm: 1 }}
          >
            <div className="space-y-4">
              {purchase.payment_type === "CONTADO" &&
                installments &&
                installments.length > 0 &&
                (() => {
                  const totalAmount = parseFloat(purchase.total_amount);
                  const installmentAmount = parseFloat(
                    installments[0]?.amount || "0",
                  );
                  const hasNoPayments =
                    parseFloat(installments[0]?.pending_amount || "0") ===
                    installmentAmount;
                  const hasDifference =
                    Math.abs(installmentAmount - totalAmount) > 0.01;

                  if (hasNoPayments && hasDifference) {
                    return (
                      <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                          ⚠️ La cuota ({installmentAmount.toFixed(2)}) no
                          coincide con el total de la compra (
                          {totalAmount.toFixed(2)}). Debe sincronizar la cuota
                          usando el botón "Sincronizar"
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

              {installments && installments.length > 0 ? (
                installments.map((installment) => (
                  <div
                    key={installment.id}
                    className="border border-muted rounded-md shadow-sm overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-muted border-b border-muted">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <p className="text-sm md:text-base font-semibold">
                            Cuota #{installment.installment_number} -{" "}
                            {installment.correlativo}
                          </p>
                          <Badge
                            color={
                              installment.status === "PAGADO"
                                ? "default"
                                : installment.status === "VENCIDO"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {installment.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {shouldShowSyncButton(installment) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleSyncInstallment(
                                        installment.id,
                                        parseFloat(
                                          purchase?.total_amount || "0",
                                        ),
                                      )
                                    }
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Sincronizar
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Sincronizar con total de compra (
                                    {purchase?.total_amount})
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewInstallmentPayments(installment)
                            }
                          >
                            <Wallet className="h-4 w-4 mr-2" />
                            Ver Pagos
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Fecha Vencimiento:
                          </span>
                          <p className="font-semibold">
                            {new Date(installment.due_date).toLocaleDateString(
                              "es-ES",
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Días:</span>
                          <p className="font-semibold">
                            {installment.due_days} días
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Monto:</span>
                          <p className="font-semibold text-lg">
                            {parseFloat(installment.amount).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Saldo:</span>
                          <p className="font-semibold text-lg text-orange-600">
                            {parseFloat(installment.pending_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Badge variant="outline" className="text-lg p-3">
                    No hay cuotas registradas
                  </Badge>
                </div>
              )}
            </div>
          </GroupFormSection>
        </div>

        {/* Columna derecha — Resumen Financiero sticky */}
        <div className="lg:col-span-1 sticky top-4 space-y-3">
          {(() => {
            const total = parseFloat(purchase.total_amount);
            const pending = parseFloat(purchase.current_amount);
            const paid = total - pending;
            const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

            return (
              <>
                {/* Total */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total Compra
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {currencySymbol} {total.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-full bg-slate-200/50 dark:bg-slate-700/50 p-3">
                      <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                  {/* Barra de progreso */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso de pago</span>
                      <span className="font-semibold">{paidPct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pagado */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pagado
                      </p>
                      <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                        {currencySymbol} {paid.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-full bg-sky-200/50 dark:bg-sky-800/50 p-3">
                      <Wallet className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                    </div>
                  </div>
                </div>

                {/* Pendiente */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pendiente
                      </p>
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {currencySymbol} {pending.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-full bg-indigo-200/50 dark:bg-indigo-800/50 p-3">
                      <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Contadores */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-1">
                    <div className="rounded-full bg-slate-200/50 dark:bg-slate-700/50 p-2">
                      <PackageOpen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <p className="text-2xl font-bold">
                      {purchase.details?.length || 0}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Productos
                    </span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-1">
                    <div className="rounded-full bg-slate-200/50 dark:bg-slate-700/50 p-2">
                      <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <p className="text-2xl font-bold">
                      {installments?.length || 0}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Cuotas
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Sheet de Pagos */}
      <InstallmentPaymentsSheet
        open={isPaymentSheetOpen}
        onClose={() => {
          setIsPaymentSheetOpen(false);
          setSelectedInstallment(null);
          if (id) {
            fetchInstallments(Number(id));
            fetchPurchase(Number(id));
          }
        }}
        installment={selectedInstallment}
      />
    </PageWrapper>
  );
};
