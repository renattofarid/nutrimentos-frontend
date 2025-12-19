import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePriceList } from "../lib/pricelist.hook";
import TitleComponent from "@/components/TitleComponent";
import PriceListActions from "./PriceListActions";
import PriceListTable from "./PriceListTable";
import PriceListOptions from "./PriceListOptions";
import { usePriceListStore } from "../lib/pricelist.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PriceListColumns } from "./PriceListColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PRICELIST } from "../lib/pricelist.interface";
import AssignClientModal from "./AssignClientModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { PriceListDetailsSheet } from "./PriceListDetailsSheet";

const { MODEL, ICON } = PRICELIST;

export default function PriceListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assignClientId, setAssignClientId] = useState<number | null>(null);
  const [viewDetailsId, setViewDetailsId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = usePriceList();
  const { deletePriceList } = usePriceListStore();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page, refetch]);

  const handleEdit = (id: number) => {
    navigate(`${PRICELIST.ROUTE}/editar/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePriceList(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, "delete")
      );
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
        <PriceListActions />
      </div>

      <PriceListTable
        isLoading={isLoading}
        columns={PriceListColumns({
          onEdit: handleEdit,
          onDelete: setDeleteId,
          onAssignClient: setAssignClientId,
          onViewDetails: setViewDetailsId,
        })}
        data={data || []}
      >
        <PriceListOptions search={search} setSearch={setSearch} />
      </PriceListTable>

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

      {assignClientId !== null && (
        <AssignClientModal
          priceListId={assignClientId}
          open={true}
          onClose={() => setAssignClientId(null)}
        />
      )}

      {viewDetailsId !== null && (
        <PriceListDetailsSheet
          priceListId={viewDetailsId}
          open={true}
          onClose={() => setViewDetailsId(null)}
        />
      )}
    </div>
  );
}
