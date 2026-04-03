import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePriceList } from "../lib/pricelist.hook";
import type { RowSelectionState } from "@tanstack/react-table";

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
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = PRICELIST;

export default function PriceListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assignClientId, setAssignClientId] = useState<number | null>(null);
  const [viewDetailsId, setViewDetailsId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, meta, isLoading, refetch } = usePriceList();
  const { deletePriceList } = usePriceListStore();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page, refetch]);

  const selectedPriceListId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarPriceList = selectedPriceListId
    ? (data?.find((p) => p.id.toString() === selectedPriceListId) ?? null)
    : null;
  const hasSelection = !!toolbarPriceList;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePriceList(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageWrapper>
      <PriceListActions
        hasSelection={hasSelection}
        onNew={() => navigate(`${PRICELIST.ROUTE}/agregar`)}
        onEdit={() => toolbarPriceList && navigate(`${PRICELIST.ROUTE}/editar/${toolbarPriceList.id}`)}
        onDelete={() => toolbarPriceList && setDeleteId(toolbarPriceList.id)}
        onViewDetails={() => toolbarPriceList && setViewDetailsId(toolbarPriceList.id)}
        onAssignClient={() => toolbarPriceList && setAssignClientId(toolbarPriceList.id)}
      />

      <PriceListTable
        isLoading={isLoading}
        columns={PriceListColumns()}
        data={data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(pl) => navigate(`${PRICELIST.ROUTE}/editar/${pl.id}`)}
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
    </PageWrapper>
  );
}
