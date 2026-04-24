import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreditNote } from "../lib/credit-note.hook";
import type { RowSelectionState } from "@tanstack/react-table";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";

import CreditNoteActions from "./CreditNoteActions";
import CreditNoteTable from "./CreditNoteTable";
import CreditNoteOptions from "./CreditNoteOptions";
import { deleteCreditNote } from "../lib/credit-note.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
  promiseToast,
} from "@/lib/core.function";
import { CreditNoteColumns } from "./CreditNoteColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { api } from "@/lib/config";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = CREDIT_NOTE;

export default function CreditNotePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [motive_id, setMotiveId] = useState("");
  const [customer_id, setCustomerId] = useState("");
  const [sale_id, setSaleId] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleResource | null>(null);
  const [issue_date_from, setIssueDateFrom] = useState<Date | undefined>();
  const [issue_date_to, setIssueDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useCreditNote();

  const buildParams = () => ({
    page,
    per_page,
    full_document_number: search || undefined,
    status: status || undefined,
    credit_note_motive_id: motive_id ? Number(motive_id) : undefined,
    customer_id: customer_id ? Number(customer_id) : undefined,
    "issue_date[0]": issue_date_from
      ? issue_date_from.toISOString().split("T")[0]
      : undefined,
    "issue_date[1]": issue_date_to
      ? issue_date_to.toISOString().split("T")[0]
      : undefined,
  });

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [search, status, motive_id, customer_id, issue_date_from, issue_date_to, per_page]);

  useEffect(() => {
    refetch(buildParams());
  }, [page, per_page, search, status, motive_id, customer_id, issue_date_from, issue_date_to]);

  const handleGenerateCreditNote = () => {
    if (!selectedSale) return;
    navigate(CREDIT_NOTE.ROUTE_ADD, { state: { sale: selectedSale } });
  };

  const selectedNoteId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarNote = selectedNoteId
    ? (data?.find((n) => n.id.toString() === selectedNoteId) ?? null)
    : null;
  const hasSelection = !!toolbarNote;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCreditNote(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        ERROR_MESSAGE(MODEL, "delete");
      errorToast(message);
    } finally {
      setDeleteId(null);
    }
  };

  const handlePrint = () => {
    if (!toolbarNote) return;
    const download = api
      .get(`/credit-notes/${toolbarNote.id}/pdf`, { responseType: "blob" })
      .then((response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `nota_credito_${toolbarNote.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      });
    promiseToast(download, {
      loading: "Generando PDF...",
      success: "PDF generado exitosamente",
      error: "Error al generar el PDF",
    });
  };

  const exportFilters = {
    full_document_number: search || undefined,
    status: status || undefined,
    credit_note_motive_id: motive_id ? Number(motive_id) : undefined,
    customer_id: customer_id ? Number(customer_id) : undefined,
    "issue_date[0]": issue_date_from
      ? issue_date_from.toISOString().split("T")[0]
      : undefined,
    "issue_date[1]": issue_date_to
      ? issue_date_to.toISOString().split("T")[0]
      : undefined,
  };

  return (
    <PageWrapper>
      <CreditNoteActions
        hasSelection={hasSelection}
        onDelete={() => toolbarNote && setDeleteId(toolbarNote.id)}
        onPrint={handlePrint}
        filters={exportFilters}
      />

      <CreditNoteTable
        isLoading={isLoading}
        columns={CreditNoteColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <CreditNoteOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          motive_id={motive_id}
          setMotiveId={setMotiveId}
          customer_id={customer_id}
          setCustomerId={setCustomerId}
          issue_date_from={issue_date_from}
          issue_date_to={issue_date_to}
          onDateChange={(from, to) => {
            setIssueDateFrom(from);
            setIssueDateTo(to);
          }}
          sale_id={sale_id}
          setSaleId={setSaleId}
          onSaleValueChange={(_val, item) => setSelectedSale(item ?? null)}
          onGenerateCreditNote={handleGenerateCreditNote}
        />
      </CreditNoteTable>

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
    </PageWrapper>
  );
}
