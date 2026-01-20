"use client";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import DataTableColumnFilter from "./DataTableColumnFilter";
import FormSkeleton from "./FormSkeleton";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const dataTableVariants = cva("hidden md:block w-full", {
  variants: {
    variant: {
      default: "overflow-hidden rounded-2xl border shadow-xs",
      simple: "",
      outline: "border rounded-lg",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const headerVariants = cva("sticky top-0 z-10", {
  variants: {
    variant: {
      default: "bg-muted",
      simple: "",
      outline: "bg-muted/50",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const mobileCardVariants = cva("overflow-hidden transition-colors pb-0", {
  variants: {
    variant: {
      default: "border-primary/10 hover:border-primary/30 border shadow-sm",
      simple: "border-transparent",
      outline: "border hover:border-primary/30",
      ghost: "border-transparent hover:bg-muted/50 shadow-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const mobileCardFooterVariants = cva(
  "border-t px-3 py-1 flex justify-end gap-2 [.border-t]:pt-1",
  {
    variants: {
      variant: {
        default: "bg-muted/60 border-primary/10",
        simple: "bg-transparent border-transparent",
        outline: "bg-muted/30 border-muted",
        ghost: "bg-muted border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface DataTableProps<TData, TValue> extends VariantProps<
  typeof dataTableVariants
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children?: React.ReactNode;
  isLoading?: boolean;
  initialColumnVisibility?: VisibilityState;
  isVisibleColumnFilter?: boolean;
  mobileCardRender?: (row: TData, index: number) => React.ReactNode;
  className?: string;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean;
  getRowId?: (originalRow: TData, index: number) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  children,
  isLoading = false,
  initialColumnVisibility,
  isVisibleColumnFilter = true,
  mobileCardRender,
  className,
  variant,
  sorting,
  onSortingChange,
  manualSorting = false,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection = false,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );
  const [internalRowSelection, setInternalRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualSorting,
    enableSorting: true,
    enableSortingRemoval: true,
    enableMultiSort: false,
    enableRowSelection,
    getRowId,
    state: {
      columnFilters,
      columnVisibility,
      ...(rowSelection !== undefined && { rowSelection }),
      ...(rowSelection === undefined && { rowSelection: internalRowSelection }),
      ...(sorting !== undefined && { sorting }),
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    ...(onRowSelectionChange && { onRowSelectionChange }),
    ...(onRowSelectionChange === undefined && { onRowSelectionChange: setInternalRowSelection }),
    ...(onSortingChange && { onSortingChange }),
  });

  return (
    <div
      className={cn(
        "flex flex-col w-full items-end",
        isVisibleColumnFilter ? "gap-2" : "",
      )}
    >
      <div className="grid md:flex md:flex-wrap gap-2 md:justify-between w-full">
        {children}
        {isVisibleColumnFilter && !mobileCardRender && (
          <DataTableColumnFilter table={table} />
        )}
      </div>

      {/* Vista de Tabla para pantallas grandes */}
      <div className={cn(dataTableVariants({ variant }), className)}>
        <div className="overflow-x-auto w-full">
          <Table className="text-xs md:text-sm">
            <TableHeader className={cn(headerVariants({ variant }))}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="text-nowrap h-10">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-10">
                        {header.isPlaceholder ? null : header.column.columnDef
                            .enableSorting ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </span>
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="ml-2 h-4 w-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="ml-2 h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <FormSkeleton />
                  </TableCell>
                </TableRow>
              ) : data.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="text-nowrap hover:bg-muted bg-background"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-2 truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No se encontraron registros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Vista de Cards para móviles */}
      <div className="md:hidden w-full space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <FormSkeleton />
            </CardContent>
          </Card>
        ) : mobileCardRender ? (
          // Renderizado personalizado de cards
          table
            .getRowModel()
            .rows.map((row, index) => (
              <div key={row.id}>{mobileCardRender(row.original, index)}</div>
            ))
        ) : data.length ? (
          // Renderizado por defecto
          table.getRowModel().rows.map((row) => {
            // Separar las celdas de acciones del resto
            const cells = row.getVisibleCells();
            const actionCell = cells.find(
              (cell) =>
                cell.column.id.toLowerCase().includes("accion") ||
                cell.column.id.toLowerCase().includes("action"),
            );
            const contentCells = cells.filter(
              (cell) =>
                !cell.column.id.toLowerCase().includes("accion") &&
                !cell.column.id.toLowerCase().includes("action"),
            );

            return (
              <Card
                key={row.id}
                className={cn(mobileCardVariants({ variant }))}
              >
                <CardContent className="px-4">
                  <div className="grid grid-cols-1 gap-2">
                    {contentCells.map((cell) => {
                      const header = cell.column.columnDef.header;
                      const headerText =
                        typeof header === "string"
                          ? header
                          : typeof header === "function"
                            ? cell.column.id
                            : cell.column.id;

                      return (
                        <div
                          key={cell.id}
                          className="grid grid-cols-3 items-center gap-1 text-wrap"
                        >
                          <span className="text-xs font-medium text-primary">
                            {headerText}
                          </span>
                          <div className="text-xs text-foreground col-span-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                {actionCell && (
                  <CardFooter
                    className={cn(mobileCardFooterVariants({ variant }))}
                  >
                    {flexRender(
                      actionCell.column.columnDef.cell,
                      actionCell.getContext(),
                    )}
                  </CardFooter>
                )}
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No se encontraron registros.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
