"use client";

import { useNavigate } from "react-router-dom";
import { DeliverySheetForm } from "./DeliverySheetForm";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import type { DeliverySheetSchema } from "../lib/deliverysheet.schema";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { DELIVERY_SHEET } from "../lib/deliverysheet.interface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useBranchStore } from "@/pages/branch/lib/branch.store";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { useEffect } from "react";

export default function DeliverySheetAddPage() {
  const navigate = useNavigate();
  const {
    createDeliverySheet,
    isSubmitting,
    availableSales,
    fetchAvailableSales,
    isLoadingAvailableSales,
  } = useDeliverySheetStore();

  const { fetchAllBranches, allBranches } = useBranchStore();
  const { fetchAllPersons, allPersons } = usePersonStore();

  useEffect(() => {
    fetchAllBranches();
    fetchAllPersons();
  }, [fetchAllBranches, fetchAllPersons]);

  // Mock data para zones y drivers - deberías reemplazar esto con datos reales de tu API
  const zones = [
    { id: 1, code: "ZN", name: "Zona Norte" },
    { id: 2, code: "ZS", name: "Zona Sur" },
    { id: 3, code: "ZE", name: "Zona Este" },
    { id: 4, code: "ZO", name: "Zona Oeste" },
  ];

  // Filtrar personas que pueden ser conductores (puedes ajustar este filtro según tu lógica)
  const drivers = allPersons?.map(person => ({
    id: person.id,
    full_name: person.full_name || `${person.names} ${person.father_surname} ${person.mother_surname}`,
    document_number: person.number_document,
  })) || [];

  // Todos los clientes disponibles
  const customers = allPersons?.map(person => ({
    id: person.id,
    full_name: person.full_name || `${person.names} ${person.father_surname} ${person.mother_surname}`,
    document_number: person.number_document,
  })) || [];

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
    date_from?: string;
    date_to?: string;
  }) => {
    fetchAvailableSales({
      payment_type: params.payment_type as "CONTADO" | "CREDITO",
      zone_id: params.zone_id,
      date_from: params.date_from,
      date_to: params.date_to,
    });
  };

  const { TITLES, ICON } = DELIVERY_SHEET;

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <TitleComponent
          title={TITLES.create.title}
          subtitle={TITLES.create.subtitle}
          icon={ICON}
        />
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <DeliverySheetForm
          defaultValues={{}}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="create"
          branches={allBranches || []}
          zones={zones}
          drivers={drivers}
          customers={customers}
          availableSales={availableSales || []}
          onSearchSales={handleSearchSales}
          isLoadingAvailableSales={isLoadingAvailableSales}
        />
      </div>
    </PageWrapper>
  );
}
