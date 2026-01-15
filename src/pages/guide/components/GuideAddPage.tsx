"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { GuideForm } from "./GuideForm";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { useGuideMotives } from "../lib/guide.hook";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import { useAllNationalities } from "@/pages/nationality/lib/nationality.hook";
import { CLIENT_ROLE_CODE } from "@/pages/client/lib/client.interface";
import { SUPPLIER_ROLE_CODE } from "@/pages/supplier/lib/supplier.interface";
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

export default function GuideAddPage() {
  const { ROUTE, MODEL, ICON } = GUIDE;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setOpen, setOpenMobile } = useSidebar();
  const { user } = useAuthStore();

  const { data: branches, isLoading: branchesLoading } = useAllBranches({
    company_id: user?.company_id,
  });
  const { data: warehouses, isLoading: warehousesLoading } = useAllWarehouses();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: customers } = useAllPersons({ role_names: [CLIENT_ROLE_CODE] });
  const { data: suppliers } = useAllPersons({
    role_names: [SUPPLIER_ROLE_CODE],
  });
  const { data: motives, isLoading: motivesLoading } = useGuideMotives();
  const { data: categories, isLoading: categoriesLoading } = useAllCategories();
  const { data: brands, isLoading: brandsLoading } = useAllBrands();
  const { data: units, isLoading: unitsLoading } = useAllUnits();
  const { data: productTypes } = useAllProductTypes();
  const { data: nationalities } = useAllNationalities();

  const { createGuide } = useGuideStore();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const isLoading =
    branchesLoading ||
    warehousesLoading ||
    productsLoading ||
    !customers ||
    !suppliers ||
    motivesLoading ||
    categoriesLoading ||
    brandsLoading ||
    unitsLoading ||
    !productTypes ||
    !nationalities;

  const getDefaultValues = (): Partial<GuideSchema> => ({
    branch_id: "",
    warehouse_id: "",
    sale_ids: [],
    customer_id: "",
    issue_date: "",
    transfer_date: "",
    modality: "PUBLICO",
    motive_id: "",
    sale_document_number: "",
    carrier_document_type: "RUC",
    carrier_document_number: "",
    carrier_name: "",
    carrier_ruc: "",
    carrier_mtc_number: "",
    vehicle_plate: "",
    driver_document_type: "",
    driver_document_number: "",
    driver_name: "",
    driver_license: "",
    origin_address: "",
    ubigeo_origin_id: "",
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
        products &&
        products.length > 0 &&
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
        suppliers.length > 0 && (
          <GuideForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            onCancel={() => navigate(GUIDE.ROUTE)}
            isSubmitting={isSubmitting}
            mode="create"
            branches={branches}
            warehouses={warehouses}
            products={products}
            customers={customers}
            motives={motives}
          />
        )}
    </PageWrapper>
  );
}
