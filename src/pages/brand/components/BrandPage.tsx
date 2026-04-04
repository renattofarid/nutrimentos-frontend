import { useEffect, useState } from "react";
import { useBrand } from "../lib/brand.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import BrandActions from "./BrandActions";
import BrandTable from "./BrandTable";
import BrandOptions from "./BrandOptions";
import { deleteBrand } from "../lib/brand.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { BrandColumns } from "./BrandColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { BRAND } from "../lib/brand.interface";
import BrandModal from "./BrandModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = BRAND;

export default function BrandPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useBrand();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const selectedBrandId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarBrand = selectedBrandId
    ? (data?.find((b) => b.id.toString() === selectedBrandId) ?? null)
    : null;
  const hasSelection = !!toolbarBrand;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBrand(deleteId);
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
      <BrandActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => toolbarBrand && setEditId(toolbarBrand.id)}
        onDelete={() => toolbarBrand && setDeleteId(toolbarBrand.id)}
      />

      <BrandTable
        isLoading={isLoading}
        columns={BrandColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(brand) => setEditId(brand.id)}
      >
        <BrandOptions search={search} setSearch={setSearch} />
      </BrandTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <BrandModal
          title={`Crear ${MODEL.name}`}
          mode="create"
          open={true}
          onClose={() => setOpenCreate(false)}
        />
      )}

      {editId !== null && (
        <BrandModal
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
