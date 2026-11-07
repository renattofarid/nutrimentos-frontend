"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader,
  Save,
  AlertCircle,
  Search,
  X,
  FileSearch,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageWrapper from "@/components/PageWrapper";
import { cn, parseFormattedNumber } from "@/lib/utils";
import {
  findDeliverySheetById,
  exportDeliverySheetById,
} from "../lib/deliverysheet.actions";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import { getDeliverySheets } from "../lib/deliverysheet.actions";
import type { DeliverySheetById } from "../lib/deliverysheet.interface";
import { DELIVERY_SHEET } from "../lib/deliverysheet.interface";
import {
  settlementFormSchema,
  type SettlementFormSchema,
  DeliverySheetInfo,
  SettlementExcelGrid,
} from "./settlement";
import { errorToast, successToast } from "@/lib/core.function";
import { Separator } from "@/components/ui/separator";
import FormSkeleton from "@/components/FormSkeleton";

// ============================================================
// Payment status helpers
// ============================================================

type PaymentStatus = "CANCELADO" | "PENDIENTE" | "NO_CANCELADO" | "ANULADA";

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  ANULADA: {
    label: "ANULADA",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700",
  },
  CANCELADO: {
    label: "CANCELADO",
    icon: CheckCircle2,
    className:
      "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700",
  },
  PENDIENTE: {
    label: "PENDIENTE",
    icon: Clock,
    className:
      "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-700",
  },
  NO_CANCELADO: {
    label: "NO CANCELADO",
    icon: XCircle,
    className:
      "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700",
  },
};

function resolvePaymentStatus(sheet: DeliverySheetById): PaymentStatus {
  const pending = parseFloat(sheet.pending_amount_raw);
  const collected = parseFloat(sheet.collected_amount_raw);
  if (sheet.status === "ANULADA") return "ANULADA";
  if (pending === 0 || sheet.status === "RENDIDA") return "CANCELADO";
  if (collected > 0) return "PENDIENTE";
  return "NO_CANCELADO";
}

