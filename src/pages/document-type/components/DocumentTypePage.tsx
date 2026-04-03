import { useEffect, useState } from "react";
import { useDocumentType } from "../lib/document-type.hook";

import DocumentTypeActions from "./DocumentTypeActions";
import DocumentTypeTable from "./DocumentTypeTable";
import DocumentTypeOptions from "./DocumentTypeOptions";
import { deleteDocumentType } from "../lib/document-type.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { DocumentTypeColumns } from "./DocumentTypeColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { DOCUMENT_TYPE } from "../lib/document-type.interface";
import DocumentTypeModal from "./DocumentTypeModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL } = DOCUMENT_TYPE;

export default function DocumentTypePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, meta, isLoading, refetch } = useDocumentType();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDocumentType(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-2">
      <DocumentTypeActions />

      <DocumentTypeTable
        isLoading={isLoading}
        columns={DocumentTypeColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
        onRowDoubleClick={(row) => setEditId(row.id)}
      >
        <DocumentTypeOptions search={search} setSearch={setSearch} />
      </DocumentTypeTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {editId !== null && (
        <DocumentTypeModal
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
