import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useDetailedSalesReport,
  useUserAsyncSearch,
  useWarehouseAsyncSearch,
  useCustomerAsyncSearch,
  useBranchAsyncSearch,
} from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  DetailedSalesReportParams,
  DetailedSaleItem,
} from "../lib/reports.interface";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FileSpreadsheet, FileText, Search, Filter } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportDetailedSalesReport } from "../lib/reports.actions";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { errorToast, successToast } from "@/lib/core.function";

interface FilterFormValues {
  branch_id: string;
  customer_id: string;
  document_type: string;
  payment_type: string;
  user_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
}

const columns: ColumnDef<DetailedSaleItem>[] = [
  {
    accessorKey: "fecha",
    header: "Fecha",
    size: 110,
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.fecha}</span>
    ),
  },
  {
    accessorKey: "nro_doc",
    header: "Nro. Documento",
    size: 150,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.nro_doc}
      </span>
    ),
  },
  {
    accessorKey: "nombre",
    header: "Cliente",
    size: 200,
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.nombre}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {row.original.dni_ruc}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "tienda",
    header: "Tienda",
    size: 140,
    cell: ({ row }) => <span className="text-sm">{row.original.tienda}</span>,
  },
  {
    accessorKey: "vendedor",
    header: "Vendedor",
    size: 180,
    cell: ({ row }) => <span className="text-sm">{row.original.vendedor}</span>,
  },
  {
    accessorKey: "cod_producto",
    header: "Cód.",
    size: 70,
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.cod_producto}</span>
    ),
  },
  {
    accessorKey: "producto",
    header: "Producto",
    size: 220,
    cell: ({ row }) => <span className="text-sm">{row.original.producto}</span>,
  },
  {
    accessorKey: "sac",
    header: "Sacos",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right">{row.original.sac}</span>
    ),
  },
  {
    accessorKey: "kg",
    header: "Kg",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.kg}</span>
    ),
  },
  {
    accessorKey: "precio",
    header: "Precio",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.precio}</span>
    ),
  },
  {
    accessorKey: "sub_total",
    header: "Subtotal",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.sub_total}</span>
    ),
  },
  {
    accessorKey: "igv",
    header: "IGV",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.igv}</span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {row.original.total}
      </span>
    ),
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    size: 200,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.direccion}
      </span>
    ),
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.telefono}</span>
    ),
  },
];

export default function DetailedSalesReportPage() {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { data: rawData, isLoading, fetch } = useDetailedSalesReport();

  const form = useForm<FilterFormValues>({
    defaultValues: {
      branch_id: "",
      customer_id: "",
      document_type: "",
      payment_type: "",
      user_id: "",
      warehouse_id: "",
      start_date: "",
      end_date: "",
    },
  });

  const buildParams = (
    values: FilterFormValues,
  ): DetailedSalesReportParams => ({
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    customer_id: values.customer_id ? Number(values.customer_id) : null,
    document_type:
      (values.document_type as DetailedSalesReportParams["document_type"]) ||
      null,
    payment_type:
      (values.payment_type as DetailedSalesReportParams["payment_type"]) ||
      null,
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
      const blob = await exportDetailedSalesReport(buildParams(values), format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-ventas-detallado.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      successToast("Reporte de Ventas Detallado exportado exitosamente");
    } catch {
      errorToast("Error al exportar el reporte de Ventas Detallado");
    } finally {
      setIsExportingExcel(false);
      setIsExportingPdf(false);
    }
  };

  const tableData = rawData?.data ?? [];

  return (
    <PageWrapper>
      <TitleComponent
        title="Reporte de Ventas Detallado"
        subtitle="Consulta las ventas por cliente, vendedor, tipo de documento y período"
        icon="BookOpen"
      />

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
            <FormSelect
              control={form.control}
              name="document_type"
              label="Tipo Documento"
              placeholder="Todos"
              options={[
                { label: "Factura", value: "FACTURA" },
                { label: "Boleta", value: "BOLETA" },
                { label: "Ticket", value: "TICKET" },
              ]}
            />

            <FormSelect
              control={form.control}
              name="payment_type"
              label="Forma de Pago"
              placeholder="Todas"
              options={[
                { label: "Contado", value: "CONTADO" },
                { label: "Crédito", value: "CREDITO" },
              ]}
            />

            <FormSelectAsync
              control={form.control}
              name="customer_id"
              label="Cliente"
              placeholder="Buscar cliente..."
              useQueryHook={useCustomerAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
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

            <DateRangePickerFormField
              control={form.control}
              nameFrom="start_date"
              nameTo="end_date"
              label="Rango de Fechas"
              placeholder="Seleccionar rango"
            />
          </GroupFormSection>

          {/* {rawData && (
            <GroupFormSection
              title="Resumen"
              icon={ArrowUpDown}
              cols={{ sm: 1, md: 2 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Registros</p>
                <p className="text-2xl font-bold">{rawData.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Importe</p>
                <p className="text-2xl font-bold">
                  {tableData
                    .reduce((acc, row) => acc + parseFloat(row.total || "0"), 0)
                    .toFixed(2)}
                </p>
              </div>
            </GroupFormSection>
          )} */}

          <DataTable
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            initialColumnVisibility={{
              igv: false,
              direccion: false,
              telefono: false,
            }}
          />
        </form>
      </Form>
    </PageWrapper>
  );
}