export default function SettlementPage() {
  const navigate = useNavigate();
  const [sheetNumberInput, setSheetNumberInput] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const [deliverySheet, setDeliverySheet] = useState<DeliverySheetById | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { submitSettlement } = useDeliverySheetStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const getPreviewErrorMessage = async (error: any): Promise<string> => {
    const fallback = "Error al generar el PDF de la planilla";

    const responseData = error?.response?.data;
    if (!responseData) return fallback;

    if (responseData instanceof Blob) {
      try {
        const text = await responseData.text();
        const parsed = JSON.parse(text);
        if (typeof parsed?.message === "string") return parsed.message;
        if (typeof parsed?.error === "string") return parsed.error;
      } catch {
        // Si el blob no es JSON valido, intentamos usar el texto plano.
        try {
          const plainText = await responseData.text();
          if (plainText.trim()) return plainText;
        } catch {
          return fallback;
        }
      }
      return fallback;
    }

    return responseData?.message || responseData?.error || fallback;
  };

  const handleSearchSheet = async () => {
    setSearchError("");
    const trimmed = sheetNumberInput.trim();
    if (!trimmed) {
      setSearchError("Ingrese un número de planilla");
      return;
    }

    setIsLoading(true);
    setDeliverySheet(null);
    setErrors([]);

    try {
      const list = await getDeliverySheets({ search: trimmed, per_page: 5 });
      const match = list.data.find(
        (item) => item.sheet_number.toLowerCase() === trimmed.toLowerCase(),
      );
      if (!match) {
        setSearchError("No se encontró una planilla con ese número");
        return;
      }

      const response = await findDeliverySheetById(match.id);
      if (!response.data) {
        setErrors(["No se encontró la planilla de reparto"]);
        return;
      }

      setDeliverySheet(response.data);

      if (response.data.sheet_sales && response.data.sheet_sales.length > 0) {
        resetSettlementForm(response.data);
      } else {
        setErrors(["La planilla no tiene ventas asociadas"]);
      }
    } catch (error: any) {
      console.error("Error al cargar la planilla:", error);
      setErrors([
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error al cargar la planilla de reparto",
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const form = useForm<SettlementFormSchema>({
    resolver: zodResolver(settlementFormSchema) as any,
    defaultValues: {
      sales: [],
      payment_date: new Date().toISOString().split("T")[0],
      observations: "",
    },
  });

  const resetSettlementForm = (sheet: DeliverySheetById) => {
    form.reset({
      sales: sheet.sheet_sales.map((sheetSale) => ({
        sale_id: sheetSale.sale_id,
        delivery_status:
          sheetSale.delivery_status === "PENDIENTE"
            ? "ENTREGADO"
            : sheetSale.delivery_status,
        delivery_notes: sheetSale.delivery_notes || "",
        payment_amount: Math.max(
          0,
          parseFormattedNumber(sheetSale.current_amount) -
            parseFormattedNumber(sheetSale.collected_amount),
        ).toFixed(2),
      })),
      payment_date: new Date().toISOString().split("T")[0],
      observations: "",
    });
  };

  const handleSubmit = async (data: SettlementFormSchema) => {
    if (!deliverySheet) {
      errorToast("No se encontró la planilla de reparto");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors([]);

      const invalidSales = data.sales.filter(
        (sale) => !sale.delivery_status || sale.delivery_status === "",
      );

      if (invalidSales.length > 0) {
        setErrors([
          `Debe seleccionar el estado de entrega para todas las boletas (${invalidSales.length} pendientes)`,
        ]);
        errorToast("Completar todos los estados de entrega");
        return;
      }

      const settlementData = {
        sales: data.sales.map((sale) => ({
          sale_id: sale.sale_id,
          delivery_status:
            sale.delivery_status === "PENDIENTE"
              ? "ENTREGADO"
              : sale.delivery_status,
          delivery_notes: sale.delivery_notes || "",
          payment_amount: sale.payment_amount,
        })),
        payment_date: data.payment_date,
        observations: data.observations || "",
      };

      await submitSettlement(deliverySheet.id, settlementData);

      // Reload in place — no redirect
      const reloadResponse = await findDeliverySheetById(deliverySheet.id);
      if (reloadResponse.data) {
        setDeliverySheet(reloadResponse.data);
        resetSettlementForm(reloadResponse.data);
      }

      successToast("Rendición registrada exitosamente");
    } catch (error: any) {
      console.error("Error al registrar la rendición:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPdf = async () => {
    if (!deliverySheet) return;
    try {
      setIsLoadingPreview(true);
      const blob = await exportDeliverySheetById(deliverySheet.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error: any) {
      const errorMessage = await getPreviewErrorMessage(error);
      errorToast(errorMessage);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const salesWithIndex = useMemo(() => {
    if (!deliverySheet?.sheet_sales) return [];
    return deliverySheet.sheet_sales.map((sheetSale, index) => ({
      ...sheetSale,
      index,
    }));
  }, [deliverySheet]);

  const salesValues = useWatch({ control: form.control, name: "sales" });

  const paymentStatus = useMemo<PaymentStatus | null>(() => {
    if (!deliverySheet) return null;
    return resolvePaymentStatus(deliverySheet);
  }, [deliverySheet]);

  const isAlreadyPaid =
    paymentStatus === "CANCELADO" || paymentStatus === "ANULADA";

  const totalPendiente = useMemo(() => {
    if (!deliverySheet?.sheet_sales) return 0;
    return deliverySheet.sheet_sales.reduce((sum, sheetSale) => {
      const currentAmount = parseFormattedNumber(sheetSale.current_amount);
      const collectedAmount = parseFormattedNumber(sheetSale.collected_amount);
      return sum + Math.max(0, currentAmount - collectedAmount);
    }, 0);
  }, [deliverySheet]);

  const totalNotasCredito = useMemo(() => {
    if (!deliverySheet?.sheet_sales) return 0;
    return deliverySheet.sheet_sales.reduce(
      (sum, s) => sum + (s.sale.credit_notes_total_raw || 0),
      0,
    );
  }, [deliverySheet]);

  // Total neto de notas de crédito
  const totalOriginal = useMemo(() => {
    if (!deliverySheet?.sheet_sales) return 0;
    return deliverySheet.sheet_sales.reduce(
      (sum, s) => sum + parseFormattedNumber(s.original_amount),
      0,
    ) - totalNotasCredito;
  }, [deliverySheet, totalNotasCredito]);

  // Sin useMemo: form.watch puede devolver la misma referencia del array
  // cuando se edita un campo anidado, lo que dejaba el total desactualizado.
  const totalPagando = (salesValues ?? []).reduce(
    (sum, sale) => sum + (parseFloat(sale?.payment_amount || "0") || 0),
    0,
  );

  return (
    <PageWrapper>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-1 border-b w-full">
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {!isAlreadyPaid && (
              <Button
                type="submit"
                form="settlement-form"
                size="sm"
                colorIcon="emerald"
                variant="outline"
                disabled={isSubmitting || !deliverySheet}
              >
                {isSubmitting ? (
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {isSubmitting ? "Guardando..." : "Guardar Rendición"}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigate(DELIVERY_SHEET.ROUTE)}
              disabled={isSubmitting}
            >
              <X />
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleViewPdf}
              disabled={!deliverySheet || isLoadingPreview}
            >
              {isLoadingPreview ? (
                <Loader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileSearch className="h-3.5 w-3.5" />
              )}
              {isLoadingPreview
                ? "Generando..."
                : "Reimprimir"}
            </Button>
          </div>

          <div className="h-8 px-1">
            <Separator orientation="vertical" className="h-full" />
          </div>

          {/* Search */}
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ej: PL-0001"
                value={sheetNumberInput}
                onChange={(e) => {
                  setSheetNumberInput(e.target.value);
                  setSearchError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSheet()}
                className="h-7 md:h-8 text-xs md:text-sm w-40"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSearchSheet}
                className="gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                Buscar
              </Button>
            </div>
            {searchError && (
              <p className="text-xs font-medium text-destructive">
                {searchError}
              </p>
            )}
          </div>

          {/* Payment status indicator */}
          {deliverySheet &&
            paymentStatus &&
            (() => {
              const cfg = PAYMENT_STATUS_CONFIG[paymentStatus];
              const Icon = cfg.icon;
              return (
                <>
                  <div className="h-8 px-1">
                    <Separator orientation="vertical" className="h-full" />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                      cfg.className,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </div>
                </>
              );
            })()}
        </div>

        {isLoading && <FormSkeleton />}

        {!isLoading && errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && deliverySheet && errors.length === 0 && (
          <Form {...form}>
            <form
              id="settlement-form"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                }
              }}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <DeliverySheetInfo
                form={form as any}
                deliverySheet={deliverySheet}
              />

              <SettlementExcelGrid
                sales={salesWithIndex}
                form={form as any}
                isDisabled={isAlreadyPaid}
              />

              <div className="flex gap-6 text-xs font-mono border-t pt-2">
                <span className="text-muted-foreground">
                  Total:{" "}
                  <span className="font-semibold text-foreground">
                    S/. {totalOriginal.toFixed(2)}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Saldo pend.:{" "}
                  <span className="font-semibold text-foreground">
                    S/.{" "}
                    {(isAlreadyPaid
                      ? totalPendiente
                      : Math.max(0, totalPendiente - totalPagando)
                    ).toFixed(2)}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Monto cobrado:{" "}
                  <span className="font-bold text-primary">
                    S/.{" "}
                    {(isAlreadyPaid
                      ? Math.max(
                          0,
                          parseFloat(deliverySheet.collected_amount_raw || "0") -
                            totalNotasCredito,
                        )
                      : totalPagando
                    ).toFixed(2)}
                  </span>
                </span>
              </div>
            </form>
          </Form>
        )}
      </div>
    </PageWrapper>
  );
}
