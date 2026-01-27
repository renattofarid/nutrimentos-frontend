"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useAllVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast, successToast } from "@/lib/core.function";
import { useGuideStore } from "../lib/guide.store";
import { GUIDE, type GuideResource } from "../lib/guide.interface";
import type { GuideSchema } from "../lib/guide.schema";
import PageWrapper from "@/components/PageWrapper";
import { useSidebar } from "@/components/ui/sidebar";

export default function GuideEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setOpen, setOpenMobile } = useSidebar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { MODEL, ROUTE, ICON } = GUIDE;
  const {
    data: branches,
    isLoading: branchesLoading,
    refetch: refetchBranches,
  } = useAllBranches();
  const {
    data: warehouses,
    isLoading: warehousesLoading,
    refetch: refetchWarehouses,
  } = useAllWarehouses();
  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useAllProducts();
  const { data: customers, refetch: refetchCustomers } = useAllPersons({
    role_names: [CLIENT_ROLE_CODE],
  });
  const { data: suppliers, refetch: refetchSuppliers } = useAllPersons({
    role_names: [SUPPLIER_ROLE_CODE],
  });
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

  const { updateGuide, fetchGuide, guide, isFinding } = useGuideStore();

  useEffect(() => {
    refetchBranches();
    refetchWarehouses();
    refetchProducts();
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
    productsLoading ||
    !customers ||
    !suppliers ||
    motivesLoading ||
    categoriesLoading ||
    brandsLoading ||
    unitsLoading ||
    !productTypes ||
    !nationalities ||
    vehiclesLoading ||
    isFinding;

  useEffect(() => {
    if (!id) {
      navigate(ROUTE);
      return;
    }
    fetchGuide(Number(id));
  }, [id, navigate, fetchGuide]);

  const mapGuideToForm = (data: GuideResource): Partial<GuideSchema> => {
    return {
      branch_id: data.branch_id?.toString(),
      warehouse_id: data.warehouse_id?.toString(),
      sale_ids: data.sales?.map((sale) => Number(sale.id)) || [],
      customer_id: data.customer_id?.toString(),
      issue_date: data.issue_date?.split("T")[0],
      transfer_date: data.transfer_date?.split("T")[0],
      modality: data.modality,
      motive_id: data.motive_id?.toString(),
      sale_document_number: data.sale_document_number ?? "-",
      carrier_document_type: data.carrier_document_type,
      carrier_document_number: data.carrier_document_number,
      carrier_name: data.carrier_name,
      carrier_ruc: data.carrier_ruc,
      carrier_mtc_number: data.carrier_mtc_number,
      vehicle_id: data.vehicle_id?.toString() || "",
      driver_document_type: data.driver_document_type || "",
      driver_document_number: data.driver_document_number || "",
      driver_name: data.driver_name || "",
      driver_license: data.driver_license || "",
      origin_address: data.origin_address,
      ubigeo_origin_id: data.ubigeo_origin_id?.toString() || "",
      destination_address: data.destination_address,
      ubigeo_destination_id: data.ubigeo_destination_id?.toString() || "",
      unit_measurement: data.unit_measurement,
      total_weight: data.total_weight,
      total_packages: data.total_packages,
      observations: data.observations || "",
    };
  };

  const handleSubmit = async (data: any) => {
    if (!guide || !id) return;

    setIsSubmitting(true);
    try {
      await updateGuide(Number(id), data);
      successToast("Guía de remisión actualizada correctamente");
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
            <TitleFormComponent title={MODEL.name} mode="edit" icon={ICON} />
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
          <TitleFormComponent title={MODEL.name} mode="edit" icon={ICON} />
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
        suppliers.length > 0 &&
        vehicles &&
        guide && (
          <GuideForm
            defaultValues={mapGuideToForm(guide)}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTE)}
            isSubmitting={isSubmitting}
            mode="update"
            branches={branches}
            warehouses={warehouses}
            products={products}
            customers={customers}
            motives={motives}
            vehicles={vehicles}
            guide={guide}
          />
        )}
    </PageWrapper>
  );
}
