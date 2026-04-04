import { useEffect, useState } from "react";
import { useCategory } from "../lib/category.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import CategoryActions from "./CategoryActions";
import CategoryTable from "./CategoryTable";
import CategoryOptions from "./CategoryOptions";
import { deleteCategory } from "../lib/category.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { CategoryColumns } from "./CategoryColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { CATEGORY } from "../lib/category.interface";
import CategoryModal from "./CategoryModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = CATEGORY;

export default function CategoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useCategory();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const selectedCategoryId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarCategory = selectedCategoryId
    ? (data?.find((c) => c.id.toString() === selectedCategoryId) ?? null)
    : null;
  const hasSelection = !!toolbarCategory;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageWrapper>
      <CategoryActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => toolbarCategory && setEditId(toolbarCategory.id)}
        onDelete={() => toolbarCategory && setDeleteId(toolbarCategory.id)}
      />

      <CategoryTable
        isLoading={isLoading}
        columns={CategoryColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(cat) => setEditId(cat.id)}
      >
        <CategoryOptions search={search} setSearch={setSearch} />
      </CategoryTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <CategoryModal
          title={`Crear ${MODEL.name}`}
          mode="create"
          open={true}
          onClose={() => setOpenCreate(false)}
        />
      )}

      {editId !== null && (
        <CategoryModal
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
    </PageWrapper>
  );
}
