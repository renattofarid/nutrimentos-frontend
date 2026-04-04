import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkers } from "../lib/worker.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import WorkerActions from "./WorkerActions";
import PersonTable from "@/pages/person/components/PersonTable";
import PersonOptions from "@/pages/person/components/PersonOptions";
import { deletePerson } from "@/pages/person/lib/person.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PersonColumns } from "@/pages/person/components/PersonColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { WORKER, WORKER_ROLE_ID } from "../lib/worker.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { PersonSearchField } from "@/pages/person/components/PersonOptions";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = WORKER;

export default function WorkerPage() {
  const navigate = useNavigate();
  const [searchField, setSearchField] = useState<PersonSearchField>("search");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const queryParams: Record<string, unknown> = { page, per_page };
  if (search.trim()) {
    queryParams[searchField] = search.trim();
  }

  const { data, isLoading, refetch } = useWorkers(queryParams);

  useEffect(() => {
    setPage(1);
  }, [search, searchField, per_page]);

  const selectedWorkerId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarWorker = selectedWorkerId
    ? (data?.data?.find((w) => w.id.toString() === selectedWorkerId) ?? null)
    : null;
  const hasSelection = !!toolbarWorker;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerson(deleteId, WORKER_ROLE_ID);
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
      <WorkerActions
        hasSelection={hasSelection}
        onNew={() => navigate("/trabajadores/agregar")}
        onEdit={() => toolbarWorker && navigate(`/trabajadores/editar/${toolbarWorker.id}`)}
        onDelete={() => toolbarWorker && setDeleteId(toolbarWorker.id)}
      />

      <PersonTable
        isLoading={isLoading}
        columns={PersonColumns()}
        data={data?.data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(person) => navigate(`/trabajadores/editar/${person.id}`)}
      >
        <PersonOptions
          searchField={searchField}
          setSearchField={setSearchField}
          search={search}
          setSearch={setSearch}
        />
      </PersonTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          // title={`Eliminar ${MODEL.name}`}
          // description={`¿Está seguro de que desea eliminar este ${MODEL.name.toLowerCase()}? Esta acción no se puede deshacer.`}
        />
      )}
    </PageWrapper>
  );
}
