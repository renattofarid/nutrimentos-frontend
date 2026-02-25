import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useSaleBySellerReport,
  useWarehouseAsyncSearch,
  useUserAsyncSearch,
} from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  SaleBySellerReportParams,
  SaleWorkerReportResource,
} from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import type { BadgeColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GeneralModal } from "@/components/GeneralModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSpreadsheet, Search, Filter, ArrowUpDown, Package } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportSaleBySellerReport } from "../lib/reports.actions";
import { toast } from "sonner";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { useSidebar } from "@/components/ui/sidebar";

interface FilterFormValues {
  document_type: string;
  status: string;
  user_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
}

type Product = SaleWorkerReportResource["products"][number];

function ProductsModal({
  products,
  open,
  onClose,
}: {
  products: Product[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={`Detalle de Productos (${products.length})`}
      icon="Package"
      size="xl"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium truncate">{p.name}</TableCell>
              <TableCell className="text-right font-mono">
                {p.quantity ?? "—"}
              </TableCell>
              <TableCell className="text-right font-mono">{p.price}</TableCell>
              <TableCell className="text-right font-mono">{p.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GeneralModal>
  );
}

function ProductsCell({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Package className="mr-1 h-3 w-3" />
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </Button>
      <ProductsModal
        products={products}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const statusColor = (status: string): BadgeColor => {
  const s = status?.toUpperCase();
  if (s === "PAGADO" || s === "COMPLETADO") return "green";
  if (s === "PENDIENTE") return "yellow";
  if (s === "ANULADO") return "destructive";
  return "muted";
};

const columns: ColumnDef<SaleWorkerReportResource>[] = [
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
    accessorKey: "products",
    header: "Productos",
    size: 200,
    cell: ({ row }) => <ProductsCell products={row.original.products} />,
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
    cell: ({ row }) => {
      const val = row.original.cost_total;
      return <span className="font-mono text-sm">{val ?? "—"}</span>;
    },
  },
  {
    accessorKey: "profit",
    header: "Ganancia",
    size: 100,
    cell: ({ row }) => {
      const val = row.original.profit;
      if (!val || val === 0)
        return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <span className="font-semibold text-green-600 font-mono">{val}</span>
      );
    },
  },
  {
    accessorKey: "margin",
    header: "Margen %",
    size: 100,
    cell: ({ row }) => {
      const val = row.original.margin;
      return (
        <span className="font-mono text-sm">
          {val != null ? `${val}%` : "—"}
        </span>
      );
    },
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

export default function SaleBySellerReportPage() {
  const [isExporting, setIsExporting] = useState(false);

  const { setOpen, setOpenMobile } = useSidebar();
  const { data: rawData, isLoading, fetch } = useSaleBySellerReport();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const form = useForm<FilterFormValues>({
    defaultValues: {
      document_type: "",
      status: "",
      user_id: "",
      warehouse_id: "",
      start_date: "",
      end_date: "",
    },
  });

  const buildParams = (values: FilterFormValues): SaleBySellerReportParams => ({
    document_type: values.document_type || undefined,
    status: values.status || null,
    user_id: values.user_id ? Number(values.user_id) : null,
    warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
  });

  const handleSearch = (values: FilterFormValues) => {
    fetch(buildParams(values));
  };

  const handleExport = async () => {
    const values = form.getValues();
    setIsExporting(true);
    try {
      const params: SaleBySellerReportParams = {
        ...buildParams(values),
        format: "excel",
      };

      const blob = await exportSaleBySellerReport(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-ventas-por-vendedor.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Reporte de Ventas por Vendedor exportado exitosamente");
    } catch (error) {
      toast.error("Error al exportar el reporte de Ventas por Vendedor");
    } finally {
      setIsExporting(false);
    }
  };

  const tableData = rawData?.data ?? [];

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Reporte de Ventas por Vendedor"
        subtitle="Consulta las ventas por vendedor y producto"
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
                  onClick={handleExport}
                  disabled={isExporting || tableData.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
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
              name="status"
              label="Estado"
              placeholder="Todos"
              options={[
                { label: "Registrada", value: "REGISTRADA" },
                { label: "Parcial", value: "PARCIAL" },
                { label: "Pagada", value: "PAGADA" },
                { label: "Anulada", value: "ANULADA" },
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
              title="Resumen de Ventas"
              icon={ArrowUpDown}
              cols={{ sm: 1, md: 4 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Ventas</p>
                <p className="text-2xl font-bold">
                  {rawData.summary.total_sales}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Costo Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {rawData.summary.total_cost}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ganancia Total</p>
                <p className="text-2xl font-bold text-red-600">
                  {rawData.summary.total_profit}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monto Total</p>
                <p className="text-2xl font-bold text-red-600">
                  {rawData.summary.total_amount}
                </p>
              </div>
            </GroupFormSection>
          )}

          <DataTable columns={columns} data={tableData} isLoading={isLoading} />
        </form>
      </Form>
    </PageWrapper>
  );
}
