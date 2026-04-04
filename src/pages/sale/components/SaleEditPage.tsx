"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { SaleForm } from "./SaleForm";
import { type SaleUpdateSchema } from "../lib/sale.schema";
import { useSaleStore } from "../lib/sales.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { type SaleResource } from "../lib/sale.interface";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast } from "@/lib/core.function";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Loader, Save, X } from "lucide-react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { exportBulkTickets } from "../lib/sale.actions";

export const SaleEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showNextDialog, setShowNextDialog] = useState(false);
  const [pendingSaleId, setPendingSaleId] = useState<number | null>(null);

  const { data: companies, isLoading: companiesLoading } = useAllCompanies();
  const { data: branches, isLoading: branchesLoading } = useAllBranches();
  const {
    data: warehouses,
    isLoading: warehousesLoading,
    refetch: onRefreshWarehouses,
  } = useAllWarehouses();

  const { updateSale, fetchSale, sale, isFinding } = useSaleStore();

  const isLoading =
    companiesLoading || branchesLoading || warehousesLoading || isFinding;

  useEffect(() => {
    onRefreshWarehouses();
  }, []);

  useEffect(() => {
    if (!id) {
      navigate("/ventas");
      return;
    }
    fetchSale(Number(id));
  }, [id, navigate, fetchSale]);

  // Validar que la venta no tenga pagos registrados en sus cuotas
  useEffect(() => {
    if (sale) {
      // Verificar si alguna cuota tiene pagos registrados
      // const hasPayments =
      //   sale.installments?.some((inst) => inst.pending_amount < inst.amount) ??
      //   false;

      // if (hasPayments) {
      //   errorToast(
      //     "No se puede editar una venta que ya tiene pagos registrados",
      //   );
      //   navigate("/ventas");
      // }
    }
  }, [sale, navigate]);

  const mapSaleToForm = (data: SaleResource): Partial<SaleUpdateSchema> => ({
    branch_id: "1", // En modo edición, estos campos no se pueden cambiar
    customer_id: data.customer_id?.toString(),
    warehouse_id: data.warehouse_id?.toString(),
    vendedor_id: data.vendedor ? data.vendedor.id.toString() : "",
    document_type: data.document_type,
    issue_date: data.issue_date.split("T")[0],
    payment_type: data.payment_type,
    discount_global: (data.discount_global ?? 0).toString(),
    currency: data.currency,
    observations: data.observations || "",
    details:
      data.details?.map((detail) => ({
        product_id: detail.product_id.toString(),
        product_code: detail.product?.codigo || "",
        product_name: detail.product?.name || "",
        product_weight: (detail.product?.weight ?? 0).toString(),
        quantity_sacks: detail.quantity_sacks.toString(),
        quantity_kg: "0",
        unit_price: detail.unit_price.toString(),
      })) ?? [],
    installments:
      data.installments?.map((inst) => ({
        installment_number: inst.installment_number.toString(),
        due_days: inst.due_days.toString(),
        amount: inst.amount.toString(),
      })) ?? [],
  });

  const handleSubmit = async (data: Partial<SaleUpdateSchema>) => {
    if (!sale || !id) return;

    setIsSubmitting(true);
    try {
      await updateSale(Number(id), data);
      setPendingSaleId(Number(id));
      setShowPrintDialog(true);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al actualizar la venta",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintConfirm = async () => {
    if (pendingSaleId) {
      try {
        const blob = await exportBulkTickets([pendingSaleId]);
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } catch {
        // Si falla la exportación, continuamos igual
      }
    }
    setShowPrintDialog(false);
    setShowNextDialog(true);
  };

  const handlePrintCancel = () => {
    setShowPrintDialog(false);
    setShowNextDialog(true);
  };

  if (isLoading) {
    return (
      <PageWrapper size="3xl">
        <FormSkeleton />
      </PageWrapper>
    );
  }

  if (!sale) {
    return (
      <PageWrapper size="3xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Venta no encontrada</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper size="3xl">
      <div className="flex items-center gap-2">
        <Button size="sm" type="submit" form="sale-form" disabled={isSubmitting}>
          {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/ventas/listado")}>
          <X /> Cancelar
        </Button>
      </div>
      <div className="space-y-6">
        {/* Main Form */}
        {companies &&
          companies.length > 0 &&
          branches &&
          branches.length > 0 &&
          warehouses &&
          warehouses.length > 0 && (
            <SaleForm
              defaultValues={mapSaleToForm(sale)}
              onSubmit={handleSubmit}
              mode="update"
              branches={branches}
              warehouses={warehouses}
              sale={sale}
            />
          )}
      </div>

      <ConfirmationDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        icon="info"
        title="Venta actualizada"
        description="¿Deseas imprimir la boleta?"
        confirmText="Sí, imprimir"
        cancelText="No, omitir"
        onConfirm={handlePrintConfirm}
        onCancel={handlePrintCancel}
      />

      <ConfirmationDialog
        open={showNextDialog}
        onOpenChange={setShowNextDialog}
        icon="info"
        title="¿Qué deseas hacer ahora?"
        description="Puedes registrar una nueva venta o volver al listado."
        confirmText="Nueva venta"
        cancelText="Ir al listado"
        onConfirm={() => {
          setShowNextDialog(false);
          navigate("/ventas/agregar");
        }}
        onCancel={() => navigate("/ventas/listado")}
      />
    </PageWrapper>
  );
};
