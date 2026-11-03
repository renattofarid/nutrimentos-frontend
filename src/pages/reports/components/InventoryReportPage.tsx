import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProduct } from "@/pages/product/lib/product.hook";
import type { Option } from "@/lib/core.interface";
import { useForm } from "react-hook-form";
import { useInventoryReport } from "../lib/reports.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
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
import {
  FileSpreadsheet,
  Search,
  Filter,
  Package,
  BookOpen,
} from "lucide-react";
import { useWindowManager } from "@/stores/window-manager.store";
import {
  getKardexYearStart,
  KARDEX_REPORT_ROUTE,
} from "../lib/reports.interface";
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

// Abre el Kardex en su propia ventana, filtrado por producto + almacén y
// con el rango de fechas del año actual.
function OpenKardexButton({ item }: { item: InventoryItem }) {
  const { openTab } = useWindowManager();

  const handleOpen = () => {
    const query = new URLSearchParams({
      product_id: String(item.product_id),
      product_name: item.product_name,
      product_code: item.product_code,
      warehouse_id: String(item.warehouse_id),
      warehouse_name: item.warehouse_name,
      start_date: getKardexYearStart(),
    });
    openTab(
      `${KARDEX_REPORT_ROUTE}?${query.toString()}`,
      `Kardex ${item.product_code}`,
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      title="Ver Kardex"
      onClick={handleOpen}
    >
      <BookOpen className="h-4 w-4" />
    </Button>
  );
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
    accessorKey: "weight_per_sack",
    header: "Peso x Saco (kg)",
    size: 110,
    cell: ({ row }) => (
      <span className="text-sm">
        {Number(row.original.weight_per_sack ?? 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "stock_sacks",
    header: "Sacos",
    size: 90,
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {row.original.stock_sacks ?? 0}
      </span>
    ),
  },
  {
    accessorKey: "stock_kg",
    header: "Kg sueltos",
    size: 100,
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {Number(row.original.stock_kg ?? 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "stock_tn",
    header: "Toneladas",
    size: 100,
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {Number(row.original.stock_tn ?? 0).toFixed(3)}
      </span>
    ),
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
  {
    accessorKey: "current_stock",
    header: "Stock Actual (kg)",
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
          {stock} kg
        </span>
      );
    },
  },
  {
    id: "kardex",
    header: "Kardex",
    size: 80,
    cell: ({ row }) => <OpenKardexButton item={row.original} />,
  },
];

export default function InventoryReportPage() {
  const { can } = usePermission();
  const [isExporting, setIsExporting] = useState(false);

  const { data: rawData, isLoading, fetch } = useInventoryReport();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  // Búsqueda por código: Enter/Tab consulta la API y selecciona el producto con código exacto
  const [productCodeInput, setProductCodeInput] = useState("");
  const [codeToSearch, setCodeToSearch] = useState<string | null>(null);
  const [externalProductOption, setExternalProductOption] =
    useState<Option | null>(null);

  const { data: productByCode, isFetching: isSearchingByCode } = useProduct(
    codeToSearch ? { codigo: codeToSearch, per_page: 50 } : undefined,
  );

  useEffect(() => {
    if (!codeToSearch || isSearchingByCode) return;
    // La API devuelve códigos parecidos: se toma solo el que coincide exacto
    const wanted = codeToSearch.trim().toLowerCase();
    const product = productByCode?.data?.find(
      (p) => p.codigo.trim().toLowerCase() === wanted,
    );
    if (product) {
      setExternalProductOption({
        value: String(product.id),
        label: product.name,
        description: product.codigo,
      });
      // Producto encontrado: se dispara la búsqueda del inventario
      const warehouseId = form.getValues("warehouse_id");
      if (requireWarehouse(warehouseId)) {
        setAppliedFilters({
          product_id: product.id,
          warehouse_id: Number(warehouseId),
        });
        setPage(1);
      }
    } else {
      errorToast(`No se encontró producto con código "${codeToSearch}"`);
    }
    setCodeToSearch(null);
  }, [productByCode, isSearchingByCode, codeToSearch]);

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

  // Almacén por defecto: Chosica
  const { data: allWarehouses } = useAllWarehouses();
  const [defaultWarehouseOption, setDefaultWarehouseOption] =
    useState<Option | null>(null);
  useEffect(() => {
    if (defaultWarehouseOption || form.getValues("warehouse_id")) return;
    const chosica = allWarehouses?.find((w) =>
      w.name.toLowerCase().includes("chosica"),
    );
    if (chosica) {
      setDefaultWarehouseOption({
        value: String(chosica.id),
        label: chosica.name,
      });
    }
  }, [allWarehouses]);

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
              externalOption={defaultWarehouseOption}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
              onValueChange={(value) => {
                if (value) form.clearErrors("warehouse_id");
              }}
            />
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm font-bold uppercase leading-none">
                Código
              </Label>
              <div className="relative">
                <Input
                  value={productCodeInput}
                  onChange={(e) => setProductCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Tab") {
                      if (productCodeInput.trim()) {
                        e.preventDefault();
                        setCodeToSearch(productCodeInput.trim());
                      }
                    }
                  }}
                  placeholder="Ej: 60"
                  className="h-8 text-sm pr-7"
                  autoComplete="off"
                />
                {isSearchingByCode && (
                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
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
              externalOption={externalProductOption}
              onValueChange={(value) => {
                if (!value) {
                  setProductCodeInput("");
                  setExternalProductOption(null);
                }
              }}
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

          <DataTable
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            initialColumnVisibility={{ min_stock: false }}
          />

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
