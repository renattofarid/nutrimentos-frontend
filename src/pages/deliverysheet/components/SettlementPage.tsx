"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Save, AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageWrapper from "@/components/PageWrapper";
import { DataTable } from "@/components/DataTable";
import { parseFormattedNumber } from "@/lib/utils";
import { findDeliverySheetById } from "../lib/deliverysheet.actions";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import { useAllDeliverySheets } from "../lib/deliverysheet.hook";
import type {
  DeliverySheetById,
  SheetSale,
} from "../lib/deliverysheet.interface";
import { DELIVERY_SHEET } from "../lib/deliverysheet.interface";
import {
  settlementFormSchema,
  type SettlementFormSchema,
  SettlementHeader,
  DeliverySheetInfo,
  getSaleTableColumns,
  SaleMobileCard,
  SettlementSummary,
  SaleTableWithNotes,
} from "./settlement";
import { errorToast, successToast } from "@/lib/core.function";

export default function SettlementPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>("");
  const [sheetNumberInput, setSheetNumberInput] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const [deliverySheet, setDeliverySheet] = useState<DeliverySheetById | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { submitSettlement } = useDeliverySheetStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: sheetsData } = useAllDeliverySheets();

  const handleSearchSheet = () => {
    setSearchError("");
    const trimmed = sheetNumberInput.trim();
    if (!trimmed) {
      setSearchError("Ingrese un número de planilla");
      return;
    }
    const match = (sheetsData ?? []).find(
      (item) =>
        item.sheet_number.toLowerCase() === trimmed.toLowerCase() &&
        parseFloat(item.pending_amount_raw) > 0,
    );
    if (!match) {
      setSearchError(
        "No se encontró una planilla pendiente con ese número",
      );
      setSelectedId("");
      setDeliverySheet(null);
      return;
    }
    setSelectedId(match.id.toString());
    setDeliverySheet(null);
    setErrors([]);
  };
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  const form = useForm<SettlementFormSchema>({
    resolver: zodResolver(settlementFormSchema) as any,
    defaultValues: {
      sales: [],
      payment_date: new Date().toISOString().split("T")[0],
      observations: "",
    },
  });

  useEffect(() => {
    if (!selectedId) {
      setDeliverySheet(null);
      setErrors([]);
      return;
    }

    const loadDeliverySheet = async () => {
      try {
        setIsLoading(true);
        setErrors([]);
        const response = await findDeliverySheetById(Number(selectedId));

        if (!response.data) {
          setErrors(["No se encontró la planilla de reparto"]);
          return;
        }

        setDeliverySheet(response.data);

        if (response.data.sheet_sales && response.data.sheet_sales.length > 0) {
          form.reset({
            sales: response.data.sheet_sales.map((sheetSale) => ({
              sale_id: sheetSale.sale_id,
              delivery_status:
                sheetSale.delivery_status === "PENDIENTE"
                  ? "ENTREGADO"
                  : sheetSale.delivery_status,
              delivery_notes: sheetSale.delivery_notes || "",
              payment_amount: (
                parseFormattedNumber(sheetSale.current_amount) -
                (sheetSale.sale.credit_notes_total_raw || 0)
              ).toFixed(2),
            })),
            payment_date: new Date().toISOString().split("T")[0],
            observations: "",
          });
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
        errorToast("Error al cargar la planilla");
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliverySheet();
  }, [selectedId]);

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
      successToast("Rendición registrada exitosamente");
      navigate(DELIVERY_SHEET.ROUTE);
    } catch (error: any) {
      console.error("Error al registrar la rendición:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al registrar la rendición";
      setErrors([errorMessage]);
      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleNote = (index: number) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const salesWithIndex = useMemo(() => {
    if (!deliverySheet?.sheet_sales) return [];
    return deliverySheet.sheet_sales.map((sheetSale, index) => ({
      ...sheetSale,
      index,
    }));
  }, [deliverySheet]);

  const columns = useMemo(
    () => getSaleTableColumns(form as any, expandedNotes, toggleNote),
    [form, expandedNotes],
  );

  const mobileCardRender = (sale: SheetSale & { index: number }) => (
    <SaleMobileCard sale={sale} form={form as any} />
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        <SettlementHeader
          sheetNumber={deliverySheet?.sheet_number}
          onBack={() => navigate(DELIVERY_SHEET.ROUTE)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-muted-foreground">
            Número de Planilla
          </label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Ej: PL-0001"
              value={sheetNumberInput}
              onChange={(e) => {
                setSheetNumberInput(e.target.value);
                setSearchError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSheet()}
              className="h-7 md:h-8 text-xs md:text-sm max-w-64"
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
            <p className="text-xs font-medium text-destructive">{searchError}</p>
          )}
        </div>

        {selectedId && isLoading && (
          <div className="flex items-center justify-center h-48">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {selectedId && !isLoading && errors.length > 0 && (
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

        {selectedId && !isLoading && deliverySheet && errors.length === 0 && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <DeliverySheetInfo
                form={form as any}
                deliverySheet={deliverySheet}
              />

              <SaleTableWithNotes
                sales={salesWithIndex}
                form={form as any}
                expandedNotes={expandedNotes}
              >
                <DataTable
                  columns={columns}
                  data={salesWithIndex}
                  isLoading={isLoading}
                  mobileCardRender={mobileCardRender}
                  variant="outline"
                  isVisibleColumnFilter={false}
                />
              </SaleTableWithNotes>

              <SettlementSummary deliverySheet={deliverySheet} />

              <div className="flex flex-col sm:flex-row justify-end gap-3 sticky bottom-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-lg">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(DELIVERY_SHEET.ROUTE)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Rendición
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </PageWrapper>
  );
}
