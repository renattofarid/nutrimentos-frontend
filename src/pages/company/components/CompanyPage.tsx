import { useEffect, useState } from "react";
import { useCompany } from "../lib/company.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import CompanyActions from "./CompanyActions";
import CompanyTable from "./CompanyTable";
import CompanyOptions from "./CompanyOptions";
import { deleteCompany } from "../lib/company.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { CompanyColumns } from "./CompanyColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { COMPANY } from "../lib/company.interface";
import CompanyModal from "./CompanyModal";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = COMPANY;

export default function CompanyPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data, meta, isLoading, refetch } = useCompany();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const selectedCompanyId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarCompany = selectedCompanyId
    ? (data?.find((c) => c.id.toString() === selectedCompanyId) ?? null)
    : null;
  const hasSelection = !!toolbarCompany;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCompany(deleteId);
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
      <CompanyActions
        hasSelection={hasSelection}
        onNew={() => setOpenCreate(true)}
        onEdit={() => toolbarCompany && setEditId(toolbarCompany.id)}
        onDelete={() => toolbarCompany && setDeleteId(toolbarCompany.id)}
      />

      <CompanyTable
        isLoading={isLoading}
        columns={CompanyColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(company) => setEditId(company.id)}
      >
        <CompanyOptions search={search} setSearch={setSearch} />
      </CompanyTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {openCreate && (
        <CompanyModal
          title={`Crear ${MODEL.name}`}
          mode="create"
          open={true}
          onClose={() => setOpenCreate(false)}
        />
      )}

      {editId !== null && (
        <CompanyModal
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
