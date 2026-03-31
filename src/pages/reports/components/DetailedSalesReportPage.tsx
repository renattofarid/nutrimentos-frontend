import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useDetailedSalesReport,
  useUserAsyncSearch,
  useWarehouseAsyncSearch,
  useBranchAsyncSearch,
} from "../lib/reports.hook";

import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  DetailedSalesReportParams,
  DetailedSaleItem,
} from "../lib/reports.interface";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Search, Filter } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportDetailedSalesReport } from "../lib/reports.actions";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { useClients } from "@/pages/client/lib/client.hook";
import ExportButtons from "@/components/ExportButtons";

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

  const handleExcelExport = async () => {
    const values = form.getValues();
    setIsExportingExcel(true);
    try {
      const blob = await exportDetailedSalesReport(buildParams(values), "excel");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-ventas-detallado.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handlePdfExport = async () => {
    const values = form.getValues();
    setIsExportingPdf(true);
    try {
      const blob = await exportDetailedSalesReport(buildParams(values), "pdf");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-ventas-detallado.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const tableData = rawData?.data ?? [];

  return (
    <PageWrapper>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)}>
          <div className="flex gap-4 items-start">
            {/* LEFT: Filter card — single column */}
            <div className="w-64 shrink-0">
              <GroupFormSection
                title="Filtros"
                icon={Filter}
                gap="gap-2"
                cols={{ sm: 1 }}
                horizontal
              >
                <FormSelect
                  control={form.control}
                  name="document_type"
                  label="Tipo Documento"
                  placeholder="Todos"
                  tabIndex={1}
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
                  tabIndex={2}
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
                  useQueryHook={useClients}
                  mapOptionFn={(item) => ({
                    label:
                      item.business_name ??
                      `${item.names} ${item.father_surname} ${item.mother_surname}`.trim(),
                    value: String(item.id),
                    description: item.number_document ?? undefined,
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

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="sm"
                    className="w-full"
                    tabIndex={3}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                  <ExportButtons
                    onExcelDownload={handleExcelExport}
                    onPdfDownload={handlePdfExport}
                    excelFileName="reporte-ventas-detallado.xlsx"
                    pdfFileName="reporte-ventas-detallado.pdf"
                    disableExcel={isExportingExcel}
                    disablePdf={isExportingPdf}
                  />
                </div>
              </GroupFormSection>
            </div>

            {/* RIGHT: Data table */}
            <div className="flex-1 min-w-0">
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
            </div>
          </div>
        </form>
      </Form>
    </PageWrapper>
  );
}
