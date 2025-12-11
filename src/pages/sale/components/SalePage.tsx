"use client";

import { useEffect, useState, useMemo } from "react";
import { useSale } from "../lib/sale.hook";
import SaleTable from "./SaleTable";
import SaleActions from "./SaleActions";
import SaleOptions from "./SaleOptions";
import { getSaleColumns } from "./SaleColumns";
import { useSaleStore } from "../lib/sales.store";
import { useNavigate } from "react-router-dom";
import {
  SALE,
  type SaleResource,
  type SaleInstallmentResource,
} from "../lib/sale.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import SaleDetailSheet from "./SaleDetailSheet";
import { findSaleById } from "../lib/sale.actions";
import TitleComponent from "@/components/TitleComponent";
import { errorToast } from "@/lib/core.function";
import { InstallmentPaymentManagementSheet } from "@/pages/accounts-receivable/components";
import PageWrapper from "@/components/PageWrapper";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

export default function SalePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);

  // Filters
  const [branch_id, setBranchId] = useState("");
  const [document_type, setDocumentType] = useState("");
  const [status, setStatus] = useState("");
  const [warehouse_id, setWarehouseId] = useState("");
  const [start_date, setStartDate] = useState<Date | undefined>();
  const [end_date, setEndDate] = useState<Date | undefined>();
  const [numero, setNumero] = useState("");
  const [serie, setSerie] = useState("");

  const [openDelete, setOpenDelete] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [openDetailSheet, setOpenDetailSheet] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleResource | null>(null);
  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
  const company_id = user?.company_id;

  const {
    data: sales,
    meta,
    isLoading,
    refetch,
  } = useSale({
    company_id,
    page,
    per_page,
    branch_id: branch_id ? Number(branch_id) : undefined,
    document_type: document_type || undefined,
    status: status || undefined,
    warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
    start_date: start_date?.toISOString().split("T")[0],
    end_date: end_date?.toISOString().split("T")[0],
    numero: numero || undefined,
    serie: serie || undefined,
  });

  // Effect para resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [
    branch_id,
    document_type,
    status,
    warehouse_id,
    start_date,
    end_date,
    numero,
    serie,
    company_id,
    per_page,
  ]);

  // Effect para hacer el refetch cuando cambian los parámetros
  useEffect(() => {
    refetch({
      company_id,
      page,
      per_page,
      branch_id: branch_id ? Number(branch_id) : undefined,
      document_type: document_type || undefined,
      status: status || undefined,
      warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      start_date: start_date?.toISOString().split("T")[0],
      end_date: end_date?.toISOString().split("T")[0],
      numero: numero || undefined,
      serie: serie || undefined,
    });
  }, [
    company_id,
    page,
    per_page,
    branch_id,
    document_type,
    status,
    warehouse_id,
    start_date,
    end_date,
    numero,
    serie,
  ]);

  const { removeSale } = useSaleStore();

  const handleEdit = (sale: SaleResource) => {
    navigate(`/ventas/actualizar/${sale.id}`);
  };

  const handleDelete = (id: number) => {
    setSaleToDelete(id);
    setOpenDelete(true);
  };

  const handleViewDetails = async (sale: SaleResource) => {
    try {
      const response = await findSaleById(sale.id);
      setSelectedSale(response.data);
      setOpenDetailSheet(true);
    } catch (error) {
      console.error("Error al cargar detalles de la venta", error);
    }
  };

  const handleManage = (sale: SaleResource) => {
    navigate(`/ventas/gestionar/${sale.id}`);
  };

  const handleQuickPay = (sale: SaleResource) => {
    // Validar que la suma de cuotas sea igual al total de la venta
    const totalAmount = sale.total_amount;
    const sumOfInstallments =
      sale.installments?.reduce((sum, inst) => sum + inst.amount, 0) || 0;

    if (Math.abs(totalAmount - sumOfInstallments) > 0.01) {
      errorToast(
        `No se puede realizar el pago rápido. La suma de las cuotas (${sumOfInstallments.toFixed(
          2
        )}) no coincide con el total de la venta (${totalAmount.toFixed(
          2
        )}). Por favor, sincronice las cuotas.`
      );
      return;
    }

    // Tomar la primera cuota pendiente si existe
    const pendingInstallment = sale.installments?.find(
      (inst) => inst.pending_amount > 0
    );

    if (pendingInstallment) {
      setSelectedInstallment(pendingInstallment);
      setOpenPaymentSheet(true);
    }
  };

  const handlePaymentSuccess = () => {
    refetch();
    setOpenPaymentSheet(false);
    setSelectedInstallment(null);
  };

  const confirmDelete = async () => {
    if (saleToDelete) {
      try {
        await removeSale(saleToDelete);
        refetch();
        setOpenDelete(false);
        setSaleToDelete(null);
      } catch (error) {
        console.error("Error al eliminar venta", error);
      }
    }
  };

  const { MODEL, ICON } = SALE;

  const columns = getSaleColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
    onManage: handleManage,
    onQuickPay: handleQuickPay,
  });

  // Construir el endpoint con query params para exportación
  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();

    if (company_id) {
      params.append("company_id", company_id.toString());
    }
    if (branch_id) {
      params.append("branch_id", branch_id);
    }
    if (document_type) {
      params.append("document_type", document_type);
    }
    if (status) {
      params.append("status", status);
    }
    if (warehouse_id) {
      params.append("warehouse_id", warehouse_id);
    }
    if (start_date) {
      params.append("start_date", start_date.toISOString().split("T")[0]);
    }
    if (end_date) {
      params.append("end_date", end_date.toISOString().split("T")[0]);
    }
    if (numero) {
      params.append("numero", numero);
    }
    if (serie) {
      params.append("serie", serie);
    }

    const queryString = params.toString();
    const baseExcelUrl = "/sales/export";

    return queryString ? `${baseExcelUrl}?${queryString}` : baseExcelUrl;
  }, [
    company_id,
    branch_id,
    document_type,
    status,
    warehouse_id,
    start_date,
    end_date,
    numero,
    serie,
  ]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <TitleComponent
          title={MODEL.name}
          subtitle="Administrar todas las ventas registradas en el sistema"
          icon={ICON}
        />
        <SaleActions excelEndpoint={exportEndpoint} />
      </div>

      <SaleTable columns={columns} data={sales || []} isLoading={isLoading}>
        <SaleOptions
          branch_id={branch_id}
          setBranchId={setBranchId}
          document_type={document_type}
          setDocumentType={setDocumentType}
          status={status}
          setStatus={setStatus}
          warehouse_id={warehouse_id}
          setWarehouseId={setWarehouseId}
          start_date={start_date}
          end_date={end_date}
          onDateChange={(from, to) => {
            setStartDate(from);
            setEndDate(to);
          }}
          numero={numero}
          setNumero={setNumero}
          serie={serie}
          setSerie={setSerie}
        />
      </SaleTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      <SimpleDeleteDialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

      <SaleDetailSheet
        sale={selectedSale}
        open={openDetailSheet}
        onClose={() => {
          setOpenDetailSheet(false);
          setSelectedSale(null);
        }}
      />

      <InstallmentPaymentManagementSheet
        open={openPaymentSheet}
        onClose={() => {
          setOpenPaymentSheet(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        onSuccess={handlePaymentSuccess}
      />
    </PageWrapper>
  );
}
