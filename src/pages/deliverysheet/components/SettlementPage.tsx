"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import PageWrapper from "@/components/PageWrapper";
import { DataTable } from "@/components/DataTable";
import { findDeliverySheetById } from "../lib/deliverysheet.actions";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import type { DeliverySheetResource } from "../lib/deliverysheet.interface";
import { DELIVERY_SHEET } from "../lib/deliverysheet.interface";
import {
  settlementFormSchema,
  type SettlementFormSchema,
  type SaleWithIndex,
  SettlementHeader,
  DeliverySheetInfo,
  getSaleTableColumns,
  SaleMobileCard,
  SettlementSummary,
  SettlementFormFields,
} from "./settlement";

export default function SettlementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deliverySheet, setDeliverySheet] =
    useState<DeliverySheetResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const { submitSettlement } = useDeliverySheetStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettlementFormSchema>({
    resolver: zodResolver(settlementFormSchema) as any,
    defaultValues: {
      sales: [],
      payment_date: new Date().toISOString().split("T")[0],
      observations: "",
    },
  });

  useEffect(() => {
    const loadDeliverySheet = async () => {
      if (!id) {
        setErrors(["No se proporcionó un ID de planilla válido"]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrors([]);
        const response = await findDeliverySheetById(Number(id));

        if (!response.data) {
          setErrors(["No se encontró la planilla de reparto"]);
          return;
        }

        setDeliverySheet(response.data);

        if (response.data.sales && response.data.sales.length > 0) {
          form.reset({
            sales: response.data.sales.map((sale) => ({
              sale_id: sale.id,
              delivery_status:
                sale.delivery_status === "PENDIENTE"
                  ? "ENTREGADO"
                  : sale.delivery_status,
              delivery_notes: sale.delivery_notes || "",
              payment_amount: "0",
            })),
            payment_date: new Date().toISOString().split("T")[0],
            observations: "",
          });
        } else {
          setErrors(["La planilla no tiene ventas asociadas"]);
        }
      } catch (error) {
        console.error("Error al cargar la planilla:", error);
        setErrors([
          error instanceof Error
            ? error.message
            : "Error al cargar la planilla de reparto",
        ]);
        toast.error("Error al cargar la planilla");
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliverySheet();
  }, [id, form]);

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
    } catch (error) {
      console.error("Error al registrar la rendición:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al registrar la rendición";
      setErrors([errorMessage]);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const salesWithIndex: SaleWithIndex[] = useMemo(() => {
    if (!deliverySheet?.sales) return [];
    return deliverySheet.sales.map((sale, index) => ({
      ...sale,
      index,
    }));
  }, [deliverySheet]);

  const columns = useMemo(() => getSaleTableColumns(form as any), [form]);

  const mobileCardRender = (sale: SaleWithIndex) => (
    <SaleMobileCard sale={sale} form={form as any} />
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (!deliverySheet || errors.length > 0) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <p className="font-semibold">Error al cargar la planilla</p>
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {error}
              </p>
            ))}
          </div>
          <Button onClick={() => navigate(DELIVERY_SHEET.ROUTE)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Planillas
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <SettlementHeader
          sheetNumber={deliverySheet.sheet_number}
          onBack={() => navigate(DELIVERY_SHEET.ROUTE)}
        />

        {errors.length > 0 && (
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

        <DeliverySheetInfo deliverySheet={deliverySheet} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <DataTable
              columns={columns}
              data={salesWithIndex}
              isLoading={isLoading}
              mobileCardRender={mobileCardRender}
              variant="outline"
              isVisibleColumnFilter={false}
            />

            <SettlementFormFields form={form as any} />

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
      </div>
    </PageWrapper>
  );
}
