"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Save, AlertCircle, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
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
  DeliverySheetInfo,
  getSaleTableColumns,
  SaleMobileCard,
  SaleTableWithNotes,
} from "./settlement";
import { errorToast, successToast } from "@/lib/core.function";
import { Separator } from "@/components/ui/separator";

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
      setSearchError("No se encontró una planilla pendiente con ese número");
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

  const salesValues = form.watch("sales");

  const totalPendiente = useMemo(() => {
    if (!deliverySheet?.sheet_sales) return 0;
    return deliverySheet.sheet_sales.reduce((sum, sheetSale) => {
      const creditNotesTotal = sheetSale.sale.credit_notes_total_raw || 0;
      const currentAmount = parseFormattedNumber(sheetSale.current_amount);
      return sum + (currentAmount - creditNotesTotal);
    }, 0);
  }, [deliverySheet]);

  const totalOriginal = useMemo(() => {
    if (!deliverySheet?.sheet_sales) return 0;
    return deliverySheet.sheet_sales.reduce(
      (sum, s) => sum + parseFormattedNumber(s.original_amount),
      0,
    );
  }, [deliverySheet]);

  const totalPagando = useMemo(() => {
    if (!salesValues?.length) return 0;
    return salesValues.reduce(
      (sum, sale) => sum + parseFloat(sale.payment_amount || "0"),
      0,
    );
  }, [salesValues]);

  const columns = useMemo(
    () => getSaleTableColumns(form as any, expandedNotes, toggleNote),
    [form, expandedNotes],
  );

  const mobileCardRender = (sale: SheetSale & { index: number }) => (
    <SaleMobileCard sale={sale} form={form as any} />
  );

  const totalsFooter = deliverySheet ? (
    <TableRow className="font-semibold text-xs">
      <TableCell colSpan={3} className="text-right text-muted-foreground">
        TOTALES
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono">
          S/. {totalOriginal.toFixed(2)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className="font-mono text-xs font-semibold">
          S/. {totalPendiente.toFixed(2)}
        </Badge>
      </TableCell>
      <TableCell colSpan={4} />
      <TableCell>
        <span className="font-mono text-primary font-bold">
          S/. {totalPagando.toFixed(2)}
        </span>
      </TableCell>
      <TableCell />
    </TableRow>
  ) : null;

  return (
    <PageWrapper>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-start mb-1 pb-1 border-b w-full">
          <div className="flex items-center gap-1">
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
          </div>
          <div className="h-8 px-2">
            <Separator orientation="vertical" className="h-full" />
          </div>
          <div className="flex flex-col items-end gap-1">
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
              id="settlement-form"
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
                  footer={totalsFooter}
                />
              </SaleTableWithNotes>
            </form>
          </Form>
        )}
      </div>
    </PageWrapper>
  );
}
