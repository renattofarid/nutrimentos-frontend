"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GuideForm } from "./GuideForm";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useGuideMotives } from "../lib/guide.hook";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import { useAllNationalities } from "@/pages/nationality/lib/nationality.hook";
import FormSkeleton from "@/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { useGuideStore } from "../lib/guide.store";
import type { GuideSchema } from "../lib/guide.schema";
import { GUIDE } from "../lib/guide.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import PageWrapper from "@/components/PageWrapper";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { api } from "@/lib/config";

export default function GuideAddPage() {
  const { MODEL } = GUIDE;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showNextDialog, setShowNextDialog] = useState(false);
  const [pendingGuideId, setPendingGuideId] = useState<number | null>(null);
  const { user } = useAuthStore();

  const {
    data: branches,
    isLoading: branchesLoading,
    refetch: refetchBranches,
  } = useAllBranches({
    company_id: user?.company_id,
  });
  const {
    data: warehouses,
    isLoading: warehousesLoading,
    refetch: refetchWarehouses,
  } = useAllWarehouses();

  const {
    data: motives,
    isLoading: motivesLoading,
    refetch: refetchMotives,
  } = useGuideMotives();
  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useAllCategories();
  const {
    data: brands,
    isLoading: brandsLoading,
    refetch: refetchBrands,
  } = useAllBrands();
  const {
    data: units,
    isLoading: unitsLoading,
    refetch: refetchUnits,
  } = useAllUnits();
  const { data: productTypes, refetch: refetchProductTypes } =
    useAllProductTypes();
  const { data: nationalities, refetch: refetchNationalities } =
    useAllNationalities();

  const { createGuide } = useGuideStore();

  useEffect(() => {
    refetchBranches();
    refetchWarehouses();
    refetchMotives();
    refetchCategories();
    refetchBrands();
    refetchUnits();
    refetchProductTypes();
    refetchNationalities();
  }, []);

  const isLoading =
    branchesLoading ||
    warehousesLoading ||
    motivesLoading ||
    categoriesLoading ||
    brandsLoading ||
    unitsLoading ||
    !productTypes ||
    !nationalities;

  const getDefaultValues = (): Partial<GuideSchema> => ({
    branch_id: "1",
    warehouse_id: "1",
    sale_ids: [],
    customer_id: "",
    issue_date: "",
    transfer_date: "",
    modality: "PRIVADO",
    motive_id: "3",
    sale_document_number: "",
    carrier_document_type: "RUC",
    carrier_document_number: "",
    carrier_name: "",
    carrier_ruc: "",
    carrier_mtc_number: "",
    vehicle_id: "",
    driver_document_type: "",
    driver_document_number: "",
    driver_name: "",
    driver_license: "-",
    origin_address: "TUPAC AMARU MZ H1 LT. 4 CHOSICA DEL NORTE CHICLAYO",
    ubigeo_origin_id: "1243",
    destination_address: "",
    ubigeo_destination_id: "",
    unit_measurement: "KGM",
    total_packages: 0,
    observations: "",
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const guideId = await createGuide(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      if (guideId) {
        setPendingGuideId(guideId);
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
    if (pendingGuideId) {
      try {
        const response = await api.get(
          `/sale-shipping-guides/${pendingGuideId}/pdf`,
          {
            responseType: "blob",
          },
        );
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
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

  return (
    <PageWrapper size="3xl">
      {branches &&
        branches.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        motives &&
        motives.length > 0 &&
        categories &&
        categories.length > 0 &&
        brands &&
        brands.length > 0 &&
        units &&
        units.length > 0 &&
        productTypes &&
        productTypes.length > 0 &&
        nationalities &&
        nationalities.length > 0 && (
          <GuideForm
            key={formKey}
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            onCancel={() => navigate(GUIDE.ROUTE)}
            isSubmitting={isSubmitting}
            mode="create"
            branches={branches}
            warehouses={warehouses}
            motives={motives}
          />
        )}

      <ConfirmationDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        icon="info"
        title="Guía registrada"
        description="¿Deseas imprimir la guía de remisión?"
        confirmText="Sí, imprimir"
        cancelText="No, omitir"
        onConfirm={handlePrintConfirm}
        onCancel={handlePrintCancel}
      />

      <ConfirmationDialog
        open={showNextDialog}
        onOpenChange={setShowNextDialog}
        icon="info"
        title="¿Crear otra guía?"
        description="¿Deseas registrar otra guía de remisión?"
        confirmText="Sí, crear otra"
        confirmFirst={true}
        cancelText="No, ir al listado"
        onConfirm={() => {
          setFormKey((k) => k + 1);
          setShowNextDialog(false);
        }}
        onCancel={() => navigate(GUIDE.ROUTE)}
      />
    </PageWrapper>
  );
}
