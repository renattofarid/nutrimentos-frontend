import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCommissionsReport,
  useUserAsyncSearch,
  useWarehouseAsyncSearch,
} from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  CommissionsReportParams,
  CommissionDatum,
} from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import type { BadgeColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportCommissionsReport } from "../lib/reports.actions";
import { toast } from "sonner";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { useSidebar } from "@/components/ui/sidebar";

interface FilterFormValues {
  document_type: string;
  payment_type: string;
  user_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
}

const statusColor = (status: string): BadgeColor => {
  const s = status?.toUpperCase();
  if (s === "PAGADO" || s === "COMPLETADO") return "green";
  if (s === "PENDIENTE") return "yellow";
  if (s === "ANULADO") return "destructive";
  return "muted";
};

const columns: ColumnDef<CommissionDatum>[] = [
  {
    accessorKey: "issue_date",
    header: "Fecha",
    size: 110,
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.issue_date}</span>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Tipo Doc.",
    size: 100,
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.document_type}</Badge>
    ),
  },
  {
    accessorKey: "document_number",
    header: "Nro. Documento",
    size: 140,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.document_number}
      </span>
    ),
  },
  {
    accessorKey: "seller",
    header: "Vendedor",
    size: 150,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.seller.name}</span>
    ),
  },
  {
    accessorKey: "customer",
    header: "Cliente",
    size: 160,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.customer.name}</span>
    ),
  },
  {
    accessorKey: "warehouse",
    header: "Almacén",
    size: 130,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.warehouse.name}</span>
    ),
  },
  {
    accessorKey: "payment_type",
    header: "Forma Pago",
    size: 110,
    cell: ({ row }) => (
      <Badge color="secondary">{row.original.payment_type}</Badge>
    ),
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.subtotal}</span>
    ),
  },
  {
    accessorKey: "tax_amount",
    header: "IGV",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.tax_amount}</span>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {row.original.total_amount}
      </span>
    ),
  },
  {
    accessorKey: "cost_total",
    header: "Costo",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.cost_total ?? "—"}</span>
    ),
  },
  {
    accessorKey: "gross_profit",
    header: "Utilidad",
    size: 100,
    cell: ({ row }) => {
      const val = row.original.gross_profit;
      if (!val || val === 0)
        return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <span className="font-semibold text-green-600 font-mono">{val}</span>
      );
    },
  },
  {
    accessorKey: "commission_rate",
    header: "% Comisión",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.commission_rate}</span>
    ),
  },
  {
    accessorKey: "commission",
    header: "Comisión",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold text-blue-600">
        {row.original.commission ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    size: 110,
    cell: ({ row }) => (
      <Badge color={statusColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
];

export default function CommissionsReportPage() {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { setOpen, setOpenMobile } = useSidebar();
  const { data: rawData, isLoading, fetch } = useCommissionsReport();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const form = useForm<FilterFormValues>({
    defaultValues: {
      document_type: "",
      payment_type: "",
      user_id: "",
      warehouse_id: "",
      start_date: "",
      end_date: "",
    },
  });

  const buildParams = (values: FilterFormValues): CommissionsReportParams => ({
    document_type:
      (values.document_type as CommissionsReportParams["document_type"]) ||
      null,
    payment_type:
      (values.payment_type as CommissionsReportParams["payment_type"]) || null,
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
      const blob = await exportCommissionsReport(buildParams(values), format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-comisiones.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Reporte de Comisiones exportado exitosamente");
    } catch {
      toast.error("Error al exportar el reporte de Comisiones");
    } finally {
      setIsExportingExcel(false);
      setIsExportingPdf(false);
    }
  };

  const tableData = rawData?.data ?? [];

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Reporte de Comisiones"
        subtitle="Consulta las comisiones por vendedor, tipo de documento y período"
        icon="BookOpen"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
          <GroupFormSection
            title="Filtros de Búsqueda"
            icon={Filter}
            gap="gap-2"
            cols={{ sm: 1, md: 2, lg: 5 }}
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
                  disabled={isExportingExcel || tableData.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pdf")}
                  disabled={isExportingPdf || tableData.length === 0}
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

            <DateRangePickerFormField
              control={form.control}
              nameFrom="start_date"
              nameTo="end_date"
              label="Rango de Fechas"
              placeholder="Seleccionar rango"
            />
          </GroupFormSection>

          {rawData && (
            <GroupFormSection
              title="Resumen de Comisiones"
              icon={ArrowUpDown}
              cols={{ sm: 1, md: 5 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Ventas</p>
                <p className="text-2xl font-bold">
                  {rawData.summary.total_sales}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monto Total</p>
                <p className="text-2xl font-bold">
                  {rawData.summary.total_amount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Costo Total</p>
                <p className="text-2xl font-bold">
                  {rawData.summary.total_cost}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Utilidad Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {rawData.summary.total_profit}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total Comisiones
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {rawData.summary.total_commissions}
                </p>
              </div>

              {rawData.by_seller.length > 0 && (
                <div className="md:col-span-5">
                  <p className="text-sm font-medium mb-2">Por Vendedor</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendedor</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right">Utilidad</TableHead>
                        <TableHead className="text-right">Comisiones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rawData.by_seller.map((s) => (
                        <TableRow key={s.seller.id}>
                          <TableCell className="font-medium">
                            {s.seller.name}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {s.total_sales}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {s.total_amount}
                          </TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            {s.total_profit}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold text-blue-600">
                            {s.total_commissions}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </GroupFormSection>
          )}

          <DataTable columns={columns} data={tableData} isLoading={isLoading} />
        </form>
      </Form>
    </PageWrapper>
  );
}
