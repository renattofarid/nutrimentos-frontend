"use client";

import { useNavigate } from "react-router-dom";
import { DeliverySheetForm } from "./DeliverySheetForm";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import type { DeliverySheetSchema } from "../lib/deliverysheet.schema";
import { DELIVERY_SHEET } from "../lib/deliverysheet.interface";
import TitleFormComponent from "@/components/TitleFormComponent";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllZones } from "@/pages/zone/lib/zone.hook";
import FormWrapper from "@/components/FormWrapper";

export default function DeliverySheetAddPage() {
  const navigate = useNavigate();
  const {
    createDeliverySheet,
    isSubmitting,
    availableSales,
    fetchAvailableSales,
    isLoadingAvailableSales,
  } = useDeliverySheetStore();

  const { data: allBranches = [] } = useAllBranches();
  const { data: workers = [] } = useAllWorkers();
  const { data: customers = [] } = useAllClients();
  const { data: zones = [] } = useAllZones();

  const handleSubmit = async (data: DeliverySheetSchema) => {
    try {
      await createDeliverySheet(data);
      navigate("/planillas");
    } catch (error) {
      console.error("Error al crear planilla", error);
    }
  };

  const handleCancel = () => {
    navigate("/planillas");
  };

  const handleSearchSales = (params: {
    payment_type: string;
    zone_id?: number;
    customer_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    fetchAvailableSales({
      payment_type: params.payment_type as "CONTADO" | "CREDITO",
      zone_id: params.zone_id,
      customer_id: params.customer_id,
      date_from: params.date_from,
      date_to: params.date_to,
    });
  };

  const { TITLES, ICON } = DELIVERY_SHEET;

  return (
    <FormWrapper>
      <div className="flex items-center justify-between mb-6">
        <TitleFormComponent
          title={TITLES.create.title}
          mode="create"
          icon={ICON}
        />
      </div>

      <DeliverySheetForm
        defaultValues={{}}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        mode="create"
        branches={allBranches || []}
        zones={zones || []}
        customers={customers || []}
        availableSales={availableSales || []}
        onSearchSales={handleSearchSales}
        isLoadingAvailableSales={isLoadingAvailableSales}
      />
    </FormWrapper>
  );
}
