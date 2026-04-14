import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useSalesByProductReport,
  useUserAsyncSearch,
  useWarehouseAsyncSearch,
  useBranchAsyncSearch,
} from "../lib/reports.hook";

import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  SalesByProductReportParams,
  SalesByProductItem,
} from "../lib/reports.interface";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FileSpreadsheet, FileText, Search, Filter } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportSalesByProductReport } from "../lib/reports.actions";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { errorToast, successToast } from "@/lib/core.function";

interface FilterFormValues {
  branch_id: string;
  user_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
}

const columns: ColumnDef<SalesByProductItem>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.codigo}</span>
    ),
  },
  {
    accessorKey: "producto",
    header: "Producto",
    size: 280,
    cell: ({ row }) => <span className="text-sm">{row.original.producto}</span>,
  },
  {
    accessorKey: "sacos",
    header: "Sacos",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.sacos}
      </span>
    ),
  },
  {
    accessorKey: "kg",
    header: "Kg",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.kg.toLocaleString("es-PE")}
      </span>
    ),
  },
  {
    accessorKey: "tn",
    header: "Tn",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.tn.toFixed(3)}
      </span>
    ),
  },
  {
    accessorKey: "p_prom",
    header: "P. Prom.",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.p_prom.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "sin_igv",
    header: "Sin IGV",
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.sin_igv.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "con_igv",
    header: "Con IGV",
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold text-right block">
        {row.original.con_igv.toLocaleString("es-PE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "is_taxed",
    header: "Afecto IGV",
    size: 90,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.is_taxed ? "Sí" : "No"}</span>
    ),
  },
];

export default function SalesByProductReportPage() {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { data: rawData, isLoading, fetch } = useSalesByProductReport();

  const form = useForm<FilterFormValues>({
    defaultValues: {
      branch_id: "",
      user_id: "",
      warehouse_id: "",
      start_date: "",
      end_date: "",
    },
  });

  const buildParams = (
    values: FilterFormValues,
  ): SalesByProductReportParams => ({
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    user_id: values.user_id ? Number(values.user_id) : null,
    warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
  });

  const handleSearch = (values: FilterFormValues) => {
    fetch(buildParams(values));
  };

  const handleExport = async (format: "excel" | "pdf") => {
    const values = form.getValues();
    if (format === "excel") setIsExportingExcel(true);
    else setIsExportingPdf(true);
    try {
      const blob = await exportSalesByProductReport(
        buildParams(values),
        format,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-ventas-por-producto.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      successToast("Reporte de Ventas por Producto exportado exitosamente");
    } catch {
      errorToast("Error al exportar el reporte de Ventas por Producto");
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
                <Button type="submit" disabled={isLoading} size="xs">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleExport("excel")}
                  disabled={isExportingExcel}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleExport("pdf")}
                  disabled={isExportingPdf}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            }
          >
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

            <DateRangePickerFormField
              control={form.control}
              nameFrom="start_date"
              nameTo="end_date"
              label="Rango de Fechas"
              placeholder="Seleccionar rango"
            />
          </GroupFormSection>

          <DataTable columns={columns} data={tableData} isLoading={isLoading} />
        </form>
      </Form>
    </PageWrapper>
  );
}
