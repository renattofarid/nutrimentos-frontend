import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { useKardexReport } from "../lib/reports.hook";
import {
  useProductAsyncSearch,
  useWarehouseAsyncSearch,
} from "../lib/reports.hook";

import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { KardexItem, KardexReportParams } from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  FileSpreadsheet,
  Filter,
  ArrowUpDown,
  Loader2,
  Search,
  PackageSearch,
} from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportKardexReport } from "../lib/reports.actions";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { format } from "date-fns";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { errorToast, successToast } from "@/lib/core.function";
import { useProduct } from "@/pages/product/lib/product.hook";
import type { Option } from "@/lib/core.interface";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { getAllWarehouses } from "@/pages/warehouse/lib/warehouse.actions";

const ROUTE = "kardex";

interface FilterFormValues {
  product_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
}

const columns: ColumnDef<KardexItem>[] = [
  {
    id: "info",
    header: "Información",
    columns: [
      {
        accessorKey: "warehouse_name",
        header: "Almacén",
        size: 150,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.warehouse.name}</span>
        ),
      },
      {
        accessorKey: "movement_date_formatted",
        header: "Fecha",
        size: 110,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.movement_date_formatted}
          </span>
        ),
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
          <span className="text-sm font-semibold">
            {row.original.document_number}
          </span>
        ),
      },
      {
        accessorKey: "movement_type",
        header: "Tipo Movimiento",
        size: 140,
        cell: ({ row }) => {
          const type = row.original.movement_type;
          const isEntry = type === "ENTRADA" || type === "INGRESO";
          const isExit = type === "SALIDA" || type === "EGRESO";
          const isAdjust = type === "AJUSTE" || type === "ADJUST";

          if (isAdjust) {
            return (
              <Badge color="secondary" className="bg-blue-100 text-blue-700">
                {type}
              </Badge>
            );
          }

          return (
            <Badge color={isEntry ? "green" : isExit ? "red" : "gray"}>
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "customer_name",
        header: "Cliente",
        size: 180,
        cell: ({ row }) => {
          const sale = row.original.sale;
          if (sale?.customer) {
            const c = sale.customer;
            const name =
              c.type_person === "JURIDICA"
                ? (c.business_name ?? c.commercial_name ?? "—")
                : [c.names, c.father_surname, c.mother_surname]
                    .filter(Boolean)
                    .join(" ") || "—";
            return <span className="text-sm">{name}</span>;
          }
          return <span className="text-sm text-muted-foreground">-</span>;
        },
      },
      {
        accessorKey: "product_codigo",
        header: "Código",
        size: 100,
        cell: ({ row }) => (
          <p className="font-bold">{row.original.product.codigo}</p>
        ),
      },
      {
        accessorKey: "product_name",
        header: "Producto",
        size: 220,
        cell: ({ row }) => (
          <p className="font-medium text-sm">{row.original.product.name}</p>
        ),
      },
    ],
  },
  {
    id: "entradas",
    header: "Entradas",
    columns: [
      {
        accessorKey: "quantity_in",
        header: "Und.",
        size: 100,
        cell: ({ row }) => {
          const qty = row.original.quantity_in;
          if (!qty || qty === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return (
            <span className="font-semibold text-green-600">
              +{qty} {row.original.product.unit.name}
            </span>
          );
        },
      },
      {
        accessorKey: "quantity_sacks_in",
        header: "Sacos",
        size: 100,
        meta: { isGroupStart: true },
        cell: ({ row }) => {
          const sacos = row.original.quantity_sacks_in;
          if (!sacos || sacos === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return (
            <span className="font-semibold text-green-600">+{sacos} sac</span>
          );
        },
      },
      {
        accessorKey: "quantity_kg_in",
        header: "Kilos",
        size: 100,
        cell: ({ row }) => {
          const kg = row.original.quantity_kg_in;
          if (!kg || kg === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return <span className="font-semibold text-green-600">+{kg} kg</span>;
        },
      },
    ],
  },
  {
    id: "salidas",
    header: "Salidas",
    columns: [
      {
        accessorKey: "quantity_out",
        header: "Und.",
        size: 100,
        cell: ({ row }) => {
          const qty = row.original.quantity_out;
          if (!qty || qty === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return (
            <span className="font-semibold text-red-600">
              -{qty} {row.original.product.unit.name}
            </span>
          );
        },
      },
      {
        accessorKey: "quantity_sacks_out",
        header: "Sacos",
        size: 100,
        meta: { isGroupStart: true },
        cell: ({ row }) => {
          const sacos = row.original.quantity_sacks_out;
          if (!sacos || sacos === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return (
            <span className="font-semibold text-red-600">-{sacos} sac</span>
          );
        },
      },
      {
        accessorKey: "quantity_kg_out",
        header: "Kilos",
        size: 100,
        cell: ({ row }) => {
          const kg = row.original.quantity_kg_out;
          if (!kg || kg === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return <span className="font-semibold text-red-600">-{kg} kg</span>;
        },
      },
    ],
  },
  {
    id: "saldo",
    header: "Saldo",
    columns: [
      {
        accessorKey: "balance_quantity",
        header: "Und.",
        size: 100,
        cell: ({ row }) => {
          const qty = row.original.quantity_out;
          if (!qty || qty === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return (
            <span className="font-semibold text-slate-600">
              {qty} {row.original.product.unit.name}{" "}
              {row.original.product.unit.name}
            </span>
          );
        },
      },
      {
        accessorKey: "balance_sacks",
        header: "Sacos",
        size: 100,
        meta: { isGroupStart: true },
        cell: ({ row }) => {
          const sacos = row.original.balance_sacks;
          if (!sacos || sacos === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return (
            <span className="font-semibold text-slate-600">{sacos} sac</span>
          );
        },
      },
      {
        accessorKey: "balance_kg",
        header: "Kilos",
        size: 100,
        cell: ({ row }) => {
          const kg = row.original.balance_kg;
          if (!kg || kg === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return <span className="font-semibold text-slate-600">{kg} kg</span>;
        },
      },
    ],
  },
  {
    id: "costs",
    header: "Costos",
    columns: [
      {
        accessorKey: "unit_cost",
        header: "Costo Unit.",
        size: 120,
        meta: { isGroupStart: true },
        cell: ({ row }) => {
          const cost = row.original.balance_unit_cost;
          if (!cost || cost === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return (
            <span className="font-semibold text-slate-600">
              S/. {cost.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: "balance_total_cost",
        header: "Costo Total",
        size: 120,
        cell: ({ row }) => {
          const cost = row.original.balance_total_cost;
          if (!cost || cost === 0)
            return <span className="text-muted-foreground text-sm">0</span>;
          return (
            <span className="font-semibold text-slate-600">
              S/. {cost.toFixed(2)}
            </span>
          );
        },
      },
    ],
  },
];

export default function KardexReportPage() {
  const { can } = usePermission();
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);

  const { data: rawData, isLoading, fetch } = useKardexReport();

  const [productCodeInput, setProductCodeInput] = useState("");
  const [codeToSearch, setCodeToSearch] = useState<string | null>(null);
  // Filtros precargados cuando se abre desde Inventario (botón "Ver Kardex")
  const [searchParams] = useSearchParams();
  const presetProductId = searchParams.get("product_id") ?? "";
  const presetWarehouseId = searchParams.get("warehouse_id") ?? "";
  const presetWarehouseOption: Option | undefined = presetWarehouseId
    ? {
        value: presetWarehouseId,
        label: searchParams.get("warehouse_name") ?? presetWarehouseId,
      }
    : undefined;
  const [externalProductOption, setExternalProductOption] =
    useState<Option | null>(
      presetProductId
        ? {
            value: presetProductId,
            label: searchParams.get("product_name") ?? presetProductId,
            description: searchParams.get("product_code") ?? undefined,
          }
        : null,
    );

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
      form.setValue("product_id", String(product.id));
      setPage(1);
      setAppliedFilters({
        ...form.getValues(),
        product_id: String(product.id),
      });
    } else {
      errorToast(`No se encontró producto con código "${codeToSearch}"`);
    }
    setCodeToSearch(null);
  }, [productByCode, isSearchingByCode, codeToSearch]);

  const _today = new Date();
  const _todayStr = format(_today, "yyyy-MM-dd");
  const _defaultStartStr = format(
    new Date(_today.getFullYear(), _today.getMonth(), _today.getDate()),
    "yyyy-MM-dd",
  );

  const form = useForm<FilterFormValues>({
    defaultValues: {
      product_id: presetProductId,
      warehouse_id: presetWarehouseId,
      start_date: searchParams.get("start_date") || _defaultStartStr,
      end_date: _todayStr,
    },
  });

  // Filtros aplicados: solo cambian al pulsar "Buscar" (o al abrir desde Inventario)
  const [appliedFilters, setAppliedFilters] = useState<FilterFormValues | null>(
    presetProductId ? form.getValues() : null,
  );
  const [externalWarehouseOption, setExternalWarehouseOption] =
    useState<Option | null>(null);

  // CHOSICA seleccionado por defecto (se puede cambiar manualmente)
  useEffect(() => {
    if (presetWarehouseId) return;
    let cancelled = false;
    getAllWarehouses()
      .then((list) => {
        const chosica = list.find((w) =>
          w.name.trim().toLowerCase().includes("chosica"),
        );
        if (!chosica || cancelled || form.getValues("warehouse_id")) return;
        setExternalWarehouseOption({
          value: String(chosica.id),
          label: chosica.name,
        });
        form.setValue("warehouse_id", String(chosica.id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = () => {
    setPage(1);
    setAppliedFilters({ ...form.getValues() });
  };

  useEffect(() => {
    if (!appliedFilters) return;
    const params: KardexReportParams = {
      product_id: appliedFilters.product_id
        ? Number(appliedFilters.product_id)
        : null,
      warehouse_id: appliedFilters.warehouse_id
        ? Number(appliedFilters.warehouse_id)
        : null,
      start_date: appliedFilters.start_date || null,
      end_date: appliedFilters.end_date || null,
      page,
      per_page,
    };
    fetch(params);
  }, [page, per_page, appliedFilters]);

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

      successToast("Reporte de Kardex exportado exitosamente");
    } catch {
      errorToast("Error al exportar el reporte de Kardex");
    } finally {
      setIsExporting(false);
    }
  };

  const tableData = rawData?.data ?? [];

  const meta = rawData?.meta;
  const totalMovements = meta?.total ?? tableData.length;
  const totalEntries = tableData.filter(
    (i) => i.movement_type === "ENTRADA" || i.movement_type === "IN",
  ).length;
  const totalExits = tableData.filter(
    (i) => i.movement_type === "SALIDA" || i.movement_type === "OUT",
  ).length;

  return (
    <PageWrapper size="3xl">
      <Form {...form}>
        <form className="space-y-6 grid lg:grid-cols-3 gap-x-4">
          <GroupFormSection
            title="Filtros de Búsqueda"
            icon={Filter}
            gap="gap-2"
            className="lg:col-span-2"
            cols={{ sm: 1, md: 2, lg: 3 }}
          >
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
                      e.preventDefault();
                      if (productCodeInput.trim()) {
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

            <FormSelectAsync
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Buscar almacén..."
              defaultOption={presetWarehouseOption}
              externalOption={externalWarehouseOption}
              useQueryHook={useWarehouseAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
            />

            <DatePickerFormField
              control={form.control}
              name="start_date"
              label="Del"
            />
            <DatePickerFormField
              control={form.control}
              name="end_date"
              label="Al"
            />
            <div className="flex h-full items-end gap-2">
              <Button type="button" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              {can(ROUTE, ACTIONS.EXPORTAR) && (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleExport}
                  color="green"
                  disabled={isExporting || tableData.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              )}
            </div>
          </GroupFormSection>

          {rawData && (
            <GroupFormSection
              title="Resumen de Movimientos"
              icon={ArrowUpDown}
              cols={{ sm: 1, md: 3 }}
            >
              <div className="space-y-1">
                <p className="text-xs text-center text-muted-foreground">
                  Total Movimientos
                </p>
                <p className="text-xl text-center font-bold">
                  {totalMovements}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-center text-muted-foreground">
                  Entradas
                </p>
                <p className="text-xl text-center font-bold text-green-600">
                  {totalEntries}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-center text-muted-foreground">
                  Salidas
                </p>
                <p className="text-xl text-center font-bold text-red-600">
                  {totalExits}
                </p>
              </div>
            </GroupFormSection>
          )}

          <div className="col-span-full">
            {appliedFilters && !isLoading && tableData.length === 0 ? (
              <EmptyState
                className="w-full col-span-full"
                icon={PackageSearch}
                title="Sin movimientos"
                description="No se encontraron movimientos de Kardex con los filtros seleccionados."
              />
            ) : (
              <DataTable
                key={appliedFilters?.product_id ? "filtered" : "all"}
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                initialColumnVisibility={{
                  product_codigo: !appliedFilters?.product_id,
                  product_name: !appliedFilters?.product_id,
                  document_type: false,
                  quantity_in: false,
                  quantity_out: false,
                  balance_quantity: false,
                }}
              />
            )}
            <DataTablePagination
              page={page}
              totalPages={meta?.last_page || 1}
              onPageChange={setPage}
              per_page={per_page}
              setPerPage={setPerPage}
              totalData={meta?.total || 0}
            />
          </div>
        </form>
      </Form>
    </PageWrapper>
  );
}
