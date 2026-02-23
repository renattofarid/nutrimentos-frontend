"use client";

import { useState } from "react";
import DeliverySheetTable from "./DeliverySheetTable";
import { getDeliverySheetColumns } from "./DeliverySheetColumns";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import {
  DELIVERY_SHEET,
  type DeliverySheetResource,
  type DeliverySheetById,
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
import type { DeliverySheetStatusSchema } from "../lib/deliverysheet.schema";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import DeliverySheetOptions from "./DeliverySheetOptions";
import { useDeliverySheets } from "../lib/deliverysheet.hook";

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
    useState<DeliverySheetById | null>(null);
  const [selectedDeliverySheetForStatus, setSelectedDeliverySheetForStatus] =
    useState<DeliverySheetResource | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  const [search, setSearch] = useState("");

  const [start_date, setStartDate] = useState<Date | undefined>();
  const [end_date, setEndDate] = useState<Date | undefined>();

  const { removeDeliverySheet, updateStatus } = useDeliverySheetStore();

  const { data, refetch, isLoading } = useDeliverySheets({
    page,
    per_page: perPage,
    search,
    issue_date: [
      start_date ? start_date.toISOString().split("T")[0] : undefined,
      end_date ? end_date.toISOString().split("T")[0] : undefined,
    ],
  });

  useEffect(() => {
    setPage(1); // Reset to first page on filter change
  }, [page, perPage, search, start_date, end_date]);

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
    setSelectedDeliverySheetForStatus(deliverySheet);
    setOpenStatusDialog(true);
  };

  const confirmDelete = async () => {
    if (deliverySheetToDelete) {
      try {
        await removeDeliverySheet(deliverySheetToDelete);
        refetch();
        setOpenDelete(false);
        setDeliverySheetToDelete(null);
      } catch (error) {
        console.error("Error al eliminar planilla", error);
      }
    }
  };

  const handleStatusSubmit = async (data: DeliverySheetStatusSchema) => {
    if (selectedDeliverySheetForStatus) {
      try {
        await updateStatus(selectedDeliverySheetForStatus.id, data);
        refetch();
        setOpenStatusDialog(false);
        setSelectedDeliverySheetForStatus(null);
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
        data={data?.data || []}
        isLoading={isLoading}
      >
        <DeliverySheetOptions
          search={search}
          setSearch={setSearch}
          start_date={start_date}
          end_date={end_date}
          onDateChange={(from, to) => {
            setStartDate(from);
            setEndDate(to);
          }}
        />
      </DeliverySheetTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        per_page={perPage}
        onPageChange={setPage}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
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

      {selectedDeliverySheetForStatus && (
        <StatusUpdateDialog
          open={openStatusDialog}
          onClose={() => {
            setOpenStatusDialog(false);
            setSelectedDeliverySheetForStatus(null);
          }}
          onSubmit={handleStatusSubmit}
          currentStatus={selectedDeliverySheetForStatus.status}
          currentDeliveryDate={selectedDeliverySheetForStatus.delivery_date}
        />
      )}
    </PageWrapper>
  );
}
