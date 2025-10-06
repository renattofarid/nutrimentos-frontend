import { useEffect, useState } from "react";
import { usePaymentConcept } from "../lib/payment-concept.hook";
import TitleComponent from "@/components/TitleComponent";
import PaymentConceptActions from "./PaymentConceptActions";
import PaymentConceptTable from "./PaymentConceptTable";
import PaymentConceptModal from "./PaymentConceptModal";
import { deletePaymentConcept } from "../lib/payment-concept.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PaymentConceptColumns } from "./PaymentConceptColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PAYMENT_CONCEPT } from "../lib/payment-concept.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON, TITLES } = PAYMENT_CONCEPT;

export default function PaymentConceptPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedPaymentConceptId, setSelectedPaymentConceptId] = useState<
    number | null
  >(null);

  const { data, meta, isLoading, refetch } = usePaymentConcept();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
    };
    refetch(filterParams);
  }, [page, search, per_page, refetch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePaymentConcept(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
      };
      await refetch(filterParams);
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreatePaymentConcept = () => {
    setModalMode("create");
    setSelectedPaymentConceptId(null);
    setModalOpen(true);
  };

  const handleEditPaymentConcept = (id: number) => {
    setModalMode("update");
    setSelectedPaymentConceptId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPaymentConceptId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <PaymentConceptActions onCreatePaymentConcept={handleCreatePaymentConcept} />
      </div>

      <PaymentConceptTable
        isLoading={isLoading}
        columns={PaymentConceptColumns({
          onEdit: handleEditPaymentConcept,
          onDelete: setDeleteId,
        })}
        data={data || []}
      />

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {modalOpen && (
        <PaymentConceptModal
          id={selectedPaymentConceptId || undefined}
          open={modalOpen}
          title={modalMode === "create" ? TITLES.create.title : TITLES.update.title}
          mode={modalMode}
          onClose={handleCloseModal}
        />
      )}

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
