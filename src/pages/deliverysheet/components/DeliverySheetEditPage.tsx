"use client";

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";

import PageWrapper from "@/components/PageWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { errorToast } from "@/lib/core.function";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllZones } from "@/pages/zone/lib/zone.hook";

import { DeliverySheetForm } from "./DeliverySheetForm";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import type {
  DeliverySheetSchema,
  DeliverySheetUpdateSchema,
} from "../lib/deliverysheet.schema";

export default function DeliverySheetEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    deliverySheet,
    isFinding,
    isSubmitting,
    availableSales,
    isLoadingAvailableSales,
    fetchDeliverySheet,
    fetchAvailableSales,
    updateDeliverySheet,
    resetDeliverySheet,
  } = useDeliverySheetStore();

  const {
    data: allBranches = [],
    isLoading: isLoadingBranches,
    refetch: refetchBranches,
  } = useAllBranches();
  const {
    data: zones = [],
    isLoading: isLoadingZones,
    refetch: refetchZones,
  } = useAllZones();

  const isLoading = isFinding || isLoadingBranches || isLoadingZones;

  useEffect(() => {
    refetchBranches();
    refetchZones();

    if (!id) {
      navigate("/planillas/listado");
      return;
    }

    fetchDeliverySheet(Number(id));

    return () => {
      resetDeliverySheet();
    };
  }, [
    id,
    navigate,
    fetchDeliverySheet,
    resetDeliverySheet,
    refetchBranches,
    refetchZones,
  ]);

  useEffect(() => {
    if (!deliverySheet) return;

    fetchAvailableSales({
      payment_type: deliverySheet.type,
      zone_id: deliverySheet.zone?.id,
      customer_id: deliverySheet.customer?.id,
      date_from: format(new Date(), "yyyy-MM-dd"),
      date_to: format(new Date(), "yyyy-MM-dd"),
    });
  }, [deliverySheet, fetchAvailableSales]);

  const handleSubmit = async (data: DeliverySheetSchema) => {
    if (!id) return;

    try {
      const payload: Partial<DeliverySheetUpdateSchema> = {
        branch_id: data.branch_id,
        zone_id: data.zone_id,
        customer_id: data.customer_id,
        type: data.type,
        issue_date: data.issue_date,
        sale_ids: data.sale_ids,
        observations: data.observations,
      };

      await updateDeliverySheet(Number(id), payload);
      navigate("/planillas/listado");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al actualizar la planilla",
      );
    }
  };

  const handleSearchSales = (params: {
    payment_type: string;
    zone_id?: number;
    customer_id?: number;
    person_zone_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    fetchAvailableSales({
      payment_type: params.payment_type as "CONTADO" | "CREDITO",
      zone_id: params.zone_id,
      customer_id: params.customer_id,
      person_zone_id: params.person_zone_id,
      date_from: params.date_from,
      date_to: params.date_to,
    });
  };

  const handleCancel = () => {
    navigate("/planillas/listado");
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  if (!deliverySheet) {
    return (
      <PageWrapper>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Planilla no encontrada</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <DeliverySheetForm
        defaultValues={{
          branch_id: "",
          zone_id: deliverySheet.zone?.id?.toString() || "",
          customer_id: deliverySheet.customer?.id?.toString() || "",
          type: deliverySheet.type,
          issue_date: deliverySheet.issue_date.split("T")[0],
          sale_ids: deliverySheet.sheet_sales?.map((sale) => sale.sale_id) || [],
          observations: deliverySheet.observations || "",
          for_single_customer: !!deliverySheet.customer,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        mode="update"
        formId="delivery-sheet-form"
        isSubmitting={isSubmitting}
        branches={allBranches || []}
        zones={zones || []}
        availableSales={availableSales || []}
        onSearchSales={handleSearchSales}
        isLoadingAvailableSales={isLoadingAvailableSales}
      />
    </PageWrapper>
  );
}
