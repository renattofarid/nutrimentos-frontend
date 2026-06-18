import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Filter, FileSpreadsheet, Search, ArrowUpDown } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import {
  getSalesBySellerMonthlyReport,
  exportSalesBySellerMonthlyReport,
} from "../lib/reports.actions";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/lib/core.function";
import { format } from "date-fns";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { SalesBySellerMonthlyItem, SalesBySellerMonthlyReportParams } from "../lib/reports.interface";
import {
  useBranchAsyncSearch,
  useUserAsyncSearch,
  useWarehouseAsyncSearch,
  useZoneAsyncSearch,
} from "../lib/reports.hook";

interface FilterFormValues {
  month: string;
  branch_id: string;
  vendedor_id: string;
  warehouse_id: string;
  zone_id: string;
}

const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const columns: ColumnDef<SalesBySellerMonthlyItem>[] = [
  {
    accessorKey: "vendedor",
    header: "Vendedor",
    size: 220,
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.vendedor}</span>
    ),
  },
  {
    accessorKey: "mes",
    header: "Mes",
    size: 120,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.mes}</span>
    ),
  },
  {
    id: "contado_sin_igv",
    header: "Contado s/IGV",
    size: 130,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {fmt(row.original.contado_sin_igv)}
      </span>
    ),
  },
  {
    id: "contado_monto",
    header: "Contado c/IGV",
    size: 130,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {fmt(row.original.contado_monto)}
      </span>
    ),
  },
  {
    id: "contado_docs",
    header: "Docs Contado",
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-center block">
        {row.original.contado_docs}
      </span>
    ),
  },
  {
    id: "credito_sin_igv",
    header: "Crédito s/IGV",
    size: 130,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {fmt(row.original.credito_sin_igv)}
      </span>
    ),
  },
  {
    id: "credito_monto",
    header: "Crédito c/IGV",
    size: 130,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {fmt(row.original.credito_monto)}
      </span>
    ),
  },
  {
    id: "credito_docs",
    header: "Docs Crédito",
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-center block">
        {row.original.credito_docs}
      </span>
    ),
  },
  {
    id: "total_sin_igv",
    header: "Total s/IGV",
    size: 120,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold text-right block">
        {fmt(row.original.total_sin_igv)}
      </span>
    ),
  },
  {
    id: "total_monto",
    header: "Total c/IGV",
    size: 120,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold text-blue-600 text-right block">
        {fmt(row.original.total_monto)}
      </span>
    ),
  },
  {
    id: "total_docs",
    header: "Total Docs",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-center block">
        {row.original.total_docs}
      </span>
    ),
  },
];

export default function SalesBySellerMonthlyReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<SalesBySellerMonthlyItem[] | null>(null);

  const currentMonth = format(new Date(), "yyyy-MM");

  const form = useForm<FilterFormValues>({
    defaultValues: {
      month: currentMonth,
      branch_id: "",
      vendedor_id: "",
      warehouse_id: "",
      zone_id: "",
    },
  });

  const buildParams = (values: FilterFormValues): SalesBySellerMonthlyReportParams => ({
    month: values.month,
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    vendedor_id: values.vendedor_id ? Number(values.vendedor_id) : null,
    warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
    zone_id: values.zone_id ? Number(values.zone_id) : null,
  });

  const handleSearch = async (values: FilterFormValues) => {
    if (!values.month) return;
    setIsLoading(true);
    try {
      const res = await getSalesBySellerMonthlyReport(buildParams(values));
      setReportData(res.data);
    } catch {
      errorToast("Error al obtener el reporte");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    const values = form.getValues();
    if (!values.month) return;
    setIsExporting(true);
    try {
      const blob = await exportSalesBySellerMonthlyReport({ ...buildParams(values), format: "excel" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ventas-detalladas-por-vendedor-${values.month}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      successToast("Reporte exportado exitosamente");
    } catch {
      errorToast("Error al exportar el reporte");
    } finally {
      setIsExporting(false);
    }
  };

  const tableData = reportData ?? [];

  const totals = tableData.reduce(
    (acc, row) => ({
      total_sin_igv: acc.total_sin_igv + row.total_sin_igv,
      total_monto: acc.total_monto + row.total_monto,
      total_docs: acc.total_docs + row.total_docs,
    }),
    { total_sin_igv: 0, total_monto: 0, total_docs: 0 },
  );

  return (
    <PageWrapper size="3xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSearch)}
          className="space-y-6 grid lg:grid-cols-3 gap-4"
        >
          <GroupFormSection
            title="Filtros"
            icon={Filter}
            gap="gap-2"
            className="lg:col-span-2"
            cols={{ sm: 1, md: 2, lg: 3 }}
          >
            <FormInput
              control={form.control}
              name="month"
              label="Mes"
              type="month"
              required
            />

            <FormSelectAsync
              control={form.control}
              name="branch_id"
              label="Sucursal"
              placeholder="Todas"
              useQueryHook={useBranchAsyncSearch}
              mapOptionFn={(item) => ({ label: item.name, value: String(item.id) })}
            />

            <FormSelectAsync
              control={form.control}
              name="vendedor_id"
              label="Vendedor"
              placeholder="Todos"
              useQueryHook={useUserAsyncSearch}
              mapOptionFn={(item) => ({ label: item.name, value: String(item.id) })}
            />

            <FormSelectAsync
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Todos"
              useQueryHook={useWarehouseAsyncSearch}
              mapOptionFn={(item) => ({ label: item.name, value: String(item.id) })}
            />

            <FormSelectAsync
              control={form.control}
              name="zone_id"
              label="Zona"
              placeholder="Todas"
              useQueryHook={useZoneAsyncSearch}
              mapOptionFn={(item) => ({ label: item.name, value: String(item.id) })}
            />

            <div className="flex items-end gap-2 h-full">
              <Button type="submit" variant="outline" color="primary" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button
                type="button"
                color="green"
                onClick={handleExport}
                disabled={isExporting || tableData.length === 0}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </GroupFormSection>

          {reportData !== null && (
            <GroupFormSection
              title="Resumen"
              icon={ArrowUpDown}
              cols={{ sm: 1, md: 3 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground text-center">Total s/IGV</p>
                <p className="text-xl font-bold text-center">{fmt(totals.total_sin_igv)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground text-center">Total c/IGV</p>
                <p className="text-xl font-bold text-blue-600 text-center">{fmt(totals.total_monto)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground text-center">Total Docs</p>
                <p className="text-xl font-bold text-center">{totals.total_docs}</p>
              </div>
            </GroupFormSection>
          )}

          <div className="col-span-full">
            <DataTable columns={columns} data={tableData} isLoading={isLoading} />
          </div>
        </form>
      </Form>
    </PageWrapper>
  );
}
