import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useKardexReport } from "../lib/reports.hook";
import {
  useProductAsyncSearch,
  useWarehouseAsyncSearch,
} from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { KardexItem, KardexReportParams } from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FileSpreadsheet, Search, Filter, ArrowUpDown } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportKardexReport } from "../lib/reports.actions";
import { toast } from "sonner";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { useSidebar } from "@/components/ui/sidebar";

interface FilterFormValues {
  product_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
}

const columns: ColumnDef<KardexItem>[] = [
  {
    accessorKey: "movement_date_formatted",
    header: "Fecha",
    size: 110,
    cell: ({ row }) => (
      <span className="text-sm font-mono">
        {row.original.movement_date_formatted}
      </span>
    ),
  },
  {
    accessorKey: "movement_type",
    header: "Tipo Movimiento",
    size: 140,
    cell: ({ row }) => {
      const type = row.original.movement_type;
      const isEntry = type === "ENTRADA" || type === "IN";
      const isAdjust = type === "AJUSTE" || type === "ADJUST";

      if (isAdjust) {
        return (
          <Badge color="secondary" className="bg-blue-100 text-blue-700">
            {type}
          </Badge>
        );
      }

      return (
        <Badge
          color={isEntry ? "default" : "destructive"}
          className={isEntry ? "bg-green-600" : ""}
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "document_type",
    header: "Tipo Doc.",
    size: 110,
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.document_type}</Badge>
    ),
  },
  {
    accessorKey: "document_number",
    header: "Nro. Documento",
    size: 150,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.document_number}
      </span>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    size: 220,
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.original.product.name}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {row.original.product.code}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    size: 150,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.warehouse.name}</span>
    ),
  },
  {
    accessorKey: "quantity_in",
    header: "Entrada",
    size: 100,
    cell: ({ row }) => {
      const qty = row.original.quantity_in;
      if (!qty || qty === 0)
        return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <span className="font-semibold text-green-600">
          +{qty} {row.original.product.unit.name}
        </span>
      );
    },
  },
  {
    accessorKey: "quantity_out",
    header: "Salida",
    size: 100,
    cell: ({ row }) => {
      const qty = row.original.quantity_out;
      if (!qty || qty === 0)
        return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <span className="font-semibold text-red-600">
          -{qty} {row.original.product.unit.name}
        </span>
      );
    },
  },
  {
    accessorKey: "balance_quantity",
    header: "Saldo",
    size: 100,
    cell: ({ row }) => (
      <span className="font-bold text-base">
        {row.original.balance_quantity} {row.original.product.unit.name}
      </span>
    ),
  },
];

export default function KardexReportPage() {
  const [isExporting, setIsExporting] = useState(false);

  const { setOpen, setOpenMobile } = useSidebar();
  const { data: rawData, isLoading, fetch } = useKardexReport();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const form = useForm<FilterFormValues>({
    defaultValues: {
      product_id: "",
      warehouse_id: "",
      start_date: "",
      end_date: "",
    },
  });

  const handleSearch = (values: FilterFormValues) => {
    const params: KardexReportParams = {
      product_id: values.product_id ? Number(values.product_id) : null,
      warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
    };
    fetch(params);
  };

  const handleExport = async () => {
    const values = form.getValues();
    setIsExporting(true);
    try {
      const params: KardexReportParams = {
        product_id: values.product_id ? Number(values.product_id) : null,
        warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
      };

      const blob = await exportKardexReport(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-kardex.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Reporte de Kardex exportado exitosamente");
    } catch {
      toast.error("Error al exportar el reporte de Kardex");
    } finally {
      setIsExporting(false);
    }
  };

  const tableData = rawData?.data ?? [];

  const totalMovements = tableData.length;
  const totalEntries = tableData.filter(
    (i) => i.movement_type === "ENTRADA" || i.movement_type === "IN",
  ).length;
  const totalExits = tableData.filter(
    (i) => i.movement_type === "SALIDA" || i.movement_type === "OUT",
  ).length;

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Reporte de Kardex"
        subtitle="Consulta los movimientos de inventario por producto y almacén"
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
                  onClick={handleExport}
                  disabled={isExporting || tableData.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            }
          >
            <FormSelectAsync
              control={form.control}
              name="product_id"
              label="Producto"
              placeholder="Buscar producto..."
              useQueryHook={useProductAsyncSearch}
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
              title="Resumen de Movimientos"
              icon={ArrowUpDown}
              cols={{ sm: 1, md: 3 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total Movimientos
                </p>
                <p className="text-2xl font-bold">{totalMovements}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalEntries}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Salidas</p>
                <p className="text-2xl font-bold text-red-600">{totalExits}</p>
              </div>
            </GroupFormSection>
          )}

          <DataTable columns={columns} data={tableData} isLoading={isLoading} />
        </form>
      </Form>
    </PageWrapper>
  );
}
