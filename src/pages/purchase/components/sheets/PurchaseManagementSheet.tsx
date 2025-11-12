import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PurchaseResource } from "../../lib/purchase.interface";
import { usePurchaseInstallmentStore } from "../../lib/purchase-installment.store";
import { PurchaseInstallmentForm } from "../forms/PurchaseInstallmentForm";
import { PurchaseDetailTable } from "../PurchaseDetailTable";
import { PurchaseInstallmentTable } from "../PurchaseInstallmentTable";
import { errorToast, successToast } from "@/lib/core.function";

interface PurchaseManagementSheetProps {
  open: boolean;
  onClose: () => void;
  purchase: PurchaseResource | null;
  onPurchaseUpdate?: () => void;
}

export function PurchaseManagementSheet({
  open,
  onClose,
  purchase,
}: PurchaseManagementSheetProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showInstallmentForm, setShowInstallmentForm] = useState(false);
  const [editingInstallmentId, setEditingInstallmentId] = useState<
    number | null
  >(null);
  const [currentPurchase, setCurrentPurchase] =
    useState<PurchaseResource | null>(purchase);

  const {
    installments,
    installment,
    fetchInstallments,
    fetchInstallment,
    createInstallment,
    updateInstallment,
    isSubmitting: installmentSubmitting,
    resetInstallment,
  } = usePurchaseInstallmentStore();

  useEffect(() => {
    if (purchase && open) {
      setCurrentPurchase(purchase);
      fetchInstallments(purchase.id);
    }
  }, [purchase, open]);

  useEffect(() => {
    if (editingInstallmentId) {
      fetchInstallment(editingInstallmentId);
    } else {
      resetInstallment();
    }
  }, [editingInstallmentId]);

  const handleAddInstallment = () => {
    setEditingInstallmentId(null);
    setShowInstallmentForm(true);
  };

  const handleEditInstallment = (installmentId: number) => {
    setEditingInstallmentId(installmentId);
    setShowInstallmentForm(true);
  };

  const handleInstallmentSubmit = async (data: any) => {
    if (!purchase) return;

    try {
      if (editingInstallmentId) {
        await updateInstallment(editingInstallmentId, data);
        successToast("Cuota actualizada exitosamente");
      } else {
        await createInstallment({
          purchase_id: purchase.id,
          ...data,
        });
        successToast("Cuota agregada exitosamente");
      }
      setShowInstallmentForm(false);
      setEditingInstallmentId(null);
      fetchInstallments(purchase.id);
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al guardar la cuota");
    }
  };

  const handleSyncInstallment = async (
    installmentId: number,
    newAmount: number
  ) => {
    if (!purchase) return;

    try {
      await updateInstallment(installmentId, {
        amount: Number(newAmount.toFixed(2)),
      });
      successToast("Cuota sincronizada exitosamente");
      fetchInstallments(purchase.id);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al sincronizar la cuota"
      );
    }
  };

  if (!currentPurchase) return null;

  // Determinar si se pueden agregar cuotas
  const isPaid = currentPurchase.status === "PAGADO";
  const isCash = currentPurchase.payment_type === "CONTADO";

  // Para cuotas: NO se puede si está pagada O es al contado
  const canAddInstallments = !isPaid && !isCash;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PackageOpen className="h-5 w-5" />
            Gestión de Compra {currentPurchase.correlativo}
          </SheetTitle>
          <SheetDescription>
            Administra los detalles, cuotas y pagos de esta compra
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información General</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Proveedor:</span>
                <p className="font-semibold">
                  {currentPurchase.supplier_fullname}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Documento:</span>
                <p className="font-semibold">
                  {currentPurchase.document_type} -{" "}
                  {currentPurchase.document_number}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <p className="font-bold text-primary text-lg">
                  {currentPurchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {parseFloat(currentPurchase.total_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Saldo:</span>
                <p className="font-bold text-orange-600 text-lg">
                  {currentPurchase.currency === "PEN" ? "S/." : "$"}{" "}
                  {parseFloat(currentPurchase.current_amount).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      currentPurchase.status === "PAGADA"
                        ? "default"
                        : currentPurchase.status === "CANCELADO"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {currentPurchase.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo de Pago:</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      currentPurchase.payment_type === "CONTADO"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {currentPurchase.payment_type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs para Detalles y Cuotas */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <PackageOpen className="h-4 w-4" />
                Detalles ({currentPurchase.details?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="installments"
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Cuotas ({installments?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <PurchaseDetailTable
                details={currentPurchase.details || []}
                onEdit={() => {}}
                onRefresh={() => {}}
                isPurchasePaid={true}
              />
            </TabsContent>

            <TabsContent value="installments" className="space-y-4 mt-4">
              {showInstallmentForm ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingInstallmentId ? "Editar Cuota" : "Agregar Cuota"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PurchaseInstallmentForm
                      installment={editingInstallmentId ? installment : null}
                      onSubmit={handleInstallmentSubmit}
                      onCancel={() => {
                        setShowInstallmentForm(false);
                        setEditingInstallmentId(null);
                      }}
                      isSubmitting={installmentSubmitting}
                    />
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Button
                    onClick={handleAddInstallment}
                    className="w-full"
                    disabled={!canAddInstallments}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cuota
                  </Button>
                  {!canAddInstallments && (
                    <p className="text-sm text-muted-foreground text-center">
                      {isPaid
                        ? "No se pueden agregar cuotas a una compra pagada"
                        : "No se pueden agregar cuotas a pagos al contado"}
                    </p>
                  )}

                  {/* Advertencia de desincronización */}
                  {isCash &&
                    installments &&
                    installments.length > 0 &&
                    (() => {
                      const totalAmount = parseFloat(
                        currentPurchase.total_amount
                      );
                      const installmentAmount = parseFloat(
                        installments[0]?.amount || "0"
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
                              {totalAmount.toFixed(2)}). Debe sincronizar la
                              cuota usando el botón 🔄
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}

                  <PurchaseInstallmentTable
                    installments={installments || []}
                    onEdit={handleEditInstallment}
                    onRefresh={() => purchase && fetchInstallments(purchase.id)}
                    isCashPayment={isCash}
                    purchaseTotalAmount={parseFloat(
                      currentPurchase.total_amount
                    )}
                    onSyncInstallment={handleSyncInstallment}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
