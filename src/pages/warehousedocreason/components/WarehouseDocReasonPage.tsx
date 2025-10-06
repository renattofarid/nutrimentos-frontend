import { useEffect, useState } from "react";
import { useWarehouseDocReason } from "../lib/warehousedocreason.hook";
import TitleComponent from "@/components/TitleComponent";
import WarehouseDocReasonActions from "./WarehouseDocReasonActions";
import WarehouseDocReasonTable from "./WarehouseDocReasonTable";
import WarehouseDocReasonOptions from "./WarehouseDocReasonOptions";
import { deleteWarehouseDocReason } from "../lib/warehousedocreason.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { WarehouseDocReasonColumns } from "./WarehouseDocReasonColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { WAREHOUSEDOCREASON } from "../lib/warehousedocreason.interface";
import WarehouseDocReasonModal from "./WarehouseDocReasonModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = WAREHOUSEDOCREASON;

export default function WarehouseDocReasonPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useWarehouseDocReason();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWarehouseDocReason(deleteId);
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
        <WarehouseDocReasonActions />
      </div>

      <WarehouseDocReasonTable
        isLoading={isLoading}
        columns={WarehouseDocReasonColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <WarehouseDocReasonOptions search={search} setSearch={setSearch} />
      </WarehouseDocReasonTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <WarehouseDocReasonModal
          id={editId}
          open={true}
          onClose={() => setEditId(null)}
          title={`Editar ${MODEL.name}`}
          mode="update"
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
