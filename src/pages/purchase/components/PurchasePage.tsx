import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchase } from "../lib/purchase.hook";
import TitleComponent from "@/components/TitleComponent";
import PurchaseActions from "./PurchaseActions";
import PurchaseTable from "./PurchaseTable";
import PurchaseOptions from "./PurchaseOptions";
import { deletePurchase } from "../lib/purchase.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PurchaseColumns } from "./PurchaseColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PURCHASE } from "../lib/purchase.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = PURCHASE;

export default function PurchasePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = usePurchase();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleView = (id: number) => {
    navigate(`/compra/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/compra/actualizar/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePurchase(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
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
        <PurchaseActions />
      </div>

      <PurchaseTable
        isLoading={isLoading}
        columns={PurchaseColumns({
          onView: handleView,
          onEdit: handleEdit,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <PurchaseOptions search={search} setSearch={setSearch} />
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
    </div>
  );
}
