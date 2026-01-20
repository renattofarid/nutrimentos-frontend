"use client";

import { useState } from "react";
import DeliverySheetTable from "./DeliverySheetTable";
import { getDeliverySheetColumns } from "./DeliverySheetColumns";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import {
  DELIVERY_SHEET,
  type DeliverySheetResource,
} from "../lib/deliverysheet.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import DeliverySheetDetailSheet from "./DeliverySheetDetailSheet";
import { StatusUpdateDialog } from "./StatusUpdateDialog";
import { findDeliverySheetById } from "../lib/deliverysheet.actions";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type {
  DeliverySheetStatusSchema,
} from "../lib/deliverysheet.schema";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

export default function DeliverySheetPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openDelete, setOpenDelete] = useState(false);
  const [deliverySheetToDelete, setDeliverySheetToDelete] = useState<
    number | null
  >(null);
  const [openDetailSheet, setOpenDetailSheet] = useState(false);
  const [selectedDeliverySheet, setSelectedDeliverySheet] =
    useState<DeliverySheetResource | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  const {
    deliverySheets,
    meta,
    isLoading,
    fetchDeliverySheets,
    removeDeliverySheet,
    updateStatus,
  } = useDeliverySheetStore();

  useEffect(() => {
    fetchDeliverySheets({ page, per_page: perPage });
  }, [page, perPage, fetchDeliverySheets]);

  const handleDelete = (id: number) => {
    setDeliverySheetToDelete(id);
    setOpenDelete(true);
  };

  const handleViewDetails = async (deliverySheet: DeliverySheetResource) => {
    try {
      const response = await findDeliverySheetById(deliverySheet.id);
      setSelectedDeliverySheet(response.data);
      setOpenDetailSheet(true);
    } catch (error) {
      console.error("Error al cargar detalles de la planilla", error);
    }
  };

  const handleUpdateStatus = (deliverySheet: DeliverySheetResource) => {
    setSelectedDeliverySheet(deliverySheet);
    setOpenStatusDialog(true);
  };

  const handleSettlement = (deliverySheet: DeliverySheetResource) => {
    navigate(`/planillas/rendicion/${deliverySheet.id}`);
  };

  const confirmDelete = async () => {
    if (deliverySheetToDelete) {
      try {
        await removeDeliverySheet(deliverySheetToDelete);
        fetchDeliverySheets({ page, per_page: perPage });
        setOpenDelete(false);
        setDeliverySheetToDelete(null);
      } catch (error) {
        console.error("Error al eliminar planilla", error);
      }
    }
  };

  const handleStatusSubmit = async (data: DeliverySheetStatusSchema) => {
    if (selectedDeliverySheet) {
      try {
        await updateStatus(selectedDeliverySheet.id, data);
        fetchDeliverySheets({ page, per_page: perPage });
        setOpenStatusDialog(false);
        setSelectedDeliverySheet(null);
      } catch (error) {
        console.error("Error al actualizar estado", error);
      }
    }
  };

  const { MODEL, ICON, ROUTE_ADD } = DELIVERY_SHEET;

  const columns = getDeliverySheetColumns({
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
    onUpdateStatus: handleUpdateStatus,
    onSettlement: handleSettlement,
  });

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <TitleComponent
          title={MODEL.name}
          subtitle="Administrar todas las planillas de reparto registradas en el sistema"
          icon={ICON}
        />
        <Button size={"sm"} onClick={() => navigate(ROUTE_ADD)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Planilla
        </Button>
      </div>

      <DeliverySheetTable
        columns={columns}
        data={deliverySheets || []}
        isLoading={isLoading}
      />

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        per_page={perPage}
        onPageChange={setPage}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      <SimpleDeleteDialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

      <DeliverySheetDetailSheet
        deliverySheet={selectedDeliverySheet}
        open={openDetailSheet}
        onClose={() => {
          setOpenDetailSheet(false);
          setSelectedDeliverySheet(null);
        }}
      />

      {selectedDeliverySheet && (
        <StatusUpdateDialog
          open={openStatusDialog}
          onClose={() => {
            setOpenStatusDialog(false);
            setSelectedDeliverySheet(null);
          }}
          onSubmit={handleStatusSubmit}
          currentStatus={selectedDeliverySheet.status}
          currentDeliveryDate={selectedDeliverySheet.delivery_date}
        />
      )}
    </PageWrapper>
  );
}
