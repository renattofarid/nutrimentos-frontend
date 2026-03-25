"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportSaleById } from "../lib/sale.actions";

export const SaleAddPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [showNextDialog, setShowNextDialog] = useState(false);
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

  const { createSale } = useSaleStore();

  const isLoading = branchesLoading || warehousesLoading;

  const getDefaultValues = (): Partial<SaleSchema> => ({
    branch_id: "",
    customer_id: "",
    warehouse_id: "12",
    vendedor_id: "",
    document_type: "BOLETA",
    issue_date: format(new Date(), "yyyy-MM-dd"),
    payment_type: "CONTADO",
    currency: "PEN",
    observations: "",
    details: [],
    installments: [],
  });

  const handleSubmit = async (data: SaleSchema) => {
    setIsSubmitting(true);
    try {
      const saleId = await createSale(data);
      successToast("Venta creada correctamente");

      // Abrir boleta automáticamente si se obtuvo el ID
      if (saleId) {
        try {
          const blob = await exportSaleById(saleId);
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
        } catch {
          // Si falla la exportación, continuamos igual
        }
      }

      setShowNextDialog(true);
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/ventas/listado")}
        >
          <List className="size-4 mr-2" /> Ver Listado
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          branches={branches!}
          warehouses={warehouses!}
          onCancel={() => navigate("/ventas/listado")}
        />
      )}

      <AlertDialog open={showNextDialog} onOpenChange={setShowNextDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Venta registrada</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas crear otra venta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate("/ventas/listado")}>
              No, ir al listado
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowNextDialog(false);
                setFormKey((k) => k + 1);
              }}
            >
              Sí, crear otra
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
};
