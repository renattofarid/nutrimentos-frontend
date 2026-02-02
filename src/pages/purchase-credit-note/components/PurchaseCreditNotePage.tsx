import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseCreditNote } from "../lib/purchase-credit-note.hook";
import TitleComponent from "@/components/TitleComponent";
import PurchaseCreditNoteActions from "./PurchaseCreditNoteActions";
import PurchaseCreditNoteTable from "./PurchaseCreditNoteTable";
import PurchaseCreditNoteOptions from "./PurchaseCreditNoteOptions";
import { deletePurchaseCreditNote } from "../lib/purchase-credit-note.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PurchaseCreditNoteColumns } from "./PurchaseCreditNoteColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PURCHASE_CREDIT_NOTE } from "../lib/purchase-credit-note.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = PURCHASE_CREDIT_NOTE;

export default function PurchaseCreditNotePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = usePurchaseCreditNote();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleEdit = (id: number) => {
    navigate(
      PURCHASE_CREDIT_NOTE.ROUTE_UPDATE.replace(":id", id.toString()),
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePurchaseCreditNote(deleteId);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <PurchaseCreditNoteActions />
      </div>

      <PurchaseCreditNoteTable
        isLoading={isLoading}
        columns={PurchaseCreditNoteColumns({
          onEdit: handleEdit,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <PurchaseCreditNoteOptions search={search} setSearch={setSearch} />
      </PurchaseCreditNoteTable>

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
