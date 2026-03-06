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
import {
  findDeliverySheetById,
  exportDeliverySheets,
} from "../lib/deliverysheet.actions";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type { DeliverySheetStatusSchema } from "../lib/deliverysheet.schema";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import DeliverySheetOptions from "./DeliverySheetOptions";
import { useDeliverySheets } from "../lib/deliverysheet.hook";
import { toast } from "sonner";

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
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [customer_id, setCustomerId] = useState("");
  const [driver_id, setDriverId] = useState("");
  const [zone_id, setZoneId] = useState("");
  const [branch_id, setBranchId] = useState("");
  const [company_id, setCompanyId] = useState("");
  const [issue_date_from, setIssueDateFrom] = useState<Date | undefined>();
  const [issue_date_to, setIssueDateTo] = useState<Date | undefined>();
  const [delivery_date_from, setDeliveryDateFrom] = useState<Date | undefined>();
  const [delivery_date_to, setDeliveryDateTo] = useState<Date | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  const { removeDeliverySheet, updateStatus } = useDeliverySheetStore();

  const { data, refetch, isLoading } = useDeliverySheets({
    page,
    per_page: perPage,
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
    customer_id: customer_id ? Number(customer_id) : undefined,
    driver_id: driver_id ? Number(driver_id) : undefined,
    zone_id: zone_id ? Number(zone_id) : undefined,
    date_from: issue_date_from
      ? issue_date_from.toISOString().split("T")[0]
      : undefined,
    date_to: issue_date_to
      ? issue_date_to.toISOString().split("T")[0]
      : undefined,
  });

  useEffect(() => {
    setPage(1);
  }, [
    search,
    status,
    type,
    customer_id,
    driver_id,
    zone_id,
    branch_id,
    company_id,
    issue_date_from,
    issue_date_to,
    delivery_date_from,
    delivery_date_to,
  ]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportDeliverySheets({
        branch_id: branch_id ? Number(branch_id) : null,
        company_id: company_id ? Number(company_id) : null,
        customer_id: customer_id ? Number(customer_id) : null,
        delivery_date_from: delivery_date_from
          ? delivery_date_from.toISOString().split("T")[0]
          : null,
        delivery_date_to: delivery_date_to
          ? delivery_date_to.toISOString().split("T")[0]
          : null,
        driver_id: driver_id ? Number(driver_id) : null,
        issue_date_from: issue_date_from
          ? issue_date_from.toISOString().split("T")[0]
          : null,
        issue_date_to: issue_date_to
          ? issue_date_to.toISOString().split("T")[0]
          : null,
        status: (status as any) || null,
        type: (type as any) || null,
        zone_id: zone_id ? Number(zone_id) : null,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "planillas-reparto.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Planillas exportadas exitosamente");
    } catch {
      toast.error("Error al exportar las planillas");
    } finally {
      setIsExporting(false);
    }
  };

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
        <div className="flex gap-2">
          <Button
            size={"sm"}
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>
          <Button size={"sm"} onClick={() => navigate(ROUTE_ADD)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Planilla
          </Button>
        </div>
      </div>

      <DeliverySheetTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
      >
        <DeliverySheetOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          type={type}
          setType={setType}
          customer_id={customer_id}
          setCustomerId={setCustomerId}
          driver_id={driver_id}
          setDriverId={setDriverId}
          zone_id={zone_id}
          setZoneId={setZoneId}
          branch_id={branch_id}
          setBranchId={setBranchId}
          company_id={company_id}
          setCompanyId={setCompanyId}
          issue_date_from={issue_date_from}
          issue_date_to={issue_date_to}
          onIssueDateChange={(from, to) => {
            setIssueDateFrom(from);
            setIssueDateTo(to);
          }}
          delivery_date_from={delivery_date_from}
          delivery_date_to={delivery_date_to}
          onDeliveryDateChange={(from, to) => {
            setDeliveryDateFrom(from);
            setDeliveryDateTo(to);
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
        />
      )}
    </PageWrapper>
  );
}
