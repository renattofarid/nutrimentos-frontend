"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import type {
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import DataTableColumnFilter from "./DataTableColumnFilter";
import FormSkeleton from "./FormSkeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children?: React.ReactNode;
  isLoading?: boolean;
  initialColumnVisibility?: VisibilityState;
  isVisibleColumnFilter?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  children,
  isLoading = false,
  initialColumnVisibility,
  isVisibleColumnFilter = true,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {}
  );

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    state: {
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="flex flex-col gap-2 w-full items-end">
      <div className="grid md:flex md:flex-wrap gap-2 md:justify-between w-full">
        {children}
        {isVisibleColumnFilter && <DataTableColumnFilter table={table} />}
      </div>

      {/* Vista de Tabla para pantallas grandes */}
      <div className="hidden md:block overflow-hidden rounded-2xl border shadow-xs w-full">
        <div className="overflow-x-auto w-full">
          <Table className="text-xs md:text-sm">
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="text-nowrap h-10">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-10">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
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
                          cell.getContext()
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
        ) : data.length ? (
          table.getRowModel().rows.map((row) => (
            <Card key={row.id} className="overflow-hidden py-0">
              <CardContent className="p-4">
                <div className="space-y-1.5">
                  {row.getVisibleCells().map((cell) => {
                    const header = cell.column.columnDef.header;
                    const headerText =
                      typeof header === "string"
                        ? header
                        : typeof header === "function"
                        ? cell.column.id
                        : cell.column.id;

                    return (
                      <div key={cell.id} className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {headerText}
                        </span>
                        <div className="text-sm break-words">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
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
