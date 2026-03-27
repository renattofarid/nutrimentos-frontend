"use client";

import { useNavigate } from "react-router-dom";
import { DeliverySheetForm } from "./DeliverySheetForm";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import type { DeliverySheetSchema } from "../lib/deliverysheet.schema";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllZones } from "@/pages/zone/lib/zone.hook";
import { useEffect } from "react";
import { format } from "date-fns";
import PageWrapper from "@/components/PageWrapper";
import { previewDeliverySheet } from "../lib/deliverysheet.actions";
import { promiseToast } from "@/lib/core.function";

export default function DeliverySheetAddPage() {
  const navigate = useNavigate();

  const {
    createDeliverySheet,
    isSubmitting,
    availableSales,
    fetchAvailableSales,
    isLoadingAvailableSales,
  } = useDeliverySheetStore();

  const { data: allBranches = [], refetch: refetchBranches } = useAllBranches();
  const { data: zones = [], refetch: refetchZones } = useAllZones();

  useEffect(() => {
    refetchBranches();
    refetchZones();
  }, []);

  const handleSubmit = (data: DeliverySheetSchema) => {
    const promise = createDeliverySheet(data)
      .then(() =>
        previewDeliverySheet({
          sale_ids: data.sale_ids,
          type: data.type as "CONTADO" | "CREDITO",
          zone_id: data.zone_id ? Number(data.zone_id) : undefined,
          branch_id: data.branch_id ? Number(data.branch_id) : undefined,
        })
      )
      .then((blob) => {
        const url = window.URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" })
        );
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        navigate("/planillas/listado");
      });

    promiseToast(promise, {
      loading: "Guardando planilla...",
      success: "Planilla creada. PDF abierto correctamente",
      error: "Error al crear la planilla",
    });
  };

  const handleCancel = () => {
    navigate("/planillas/listado");
  };

  const handlePreview = (data: DeliverySheetSchema) => {
    const preview = previewDeliverySheet({
      sale_ids: data.sale_ids,
      type: data.type as "CONTADO" | "CREDITO",
      zone_id: data.zone_id ? Number(data.zone_id) : undefined,
      branch_id: data.branch_id ? Number(data.branch_id) : undefined,
    }).then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    });

    promiseToast(preview, {
      loading: "Generando vista previa...",
      success: "Vista previa generada",
      error: "Error al generar la vista previa",
    });
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


  return (
    <PageWrapper>
      <DeliverySheetForm
        defaultValues={{
          issue_date: format(new Date(), "yyyy-MM-dd"),
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onPreview={handlePreview}
        isSubmitting={isSubmitting}

        mode="create"
        branches={allBranches || []}
        zones={zones || []}
        availableSales={availableSales || []}
        onSearchSales={handleSearchSales}
        isLoadingAvailableSales={isLoadingAvailableSales}
      />
    </PageWrapper>
  );
}
