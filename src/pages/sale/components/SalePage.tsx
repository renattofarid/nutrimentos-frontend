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
  type SaleResource,
  type SaleInstallmentResource,
} from "../lib/sale.interface";
import { CreditNoteAddRoute } from "@/pages/credit-note/lib/credit-note.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  findSaleById,
  anularSale,
} from "../lib/sale.actions";

import { errorToast, promiseToast } from "@/lib/core.function";
import { InstallmentPaymentManagementSheet } from "@/pages/accounts-receivable/components";
import PageWrapper from "@/components/PageWrapper";
import { useWindowManager } from "@/stores/window-manager.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { RowSelectionState } from "@tanstack/react-table";
import ExportButtons from "@/components/ExportButtons";
import SaleDetailSheet from "./SaleDetailSheet";

function parseDocumento(documento: string) {
  const dashIndex = documento.indexOf("-");
  if (dashIndex > 0) {
    return {
      serie: documento.slice(0, dashIndex),
      numero: documento.slice(dashIndex + 1) || undefined,
    };
  }
  return { serie: undefined, numero: documento || undefined };
}

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
  const [vendedor_id, setVendedorId] = useState("");
  const [start_date, setStartDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [end_date, setEndDate] = useState<Date | undefined>(() => new Date());
  const [documento, setDocumento] = useState("");

  const [openDelete, setOpenDelete] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [openDetailSheet, setOpenDetailSheet] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleResource | null>(null);
  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const company_id = user?.company_id;

  const { serie: parsedSerie, numero: parsedNumero } = parseDocumento(documento);

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
    vendedor_id: vendedor_id ? Number(vendedor_id) : undefined,
    start_date: start_date?.toISOString().split("T")[0],
    end_date: end_date?.toISOString().split("T")[0],
    numero: parsedNumero,
    serie: parsedSerie,
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
    vendedor_id,
    start_date,
    end_date,
    documento,
    company_id,
    per_page,
  ]);

  // Effect para hacer el refetch cuando cambian los parámetros
  useEffect(() => {
    const { serie, numero } = parseDocumento(documento);
    refetch({
      company_id,
      page,
      per_page,
      branch_id: branch_id ? Number(branch_id) : undefined,
      document_type: document_type || undefined,
      status: status || undefined,
      warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      vendedor_id: vendedor_id ? Number(vendedor_id) : undefined,
      start_date: start_date?.toISOString().split("T")[0],
      end_date: end_date?.toISOString().split("T")[0],
      numero,
      serie,
    });
  }, [
    company_id,
    page,
    per_page,
    branch_id,
    document_type,
    status,
    warehouse_id,
    vendedor_id,
    start_date,
    end_date,
    documento,
  ]);

  const { removeSale } = useSaleStore();
  const { activeTabId, closeTab } = useWindowManager();

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

  const handleCreateCreditNote = (sale: SaleResource) => {
    navigate(CreditNoteAddRoute, { state: { sale } });
  };

  const handleQuickPay = (sale: SaleResource) => {
    const totalAmount = sale.total_amount;
    const sumOfInstallments =
      sale.installments?.reduce((sum, inst) => sum + inst.amount, 0) || 0;

    if (Math.abs(totalAmount - sumOfInstallments) > 0.01) {
      errorToast(
        `No se puede realizar el pago rápido. La suma de las cuotas (${sumOfInstallments.toFixed(
          2,
        )}) no coincide con el total de la venta (${totalAmount.toFixed(
          2,
        )}). Por favor, sincronice las cuotas.`,
      );
      return;
    }

    const pendingInstallment = sale.installments?.find(
      (inst) => inst.pending_amount > 0,
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

  const columns = getSaleColumns();

  // Construir el endpoint con query params para exportación
  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    const { serie, numero } = parseDocumento(documento);

    if (company_id) params.append("company_id", company_id.toString());
    if (branch_id) params.append("branch_id", branch_id);
    if (document_type) params.append("document_type", document_type);
    if (status) params.append("status", status);
    if (warehouse_id) params.append("warehouse_id", warehouse_id);
    if (start_date) params.append("start_date", start_date.toISOString().split("T")[0]);
    if (end_date) params.append("end_date", end_date.toISOString().split("T")[0]);
    if (numero) params.append("numero", numero);
    if (serie) params.append("serie", serie);

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
    documento,
  ]);

  // Derive the single selected sale for toolbar actions
  const selectedSaleId = Object.keys(rowSelection).find(
    (key) => rowSelection[key],
  );
  const toolbarSale = selectedSaleId
    ? (sales?.find((s) => s.id.toString() === selectedSaleId) ?? null)
    : null;
  const hasSelection = !!toolbarSale;
  const hasPendingInstallments = toolbarSale?.installments?.some(
    (inst) => inst.pending_amount > 0,
  );
  const totalAmount = toolbarSale?.total_amount ?? 0;
  const sumOfInstallments =
    toolbarSale?.installments?.reduce((sum, inst) => sum + inst.amount, 0) ||
    0;
  const isInstallmentDistributionValid =
    Math.abs(totalAmount - sumOfInstallments) <= 0.01;
  const canQuickPay = Boolean(
    toolbarSale && hasPendingInstallments && isInstallmentDistributionValid,
  );

  const handleAnular = () => {
    if (!toolbarSale) return;
    promiseToast(
      anularSale(toolbarSale.id).then(() => refetch()),
      {
        loading: "Anulando venta...",
        success: "Venta anulada correctamente",
        error: "Error al anular la venta",
      },
    );
  };

  const handleCerrar = () => {
    if (activeTabId) closeTab(activeTabId);
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-1 pb-1 border-b">
        <SaleActions
          hasSelection={hasSelection}
          onNew={() => navigate("/ventas/agregar")}
          onEdit={() => toolbarSale && handleEdit(toolbarSale)}
          onDelete={() => toolbarSale && handleDelete(toolbarSale.id)}
          onAnular={handleAnular}
          onCerrar={handleCerrar}
          onGenerar={() => toolbarSale && handleCreateCreditNote(toolbarSale)}
          onViewDetails={() => toolbarSale && handleViewDetails(toolbarSale)}
          onManage={() => toolbarSale && handleManage(toolbarSale)}
          onQuickPay={() => toolbarSale && handleQuickPay(toolbarSale)}
          canQuickPay={canQuickPay}
        />
        <div className="flex items-center gap-2">
          <ExportButtons
            excelEndpoint={exportEndpoint}
            excelFileName={`ventas_${new Date().toISOString().split("T")[0]}.xlsx`}
          />
        </div>
      </div>

      <SaleTable
        columns={columns}
        data={sales || []}
        isLoading={isLoading}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={handleEdit}
      >
        <SaleOptions
          branch_id={branch_id}
          setBranchId={setBranchId}
          document_type={document_type}
          setDocumentType={setDocumentType}
          status={status}
          setStatus={setStatus}
          warehouse_id={warehouse_id}
          setWarehouseId={setWarehouseId}
          vendedor_id={vendedor_id}
          setVendedorId={setVendedorId}
          start_date={start_date}
          end_date={end_date}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          documento={documento}
          setDocumento={setDocumento}
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
