import { useEffect, useState } from "react";
import { useWarehouseKardex } from "../lib/warehouse-kardex.hook";

import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { ColumnDef } from "@tanstack/react-table";
import type { WarehouseKardexResource } from "../lib/warehouse-kardex.interface";
import { Badge } from "@/components/ui/badge";
import { getDocumentTypeLabel } from "../lib/warehouse-document.constants";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import {
  DOCUMENT_TYPES,
  MOVEMENT_TYPES,
} from "../lib/warehouse-document.constants";
import { DatePickerFilter } from "@/components/DatePickerFilter";
import { format } from "date-fns";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import PageWrapper from "@/components/PageWrapper";

const kardexColumns: ColumnDef<WarehouseKardexResource>[] = [
  {
    accessorKey: "movement_date",
    header: "Fecha",
    cell: ({ row }) => (
      <span>{row.original.movement_date_formatted}</span>
    ),
  },
  {
    id: "warehouse_name",
    header: "Almacén",
    accessorFn: (row) => row.warehouse.name,
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue() as string}</Badge>
    ),
  },
  {
    id: "product_name",
    header: "Producto",
    accessorFn: (row) => row.product.name,
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const type = row.original.document_type;
      return (
        <Badge color="secondary" className="font-medium">
          {getDocumentTypeLabel(type)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "document_number",
    header: "Número",
    cell: ({ getValue }) => (
      <span className="font-semibold font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "movement_type",
    header: "Movimiento",
    cell: ({ row }) => {
      const type = row.original.movement_type;
      return (
        <Badge color={type === "INGRESO" ? "default" : "destructive"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "quantity_in",
    header: "Entrada (kg)",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0 ? (
        <span className="font-semibold text-green-600">{value}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "quantity_out",
    header: "Salida (kg)",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0 ? (
        <span className="font-semibold text-red-600">{value}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "balance_quantity",
    header: "Saldo (kg)",
    cell: ({ getValue }) => (
      <span className="font-bold">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "unit_cost_in",
    header: "Costo Unit.",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0
        ? `S/ ${Number(value).toFixed(2)}`
        : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "total_cost_in",
    header: "Total Entrada",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0 ? (
        <span className="font-semibold text-green-600">
          S/ {Number(value).toFixed(2)}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "total_cost_out",
    header: "Total Salida",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value > 0 ? (
        <span className="font-semibold text-red-600">
          S/ {Number(value).toFixed(2)}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "balance_total_cost",
    header: "Saldo Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-bold text-primary">
          S/ {Number(value).toFixed(2)}
        </span>
      );
    },
  },
  {
    id: "user_name",
    header: "Usuario",
    accessorFn: (row) => row.user.name,
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
];

export default function WarehouseKardexPage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [selectedMovementType, setSelectedMovementType] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() - 3, 1);
  });
  const [toDate, setToDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  const { data: warehouses } = useAllWarehouses();

  const params = {
    page,
    per_page,
    warehouse_id: selectedWarehouse ? Number(selectedWarehouse) : undefined,
    product_id: selectedProduct ? Number(selectedProduct) : undefined,
    document_type: selectedDocumentType || undefined,
    movement_type: selectedMovementType || undefined,
    from: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
    to: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
  };

  const { data, meta, isLoading, refetch } = useWarehouseKardex(params);

  useEffect(() => {
    refetch(params);
  }, [
    page,
    per_page,
    selectedWarehouse,
    selectedProduct,
    selectedDocumentType,
    selectedMovementType,
    fromDate,
    toDate,
  ]);

  return (
    <PageWrapper>
      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={kardexColumns}
          data={data || []}
          isLoading={isLoading}
          initialColumnVisibility={{
            user_name: false,
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {warehouses && (
                <SearchableSelect
                  options={warehouses.map((w) => ({
                    value: w.id.toString(),
                    label: w.name,
                  }))}
                  value={selectedWarehouse}
                  onChange={setSelectedWarehouse}
                  placeholder="Todos los almacenes"
                />
              )}

              <SearchableSelectAsync
                useQueryHook={useProduct}
                mapOptionFn={(product: ProductResource) => ({
                  value: product.id.toString(),
                  label: product.name,
                })}
                value={selectedProduct}
                onChange={setSelectedProduct}
                placeholder="Todos los productos"
              />

              <SearchableSelect
                options={DOCUMENT_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
                value={selectedDocumentType}
                onChange={setSelectedDocumentType}
                placeholder="Todos los tipos"
              />

              <SearchableSelect
                options={MOVEMENT_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
                value={selectedMovementType}
                onChange={setSelectedMovementType}
                placeholder="Todos los movimientos"
              />

              <DatePickerFilter
                label="Del"
                value={fromDate}
                onChange={(d) => setFromDate(d ?? new Date())}
                placeholder="DD-MM-YYYY"
              />
              <DatePickerFilter
                label="Al"
                value={toDate}
                onChange={(d) => setToDate(d ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
                placeholder="DD-MM-YYYY"
              />
            </div>
          </div>
        </DataTable>
      </div>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />
    </PageWrapper>
  );
}
