import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useAnnualSalesReport,
  useUserAsyncSearch,
  useWarehouseAsyncSearch,
  useBranchAsyncSearch,
} from "../lib/reports.hook";

import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  AnnualSalesReportParams,
  AnnualSalesItem,
} from "../lib/reports.interface";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FileSpreadsheet, FileText, Search, Filter } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportAnnualSalesReport } from "../lib/reports.actions";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormInput } from "@/components/FormInput";
import { errorToast, successToast } from "@/lib/core.function";

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

interface FilterFormValues {
  branch_id: string;
  user_id: string;
  warehouse_id: string;
  year: string;
}

const columns: ColumnDef<AnnualSalesItem>[] = [
  {
    accessorKey: "zona",
    header: "Zona",
    size: 130,
    cell: ({ row }) => <span className="text-sm">{row.original.zona}</span>,
  },
  {
    accessorKey: "vendedor",
    header: "Vendedor",
    size: 180,
    cell: ({ row }) => <span className="text-sm">{row.original.vendedor}</span>,
  },
  {
    accessorKey: "codigo",
    header: "Cód.",
    size: 60,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.codigo}</span>
    ),
  },
  {
    accessorKey: "producto",
    header: "Producto",
    size: 220,
    cell: ({ row }) => <span className="text-sm">{row.original.producto}</span>,
  },
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((m) => ({
    id: `month_${m}`,
    header: MONTH_NAMES[m - 1],
    size: 70,
    cell: ({ row }: { row: { original: AnnualSalesItem } }) => {
      const val = row.original.months[String(m) as keyof typeof row.original.months];
      return (
        <span className="font-mono text-sm text-right block">
          {val !== 0 ? val.toFixed(2) : "-"}
        </span>
      );
    },
  })),
  {
    accessorKey: "total",
    header: "Total",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {row.original.total.toFixed(2)}
      </span>
    ),
  },
];

export default function AnnualSalesReportPage() {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { data: rawData, isLoading, fetch } = useAnnualSalesReport();

  const form = useForm<FilterFormValues>({
    defaultValues: {
      branch_id: "",
      user_id: "",
      warehouse_id: "",
      year: String(new Date().getFullYear()),
    },
  });

  const buildParams = (values: FilterFormValues): AnnualSalesReportParams => ({
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    user_id: values.user_id ? Number(values.user_id) : null,
    warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
    year: values.year ? Number(values.year) : null,
  });

  const handleSearch = (values: FilterFormValues) => {
    fetch(buildParams(values));
  };

  const handleExport = async (format: "excel" | "pdf") => {
    const values = form.getValues();
    if (format === "excel") setIsExportingExcel(true);
    else setIsExportingPdf(true);
    try {
      const blob = await exportAnnualSalesReport(buildParams(values), format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-ventas-anuales.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      successToast("Reporte de Ventas Anuales exportado exitosamente");
    } catch {
      errorToast("Error al exportar el reporte de Ventas Anuales");
    } finally {
      setIsExportingExcel(false);
      setIsExportingPdf(false);
    }
  };

  const tableData = rawData?.data ?? [];

  return (
    <PageWrapper>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
          <GroupFormSection
            title="Filtros de Búsqueda"
            icon={Filter}
            gap="gap-2"
            cols={{ sm: 1, md: 2, lg: 4 }}
            headerExtra={
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} size="sm">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("excel")}
                  disabled={isExportingExcel}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pdf")}
                  disabled={isExportingPdf}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            }
          >
            <FormInput
              control={form.control}
              name="year"
              label="Año"
              placeholder="Ej: 2025"
              type="number"
            />

            <FormSelectAsync
              control={form.control}
              name="user_id"
              label="Vendedor"
              placeholder="Buscar vendedor..."
              useQueryHook={useUserAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
            />

            <FormSelectAsync
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Buscar almacén..."
              useQueryHook={useWarehouseAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
            />

            <FormSelectAsync
              control={form.control}
              name="branch_id"
              label="Sucursal"
              placeholder="Buscar sucursal..."
              useQueryHook={useBranchAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
            />
          </GroupFormSection>

          <DataTable
            columns={columns}
            data={tableData}
            isLoading={isLoading}
          />
        </form>
      </Form>
    </PageWrapper>
  );
}
