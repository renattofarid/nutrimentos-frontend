"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { GuideForm } from "./GuideForm";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useGuideMotives } from "../lib/guide.hook";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import { useAllNationalities } from "@/pages/nationality/lib/nationality.hook";
import { useAllVehicles } from "@/pages/vehicle/lib/vehicle.hook";
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
import { useSidebar } from "@/components/ui/sidebar";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";

export default function GuideAddPage() {
  const { ROUTE, MODEL, ICON } = GUIDE;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setOpen, setOpenMobile } = useSidebar();
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
  const { data: customers, refetch: refetchCustomers } = useAllClients();
  const { data: suppliers, refetch: refetchSuppliers } = useAllSuppliers();
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
  const {
    data: vehicles,
    isLoading: vehiclesLoading,
    refetch: refetchVehicles,
  } = useAllVehicles();

  const { createGuide } = useGuideStore();

  useEffect(() => {
    refetchBranches();
    refetchWarehouses();
    refetchCustomers();
    refetchSuppliers();
    refetchMotives();
    refetchCategories();
    refetchBrands();
    refetchUnits();
    refetchProductTypes();
    refetchNationalities();
    refetchVehicles();
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const isLoading =
    branchesLoading ||
    warehousesLoading ||
    !customers ||
    !suppliers ||
    motivesLoading ||
    categoriesLoading ||
    brandsLoading ||
    unitsLoading ||
    !productTypes ||
    !nationalities ||
    vehiclesLoading;

  const getDefaultValues = (): Partial<GuideSchema> => ({
    branch_id: "",
    warehouse_id: "",
    sale_ids: [],
    customer_id: "",
    issue_date: "",
    transfer_date: "",
    modality: "PRIVADO",
    motive_id: "",
    sale_document_number: "-",
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
    total_weight: 0,
    total_packages: 0,
    observations: "",
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createGuide(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper size="3xl">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper size="3xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode="create" icon={ICON} />
        </div>
      </div>

      {branches &&
        branches.length > 0 &&
        warehouses &&
        warehouses.length > 0 &&
        customers &&
        customers.length > 0 &&
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
        nationalities.length > 0 &&
        suppliers &&
        suppliers.length > 0 &&
        vehicles && (
          <GuideForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            onCancel={() => navigate(GUIDE.ROUTE)}
            isSubmitting={isSubmitting}
            mode="create"
            branches={branches}
            warehouses={warehouses}
            customers={customers}
            motives={motives}
            vehicles={vehicles}
          />
        )}
    </PageWrapper>
  );
}
