import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGuides } from "../lib/guide.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import GuideActions from "./GuideActions";
import GuideTable from "./GuideTable";
import GuideOptions from "./GuideOptions";
import { useGuideStore } from "../lib/guide.store";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  promiseToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { api } from "@/lib/config";
import { GuideColumns } from "./GuideColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { GUIDE } from "../lib/guide.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = GUIDE;

export default function GuidePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { user } = useAuthStore();

  const { data, meta, isLoading, refetch } = useGuides({
    company_id: user?.company_id,
    page,
    search,
    per_page,
  });
  const { removeGuide } = useGuideStore();

  const selectedGuideId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarGuide = selectedGuideId
    ? (data?.find((g) => g.id.toString() === selectedGuideId) ?? null)
    : null;
  const hasSelection = !!toolbarGuide;

  const handleEdit = (id: number) => {
    navigate(`${GUIDE.ROUTE}/actualizar/${id}`);
  };

  const handlePrint = () => {
    if (!toolbarGuide) return;
    const download = api
      .get(`/sale-shipping-guides/${toolbarGuide.id}/pdf`, { responseType: "blob" })
      .then((response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        window.open(url, "_blank");

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `guia_${toolbarGuide.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      });
    promiseToast(download, {
      loading: "Generando PDF...",
      success: "PDF generado exitosamente",
      error: "Error al generar el PDF",
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await removeGuide(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  // Construir el endpoint con query params para exportación
  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();

    if (user?.company_id) {
      params.append("company_id", user.company_id.toString());
    }

    const queryString = params.toString();
    const baseExcelUrl = "/guide/export";

    return queryString ? `${baseExcelUrl}?${queryString}` : baseExcelUrl;
  }, [user?.company_id]);

  return (
    <PageWrapper>
      <GuideActions
        excelEndpoint={exportEndpoint}
        hasSelection={hasSelection}
        onNew={() => navigate(GUIDE.ROUTE_ADD)}
        onEdit={() => toolbarGuide && handleEdit(toolbarGuide.id)}
        onDelete={() => toolbarGuide && setDeleteId(toolbarGuide.id)}
        onPrint={handlePrint}
      />

      <GuideTable
        isLoading={isLoading}
        columns={GuideColumns()}
        data={data || []}
        onRowDoubleClick={(guide) => handleEdit(guide.id)}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <GuideOptions search={search} setSearch={setSearch} />
      </GuideTable>

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
    </PageWrapper>
  );
}
