import { useEffect, useState } from "react";
import { useCreditNote } from "../lib/credit-note.hook";
import TitleComponent from "@/components/TitleComponent";
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
} from "@/lib/core.function";
import { CreditNoteColumns } from "./CreditNoteColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = CREDIT_NOTE;

export default function CreditNotePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [motive_id, setMotiveId] = useState("");
  const [customer_id, setCustomerId] = useState("");
  const [issue_date_from, setIssueDateFrom] = useState<Date | undefined>();
  const [issue_date_to, setIssueDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
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

  // Reset page when filters change
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [
    search,
    status,
    motive_id,
    customer_id,
    issue_date_from,
    issue_date_to,
    per_page,
  ]);

  // Refetch when any filter or page changes
  useEffect(() => {
    refetch(buildParams());
  }, [
    page,
    per_page,
    search,
    status,
    motive_id,
    customer_id,
    issue_date_from,
    issue_date_to,
  ]);

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <CreditNoteActions filters={exportFilters} />
      </div>

      <CreditNoteTable
        isLoading={isLoading}
        columns={CreditNoteColumns({
          onDelete: setDeleteId,
        })}
        data={data || []}
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
    </div>
  );
}
