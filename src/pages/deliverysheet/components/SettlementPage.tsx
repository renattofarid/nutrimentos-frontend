"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import PageWrapper from "@/components/PageWrapper";
import { DataTable } from "@/components/DataTable";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { findDeliverySheetById } from "../lib/deliverysheet.actions";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import { useDeliverySheets } from "../lib/deliverysheet.hook";
import type {
  DeliverySheetById,
  DeliverySheetResource,
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

export default function SettlementPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>("");
  const [deliverySheet, setDeliverySheet] = useState<DeliverySheetById | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { submitSettlement } = useDeliverySheetStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
              payment_amount: "0",
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
        toast.error("Error al cargar la planilla");
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliverySheet();
  }, [selectedId]);

  const handleSubmit = async (data: SettlementFormSchema) => {
    if (!deliverySheet) {
      toast.error("No se encontró la planilla de reparto");
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
        toast.error("Completar todos los estados de entrega");
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
      toast.success("Rendición registrada exitosamente");
      navigate(DELIVERY_SHEET.ROUTE);
    } catch (error: any) {
      console.error("Error al registrar la rendición:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al registrar la rendición";
      setErrors([errorMessage]);
      toast.error(errorMessage);
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

        <SearchableSelectAsync
          label="Planilla de Reparto"
          placeholder="Buscar planilla..."
          value={selectedId}
          onChange={(val) => {
            setSelectedId(val);
            setDeliverySheet(null);
            setErrors([]);
          }}
          useQueryHook={useDeliverySheets}
          mapOptionFn={(item: DeliverySheetResource) => ({
            value: item.id.toString(),
            label: item.sheet_number,
            description: `${item.driver?.full_name ?? "Sin conductor"} · ${item.delivery_date}`,
          })}
          withValue={false}
        />

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
