"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Loader, Save, X } from "lucide-react";
import { SaleForm } from "./SaleForm";
import { type SaleSchema } from "../lib/sale.schema";
import { useSaleStore } from "../lib/sales.store";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import PageWrapper from "@/components/PageWrapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { format } from "date-fns";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { exportBulkTickets } from "../lib/sale.actions";

const LAST_VENDEDOR_STORAGE_KEY = "sale:last-vendedor-id";

export const SaleAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [lastVendedorId, setLastVendedorId] = useState<string>(() => {
    return localStorage.getItem(LAST_VENDEDOR_STORAGE_KEY) || "";
  });
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showNextDialog, setShowNextDialog] = useState(false);
  const [pendingSaleId, setPendingSaleId] = useState<number | null>(null);
  const { user } = useAuthStore();
  const { data: branches, isLoading: branchesLoading } = useAllBranches({
    company_id: user?.company_id,
  });
  const {
    data: warehouses,
    isLoading: warehousesLoading,
    refetch: onRefreshWarehouses,
  } = useAllWarehouses();

  useEffect(() => {
    onRefreshWarehouses();
  }, []);

  useEffect(() => {
    localStorage.setItem(LAST_VENDEDOR_STORAGE_KEY, lastVendedorId);
  }, [lastVendedorId]);

  const { createSale } = useSaleStore();

  const isLoading = branchesLoading || warehousesLoading;

  const getDefaultValues = (): Partial<SaleSchema> => ({
    branch_id: "",
    customer_id: "",
    warehouse_id: "12",
    vendedor_id: lastVendedorId,
    document_type: "BOLETA",
    issue_date: format(new Date(), "yyyy-MM-dd"),
    payment_type: "CONTADO",
    discount_global: "0",
    currency: "PEN",
    observations: "",
    details: [],
    installments: [],
  });

  const handleSubmit = async (data: SaleSchema) => {
    setIsSubmitting(true);
    try {
      setLastVendedorId(data.vendedor_id || "");
      const saleId = await createSale(data);
      successToast("Venta creada correctamente");

      if (saleId) {
        setPendingSaleId(saleId);
        setShowPrintDialog(true);
      } else {
        setShowNextDialog(true);
      }
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE);
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

  const missingDependencies = [];
  if (!branches || branches.length === 0)
    missingDependencies.push("Sucursales");
  if (!warehouses || warehouses.length === 0)
    missingDependencies.push("Almacenes");

  const canShowForm = missingDependencies.length === 0;

  return (
    <PageWrapper size="3xl">
      <div className="flex items-center gap-2 border-b pb-1">
        <Button
          size="sm"
          type="submit"
          variant="outline"
          colorIcon="green"
          form="sale-form"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/ventas/listado")}
        >
          <X /> Cancelar
        </Button>
      </div>

      {!canShowForm && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se puede crear una venta</AlertTitle>
          <AlertDescription>
            Para crear una venta, primero debes registrar los siguientes datos:
            <ul className="list-disc list-inside mt-2">
              {missingDependencies.map((dep) => (
                <li key={dep}>{dep}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {canShowForm && (
        <SaleForm
          key={formKey}
          defaultValues={getDefaultValues()}
          onVendedorChange={setLastVendedorId}
          onSubmit={handleSubmit}
          mode="create"
          branches={branches!}
          warehouses={warehouses!}
        />
      )}

      <ConfirmationDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        icon="info"
        title="Venta registrada"
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
        title="¿Crear otra venta?"
        description="¿Deseas registrar otra venta?"
        confirmText="Sí, crear otra"
        confirmFirst={true}
        cancelText="No, ir al listado"
        onConfirm={() => {
          setFormKey((k) => k + 1);
          setShowNextDialog(false);
        }}
        onCancel={() => navigate("/ventas/listado")}
      />
    </PageWrapper>
  );
};
