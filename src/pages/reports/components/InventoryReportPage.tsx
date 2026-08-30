import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useInventoryReport } from "../lib/reports.hook";
import {
  useProductAsyncSearch,
  useWarehouseAsyncSearch,
} from "../lib/reports.hook";

import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  InventoryItem,
  InventoryReportParams,
} from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FileSpreadsheet, Search, Filter, Package } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportInventoryReport } from "../lib/reports.actions";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { errorToast, successToast } from "@/lib/core.function";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const ROUTE = "inventario";

interface FilterFormValues {
  product_id: string;
  warehouse_id: string;
}

const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "product_code",
    header: "Código",
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.product_code}
      </span>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    size: 250,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.product_name}</span>
    ),
  },
  // {
  //   accessorKey: "category_name",
  //   header: "Categoría",
  //   size: 150,
  //   cell: ({ row }) => (
  //     <Badge color="secondary">{row.original.category_name}</Badge>
  //   ),
  // },
  {
    accessorKey: "warehouse_name",
    header: "Almacén",
    size: 160,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.warehouse_name}</span>
    ),
  },
  // {
  //   accessorKey: "unit_name",
  //   header: "Unidad",
  //   size: 90,
  //   cell: ({ row }) => (
  //     <span className="text-sm text-muted-foreground">
  //       {row.original.unit_name}
  //     </span>
  //   ),
  // },
  {
    accessorKey: "current_stock",
    header: "Stock Actual",
    size: 120,
    cell: ({ row }) => {
      const stock = Number(row.original.stock);
      const min = Number(row.original.min_stock);
      const isLow = stock <= min;
      return (
        <span
          className={`font-bold text-base ${
            isLow ? "text-red-600" : "text-green-600"
          }`}
        >
          {stock}
        </span>
      );
    },
  },
  {
    accessorKey: "min_stock",
    header: "Stock Mínimo",
    size: 120,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.min_stock}
      </span>
    ),
  },
  {
    id: "status",
    header: "Estado",
    size: 110,
    cell: ({ row }) => {
      const stock = Number(row.original.stock);
      const min = Number(row.original.min_stock);

      if (stock === 0) {
        return <Badge color="destructive">Sin stock</Badge>;
      }
      if (stock <= min) {
        return (
          <Badge variant="default" className="bg-orange-500">
            Stock bajo
          </Badge>
        );
      }
      return (
        <Badge variant="default" className="bg-green-600">
          Normal
        </Badge>
      );
    },
  },
];

export default function InventoryReportPage() {
  const { can } = usePermission();
  const [isExporting, setIsExporting] = useState(false);

  const { data: rawData, isLoading, fetch } = useInventoryReport();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  // Filtros de la última búsqueda confirmada (para poder paginar sin re-enviar el form)
  const [appliedFilters, setAppliedFilters] = useState<{
    product_id: number | null;
    warehouse_id: number;
  } | null>(null);

  const form = useForm<FilterFormValues>({
    defaultValues: {
      product_id: "",
      warehouse_id: "",
    },
  });

  const requireWarehouse = (warehouseId: string) => {
    if (warehouseId) {
      form.clearErrors("warehouse_id");
      return true;
    }
    form.setError("warehouse_id", {
      type: "required",
      message: "Selecciona un almacén para generar el reporte",
    });
    errorToast("El almacén es un filtro obligatorio del reporte de inventario");
    return false;
  };

  const handleSearch = (values: FilterFormValues) => {
    if (!requireWarehouse(values.warehouse_id)) return;
    setAppliedFilters({
      product_id: values.product_id ? Number(values.product_id) : null,
      warehouse_id: Number(values.warehouse_id),
    });
    setPage(1);
  };

  // Dispara la búsqueda cuando cambian los filtros confirmados, la página o el tamaño de página
  useEffect(() => {
    if (!appliedFilters) return;
    const params: InventoryReportParams = {
      ...appliedFilters,
      page,
      per_page: perPage,
    };
    fetch(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, page, perPage]);

  const handleExport = async () => {
    const values = form.getValues();
    if (!requireWarehouse(values.warehouse_id)) return;
    setIsExporting(true);
    try {
      const params: InventoryReportParams = {
        product_id: values.product_id ? Number(values.product_id) : null,
        warehouse_id: Number(values.warehouse_id),
      };

      const blob = await exportInventoryReport(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-inventario.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      successToast("Reporte de inventario exportado exitosamente");
    } catch {
      errorToast("Error al exportar el reporte de inventario");
    } finally {
      setIsExporting(false);
    }
  };

  const tableData = rawData?.data ?? [];
  const meta = rawData?.meta;

  const totalProducts = meta?.total ?? tableData.length;
  const withStock = tableData.filter((i) => Number(i.stock) > 0).length;
  const lowStock = tableData.filter(
    (i) => Number(i.stock) > 0 && Number(i.stock) <= Number(i.min_stock),
  ).length;
  const noStock = tableData.filter((i) => Number(i.stock) === 0).length;

  return (
    <PageWrapper size="3xl">

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
                {can(ROUTE, ACTIONS.EXPORTAR) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                )}
              </div>
            }
          >
            <FormSelectAsync
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Buscar almacén..."
              required
              useQueryHook={useWarehouseAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
              onValueChange={(value) => {
                if (value) form.clearErrors("warehouse_id");
              }}
            />
            <FormSelectAsync
              control={form.control}
              name="product_id"
              label="Producto"
              placeholder="Buscar producto..."
              useQueryHook={useProductAsyncSearch}
              mapOptionFn={(item: ProductResource) => ({
                label: item.name,
                value: String(item.id),
                description: item.codigo,
              })}
            />
          </GroupFormSection>

          {rawData && (
            <GroupFormSection
              title="Resumen de Inventario"
              icon={Package}
              cols={{ sm: 1, md: 2, lg: 4 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Productos</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Con Stock (página)
                </p>
                <p className="text-2xl font-bold text-green-600">{withStock}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Stock Bajo (página)
                </p>
                <p className="text-2xl font-bold text-orange-500">{lowStock}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Sin Stock (página)
                </p>
                <p className="text-2xl font-bold text-red-600">{noStock}</p>
              </div>
            </GroupFormSection>
          )}

          <DataTable columns={columns} data={tableData} isLoading={isLoading} />

          {meta && meta.total > 0 && (
            <DataTablePagination
              page={page}
              totalPages={meta.last_page || 1}
              onPageChange={setPage}
              per_page={perPage}
              setPerPage={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              totalData={meta.total}
            />
          )}
        </form>
      </Form>
    </PageWrapper>
  );
}
