import { useEffect, useState } from "react";
import { useBusinessType } from "../lib/businesstype.hook";
import TitleComponent from "@/components/TitleComponent";
import BusinessTypeActions from "./BusinessTypeActions";
import BusinessTypeTable from "./BusinessTypeTable";
import BusinessTypeOptions from "./BusinessTypeOptions";
import { deleteBusinessType } from "../lib/businesstype.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { BusinessTypeColumns } from "./BusinessTypeColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { BUSINESSTYPE } from "../lib/businesstype.interface";
import BusinessTypeModal from "./BusinessTypeModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = BUSINESSTYPE;

export default function BusinessTypePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useBusinessType();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBusinessType(deleteId);
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
        <BusinessTypeActions />
      </div>

      <BusinessTypeTable
        isLoading={isLoading}
        columns={BusinessTypeColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <BusinessTypeOptions search={search} setSearch={setSearch} />
      </BusinessTypeTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <BusinessTypeModal
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
