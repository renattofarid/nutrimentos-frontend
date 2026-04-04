import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWarehouseDocuments } from "../lib/warehouse-document.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import WarehouseDocumentActions from "./WarehouseDocumentActions";
import WarehouseDocumentTable from "./WarehouseDocumentTable";
import WarehouseDocumentOptions from "./WarehouseDocumentOptions";
import {
  deleteWarehouseDocument,
  confirmWarehouseDocument,
  cancelWarehouseDocument,
} from "../lib/warehouse-document.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
  promiseToast,
} from "@/lib/core.function";
import { WarehouseDocumentColumns } from "./WarehouseDocumentColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { WAREHOUSE_DOCUMENT } from "../lib/warehouse-document.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageWrapper from "@/components/PageWrapper";
import { exportWarehouseDocumentByNumber } from "../lib/warehouse-document.actions";

const { MODEL, ROUTE } = WAREHOUSE_DOCUMENT;

export default function WarehouseDocumentPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, meta, isLoading, refetch } = useWarehouseDocuments({
    page,
    per_page,
    search,
    warehouse_id: selectedWarehouse,
    type: selectedType,
    status: selectedStatus,
  });
  const { data: warehouses } = useAllWarehouses();

  useEffect(() => {
    refetch({
      page,
      per_page,
      search,
      warehouse_id: selectedWarehouse,
      type: selectedType,
      status: selectedStatus,
    });
  }, [page, search, per_page, selectedWarehouse, selectedType, selectedStatus, refetch]);

  const selectedDocId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarDoc = selectedDocId
    ? (data?.find((d) => d.id.toString() === selectedDocId) ?? null)
    : null;
  const hasSelection = !!toolbarDoc;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWarehouseDocument(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirmId) return;
    try {
      await confirmWarehouseDocument(confirmId);
      await refetch();
      successToast("Documento confirmado exitosamente");
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al confirmar el documento";
      errorToast(errorMessage);
    } finally {
      setConfirmId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelWarehouseDocument(cancelId);
      await refetch();
      successToast("Documento cancelado exitosamente");
    } catch (error: any) {
      const errorMessage =
        error.response.data.message ??
        error.response.data.error ??
        "Error al cancelar el documento";
      errorToast(errorMessage);
    } finally {
      setCancelId(null);
    }
  };

  const handlePrint = () => {
    if (!toolbarDoc?.document_number) return;

    const downloadPromise = exportWarehouseDocumentByNumber(
      toolbarDoc.document_number,
    ).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    });

    promiseToast(downloadPromise, {
      loading: "Generando PDF...",
      success: "PDF generado correctamente",
      error: "Error al generar el PDF",
    });
  };

  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();

    if (search) {
      params.append("search", search);
    }
    if (selectedWarehouse) {
      params.append("warehouse_id", selectedWarehouse);
    }
    if (selectedType) {
      params.append("type", selectedType);
    }
    if (selectedStatus) {
      params.append("status", selectedStatus);
    }

    params.append("export", "excel");

    const queryString = params.toString();
    const baseExcelUrl = "/warehouse-document/export";
    return queryString ? `${baseExcelUrl}?${queryString}` : baseExcelUrl;
  }, [search, selectedWarehouse, selectedType, selectedStatus]);

  return (
    <PageWrapper>
      <WarehouseDocumentActions
        excelEndpoint={exportEndpoint}
        hasSelection={hasSelection}
        selectedStatus={toolbarDoc?.status}
        onNew={() => navigate(`${ROUTE}/agregar`)}
        onEdit={() => toolbarDoc && navigate(`${ROUTE}/actualizar/${toolbarDoc.id}`)}
        onDelete={() => toolbarDoc && setDeleteId(toolbarDoc.id)}
        onView={() => toolbarDoc && navigate(`${ROUTE}/${toolbarDoc.id}`)}
        onPrint={handlePrint}
        onConfirm={() => toolbarDoc && setConfirmId(toolbarDoc.id)}
        onCancel={() => toolbarDoc && setCancelId(toolbarDoc.id)}
      />

      <WarehouseDocumentTable
        isLoading={isLoading}
        columns={WarehouseDocumentColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(doc) => navigate(`${ROUTE}/actualizar/${doc.id}`)}
      >
        {warehouses && (
          <WarehouseDocumentOptions
            search={search}
            setSearch={setSearch}
            selectedWarehouse={selectedWarehouse}
            setSelectedWarehouse={setSelectedWarehouse}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            warehouses={warehouses}
          />
        )}
      </WarehouseDocumentTable>

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

      {confirmId !== null && (
        <AlertDialog
          open={true}
          onOpenChange={(open) => !open && setConfirmId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Documento</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea confirmar este documento? Esta acción
                actualizará el inventario y no se podrá editar posteriormente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {cancelId !== null && (
        <AlertDialog
          open={true}
          onOpenChange={(open) => !open && setCancelId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Documento</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro que desea cancelar este documento? Esta acción
                revertirá los cambios en el inventario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, mantener</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-destructive"
              >
                Sí, cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </PageWrapper>
  );
}
