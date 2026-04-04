import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { RowSelectionState } from "@tanstack/react-table";

import { PurchaseActions } from "./PurchaseActions";
import { PurchaseOptions } from "./PurchaseOptions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PurchaseManagementSheet } from "./sheets/PurchaseManagementSheet";
import { InstallmentPaymentsSheet } from "./sheets/InstallmentPaymentsSheet";
import type {
  PurchaseInstallmentResource,
  PurchaseResource,
} from "../lib/purchase.interface";
import { usePurchase } from "../lib/purchase.hook";
import { usePurchaseStore } from "../lib/purchase.store";
import { exportPurchaseById } from "../lib/purchase.actions";
import { promiseToast } from "@/lib/core.function";
import { PurchaseTable } from "./PurchaseTable";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import PageWrapper from "@/components/PageWrapper";
import { useWindowManager } from "@/stores/window-manager.store";

export default function PurchasePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);

  // Filters
  const [document_type, setDocumentType] = useState("");
  const [document_number, setDocumentNumber] = useState("");
  const [reference_number, setReferenceNumber] = useState("");
  const [payment_type, setPaymentType] = useState("");
  const [status, setStatus] = useState("");
  const [warehouse_id, setWarehouseId] = useState("");
  const [start_date, setStartDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [end_date, setEndDate] = useState<Date | undefined>(() => new Date());

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseResource | null>(null);
  const [isManagementSheetOpen, setIsManagementSheetOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] =
    useState<PurchaseInstallmentResource | null>(null);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const { user } = useAuthStore();
  const { activeTabId, closeTab } = useWindowManager();

  const { data, meta, isLoading, refetch } = usePurchase({
    company_id: user?.company_id,
    page,
    per_page,
    document_type: document_type || undefined,
    document_number: document_number || undefined,
    reference_number: reference_number || undefined,
    payment_type: payment_type || undefined,
    status: status || undefined,
    warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
    start_date: start_date?.toISOString().split("T")[0],
    end_date: end_date?.toISOString().split("T")[0],
  });
  const { removePurchase } = usePurchaseStore();

  // Effect para resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [
    document_type,
    document_number,
    reference_number,
    payment_type,
    status,
    warehouse_id,
    start_date,
    end_date,
    per_page,
  ]);

  // Effect para hacer el refetch cuando cambian los parámetros
  useEffect(() => {
    refetch({
      company_id: user?.company_id,
      page,
      per_page,
      document_type: document_type || undefined,
      document_number: document_number || undefined,
      reference_number: reference_number || undefined,
      payment_type: payment_type || undefined,
      status: status || undefined,
      warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      start_date: start_date?.toISOString().split("T")[0],
      end_date: end_date?.toISOString().split("T")[0],
    });
  }, [
    page,
    per_page,
    document_type,
    document_number,
    reference_number,
    payment_type,
    status,
    warehouse_id,
    start_date,
    end_date,
    user?.company_id,
  ]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removePurchase(deleteId);
      await refetch({
        company_id: user?.company_id,
        page,
        per_page,
        document_type: document_type || undefined,
        document_number: document_number || undefined,
        reference_number: reference_number || undefined,
        payment_type: payment_type || undefined,
        status: status || undefined,
        warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
        start_date: start_date?.toISOString().split("T")[0],
        end_date: end_date?.toISOString().split("T")[0],
      });
      successToast(
        SUCCESS_MESSAGE({ name: "Compra", gender: false }, "delete")
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ?? ERROR_MESSAGE;
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreatePurchase = () => {
    navigate("/compras/agregar");
  };

  const handleEditPurchase = (purchase: PurchaseResource) => {
    navigate(`/compras/actualizar/${purchase.id}`);
  };

  const handleViewDetails = (purchase: PurchaseResource) => {
    navigate(`/compras/detalle/${purchase.id}`);
  };

  const handleManage = (purchase: PurchaseResource) => {
    setSelectedPurchase(purchase);
    setIsManagementSheetOpen(true);
  };

  const handleQuickPay = (purchase: PurchaseResource) => {
    // Validar que la suma de cuotas sea igual al total de la compra
    const totalAmount = parseFloat(purchase.total_amount);
    const sumOfInstallments =
      purchase.installments?.reduce(
        (sum, inst) => sum + parseFloat(inst.amount),
        0
      ) || 0;

    if (Math.abs(totalAmount - sumOfInstallments) > 0.01) {
      errorToast(
        `No se puede realizar el pago rápido. La suma de las cuotas (${sumOfInstallments.toFixed(
          2
        )}) no coincide con el total de la compra (${totalAmount.toFixed(
          2
        )}). Por favor, sincronice las cuotas.`
      );
      return;
    }

    // Tomar la primera cuota pendiente si existe
    const pendingInstallment = purchase.installments?.find(
      (inst) => parseFloat(inst.pending_amount) > 0
    );

    if (pendingInstallment) {
      setSelectedInstallment(pendingInstallment);
      setIsPaymentSheetOpen(true);
    }
  };

  const handleCloseManagementSheet = async () => {
    setIsManagementSheetOpen(false);
    setSelectedPurchase(null);
    await refetch({
      company_id: user?.company_id,
      page,
      per_page,
      document_type: document_type || undefined,
      document_number: document_number || undefined,
      reference_number: reference_number || undefined,
      payment_type: payment_type || undefined,
      status: status || undefined,
      warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      start_date: start_date?.toISOString().split("T")[0],
      end_date: end_date?.toISOString().split("T")[0],
    });
  };

  const handleClosePaymentSheet = async () => {
    setIsPaymentSheetOpen(false);
    setSelectedInstallment(null);
    await refetch({
      company_id: user?.company_id,
      page,
      per_page,
      document_type: document_type || undefined,
      document_number: document_number || undefined,
      reference_number: reference_number || undefined,
      payment_type: payment_type || undefined,
      status: status || undefined,
      warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      start_date: start_date?.toISOString().split("T")[0],
      end_date: end_date?.toISOString().split("T")[0],
    });
  };

  const handlePrint = () => {
    if (!selectedPurchaseRow) return;
    const downloadPromise = exportPurchaseById(selectedPurchaseId).then(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setRowSelection({});
      }
    );
    promiseToast(downloadPromise, {
      loading: "Generando PDF...",
      success: "PDF generado correctamente",
      error: "Error al generar el PDF",
    });
  };

  const handlePaymentSuccess = async () => {
    await refetch({
      company_id: user?.company_id,
      page,
      per_page,
      document_type: document_type || undefined,
      document_number: document_number || undefined,
      reference_number: reference_number || undefined,
      payment_type: payment_type || undefined,
      status: status || undefined,
      warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
      start_date: start_date?.toISOString().split("T")[0],
      end_date: end_date?.toISOString().split("T")[0],
    });
  };

  // Construir el endpoint con query params para exportación
  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();

    if (user?.company_id) {
      params.append("company_id", user.company_id.toString());
    }
    if (document_type) {
      params.append("document_type", document_type);
    }
    if (document_number) {
      params.append("document_number", document_number);
    }
    if (reference_number) {
      params.append("reference_number", reference_number);
    }
    if (payment_type) {
      params.append("payment_type", payment_type);
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

    const queryString = params.toString();
    const baseExcelUrl = "/purchase/export";

    return queryString ? `${baseExcelUrl}?${queryString}` : baseExcelUrl;
  }, [
    user?.company_id,
    document_type,
    document_number,
    reference_number,
    payment_type,
    status,
    warehouse_id,
    start_date,
    end_date,
  ]);

  const selectedPurchaseRowId = Object.keys(rowSelection).find(
    (key) => rowSelection[key],
  );
  const selectedPurchaseRow = selectedPurchaseRowId
    ? (data?.find((purchase) => purchase.id.toString() === selectedPurchaseRowId) ??
      null)
    : null;
  const hasSelection = !!selectedPurchaseRow;

  const selectedPurchaseId = selectedPurchaseRow?.id ?? 0;

  const isPaidPurchase = selectedPurchaseRow?.status === "PAGADO";
  const canEditOrDelete = Boolean(selectedPurchaseRow && !isPaidPurchase);

  const hasPendingInstallments = selectedPurchaseRow?.installments?.some(
    (inst) => parseFloat(inst.pending_amount) > 0,
  );
  const totalAmount = selectedPurchaseRow
    ? parseFloat(selectedPurchaseRow.total_amount)
    : 0;
  const sumOfInstallments =
    selectedPurchaseRow?.installments?.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0,
    ) || 0;
  const isInstallmentDistributionValid =
    Math.abs(totalAmount - sumOfInstallments) <= 0.01;
  const canQuickPay = Boolean(
    selectedPurchaseRow &&
      hasPendingInstallments &&
      isInstallmentDistributionValid,
  );

  const handleToolbarViewDetails = () => {
    if (!selectedPurchaseRow) return;
    handleViewDetails(selectedPurchaseRow);
  };

  const handleToolbarManage = () => {
    if (!selectedPurchaseRow) return;
    handleManage(selectedPurchaseRow);
  };

  const handleToolbarEdit = () => {
    if (!selectedPurchaseRow) return;
    handleEditPurchase(selectedPurchaseRow);
  };

  const handleToolbarDelete = () => {
    if (!selectedPurchaseRow) return;
    setDeleteId(selectedPurchaseRow.id);
  };

  const handleToolbarQuickPay = () => {
    if (!selectedPurchaseRow) return;
    handleQuickPay(selectedPurchaseRow);
  };

  const handleClose = () => {
    if (activeTabId) closeTab(activeTabId);
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <PurchaseActions
          onCreatePurchase={handleCreatePurchase}
          hasSelection={hasSelection}
          canEditOrDelete={canEditOrDelete}
          canQuickPay={canQuickPay}
          onViewDetails={handleToolbarViewDetails}
          onManage={handleToolbarManage}
          onEdit={handleToolbarEdit}
          onDelete={handleToolbarDelete}
          onQuickPay={handleToolbarQuickPay}
          onClose={handleClose}
          excelEndpoint={exportEndpoint}
          onPrint={handlePrint}
        />
      </div>

      <PurchaseTable
        data={data || []}
        isLoading={isLoading}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={handleEditPurchase}
      >
        <PurchaseOptions
          document_type={document_type}
          setDocumentType={setDocumentType}
          document_number={document_number}
          setDocumentNumber={setDocumentNumber}
          reference_number={reference_number}
          setReferenceNumber={setReferenceNumber}
          payment_type={payment_type}
          setPaymentType={setPaymentType}
          status={status}
          setStatus={setStatus}
          warehouse_id={warehouse_id}
          setWarehouseId={setWarehouseId}
          start_date={start_date}
          end_date={end_date}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
      </PurchaseTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <PurchaseManagementSheet
        open={isManagementSheetOpen}
        onClose={handleCloseManagementSheet}
        purchase={selectedPurchase}
        onPurchaseUpdate={async () => {
          await refetch({
            company_id: user?.company_id,
            page,
            per_page,
            document_type: document_type || undefined,
            document_number: document_number || undefined,
            reference_number: reference_number || undefined,
            payment_type: payment_type || undefined,
            status: status || undefined,
            warehouse_id: warehouse_id ? Number(warehouse_id) : undefined,
            start_date: start_date?.toISOString().split("T")[0],
            end_date: end_date?.toISOString().split("T")[0],
          });
          // Actualizar el selectedPurchase con los datos más recientes del store
          if (selectedPurchase && data) {
            const updatedPurchase = data.find(
              (p: PurchaseResource) => p.id === selectedPurchase.id
            );
            if (updatedPurchase) {
              setSelectedPurchase(updatedPurchase);
            }
          }
        }}
      />

      <InstallmentPaymentsSheet
        open={isPaymentSheetOpen}
        onClose={handleClosePaymentSheet}
        installment={selectedInstallment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </PageWrapper>
  );
}
