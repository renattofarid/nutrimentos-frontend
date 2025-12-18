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
import { SettlementDialog } from "./SettlementDialog";
import { PaymentDialog } from "./PaymentDialog";
import { findDeliverySheetById } from "../lib/deliverysheet.actions";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { DataTablePagination } from "@/components/DataTablePagination";
import type {
  DeliverySheetStatusSchema,
  SettlementSchema,
  DeliverySheetPaymentSchema,
} from "../lib/deliverysheet.schema";

export default function DeliverySheetPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [openDelete, setOpenDelete] = useState(false);
  const [deliverySheetToDelete, setDeliverySheetToDelete] = useState<
    number | null
  >(null);
  const [openDetailSheet, setOpenDetailSheet] = useState(false);
  const [selectedDeliverySheet, setSelectedDeliverySheet] =
    useState<DeliverySheetResource | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openSettlementDialog, setOpenSettlementDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const {
    deliverySheets,
    meta,
    isLoading,
    fetchDeliverySheets,
    removeDeliverySheet,
    updateStatus,
    submitSettlement,
    submitPayment,
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

  const handleSettlement = async (deliverySheet: DeliverySheetResource) => {
    try {
      const response = await findDeliverySheetById(deliverySheet.id);
      setSelectedDeliverySheet(response.data);
      setOpenSettlementDialog(true);
    } catch (error) {
      console.error("Error al cargar detalles de la planilla", error);
    }
  };

  const handleRegisterPayment = (deliverySheet: DeliverySheetResource) => {
    setSelectedDeliverySheet(deliverySheet);
    setOpenPaymentDialog(true);
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

  const handleSettlementSubmit = async (data: SettlementSchema) => {
    if (selectedDeliverySheet) {
      try {
        await submitSettlement(selectedDeliverySheet.id, data);
        fetchDeliverySheets({ page, per_page: perPage });
        setOpenSettlementDialog(false);
        setSelectedDeliverySheet(null);
      } catch (error) {
        console.error("Error al registrar rendición", error);
      }
    }
  };

  const handlePaymentSubmit = async (data: DeliverySheetPaymentSchema) => {
    if (selectedDeliverySheet) {
      try {
        await submitPayment(selectedDeliverySheet.id, data);
        fetchDeliverySheets({ page, per_page: perPage });
        setOpenPaymentDialog(false);
        setSelectedDeliverySheet(null);
      } catch (error) {
        console.error("Error al registrar pago", error);
      }
    }
  };

  const { MODEL, ICON } = DELIVERY_SHEET;

  const columns = getDeliverySheetColumns({
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
    onUpdateStatus: handleUpdateStatus,
    onSettlement: handleSettlement,
    onRegisterPayment: handleRegisterPayment,
  });

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <TitleComponent
          title={MODEL.name}
          subtitle="Administrar todas las planillas de reparto registradas en el sistema"
          icon={ICON}
        />
        <Button onClick={() => navigate("/planillas/agregar")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Planilla
        </Button>
      </div>

      <DeliverySheetTable
        columns={columns}
        data={deliverySheets || []}
        isLoading={isLoading}
      >
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            {meta && (
              <>
                Mostrando {meta.from} - {meta.to} de {meta.total} registros
              </>
            )}
          </div>
          <DataTablePagination
            currentPage={page}
            totalPages={meta?.last_page || 1}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </DeliverySheetTable>

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
        <>
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

          {selectedDeliverySheet.sales && (
            <SettlementDialog
              open={openSettlementDialog}
              onClose={() => {
                setOpenSettlementDialog(false);
                setSelectedDeliverySheet(null);
              }}
              onSubmit={handleSettlementSubmit}
              sales={selectedDeliverySheet.sales}
            />
          )}

          <PaymentDialog
            open={openPaymentDialog}
            onClose={() => {
              setOpenPaymentDialog(false);
              setSelectedDeliverySheet(null);
            }}
            onSubmit={handlePaymentSubmit}
            pendingAmount={selectedDeliverySheet.pending_amount}
          />
        </>
      )}
    </PageWrapper>
  );
}
