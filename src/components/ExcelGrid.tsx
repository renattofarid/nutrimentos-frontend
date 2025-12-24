"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExcelGridColumn<T> {
  id: string;
  header: string;
  type: "product-search" | "text" | "number" | "readonly";
  width?: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  onCellChange?: (index: number, value: string) => void;
}

export interface ProductOption {
  id: string;
  codigo: string;
  name: string;
}

interface ExcelGridProps<T> {
  columns: ExcelGridColumn<T>[];
  data: T[];
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onCellChange: (index: number, field: string, value: string) => void;
  productOptions?: ProductOption[];
  onProductSelect?: (index: number, product: ProductOption) => void;
  className?: string;
  emptyMessage?: string;
}

export function ExcelGrid<T extends Record<string, any>>({
  columns,
  data,
  onAddRow,
  onRemoveRow,
  onCellChange,
  productOptions = [],
  onProductSelect,
  className,
  emptyMessage = "No hay datos. Agregue una nueva fila para comenzar.",
}: ExcelGridProps<T>) {
  const [_focusedCell, setFocusedCell] = React.useState<{
    row: number;
    col: number;
  } | null>(null);
  const [openPopover, setOpenPopover] = React.useState<number | null>(null);
  const [searchValues, setSearchValues] = React.useState<Record<number, string>>({});
  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // Función para obtener la siguiente celda editable
  const getNextEditableCell = (currentRow: number, currentCol: number): { row: number; col: number } | null => {
    // Buscar en la misma fila
    for (let col = currentCol + 1; col < columns.length; col++) {
      if (columns[col].type !== "readonly") {
        return { row: currentRow, col };
      }
    }

    // Si llegamos al final de la fila, ir a la siguiente
    if (currentRow < data.length - 1) {
      for (let col = 0; col < columns.length; col++) {
        if (columns[col].type !== "readonly") {
          return { row: currentRow + 1, col };
        }
      }
    }

    return null;
  };

  const getPreviousEditableCell = (currentRow: number, currentCol: number): { row: number; col: number } | null => {
    // Buscar en la misma fila
    for (let col = currentCol - 1; col >= 0; col--) {
      if (columns[col].type !== "readonly") {
        return { row: currentRow, col };
      }
    }

    // Si llegamos al inicio de la fila, ir a la anterior
    if (currentRow > 0) {
      for (let col = columns.length - 1; col >= 0; col--) {
        if (columns[col].type !== "readonly") {
          return { row: currentRow - 1, col };
        }
      }
    }

    return null;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const nextCell = e.shiftKey
        ? getPreviousEditableCell(rowIndex, colIndex)
        : getNextEditableCell(rowIndex, colIndex);

      if (nextCell) {
        setFocusedCell(nextCell);
        setTimeout(() => {
          const key = `${nextCell.row}-${nextCell.col}`;
          inputRefs.current[key]?.focus();
        }, 0);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      // Si estamos en la última fila, agregar una nueva
      if (rowIndex === data.length - 1) {
        onAddRow();
        setTimeout(() => {
          // Enfocar la primera celda editable de la nueva fila
          const firstEditableCol = columns.findIndex(col => col.type !== "readonly");
          if (firstEditableCol !== -1) {
            const key = `${data.length}-${firstEditableCol}`;
            inputRefs.current[key]?.focus();
            setFocusedCell({ row: data.length, col: firstEditableCol });
          }
        }, 50);
      } else {
        // Ir a la misma columna en la siguiente fila
        const nextRow = rowIndex + 1;
        setFocusedCell({ row: nextRow, col: colIndex });
        setTimeout(() => {
          const key = `${nextRow}-${colIndex}`;
          inputRefs.current[key]?.focus();
        }, 0);
      }
    }
  };

  const handleProductSearch = (rowIndex: number, searchTerm: string) => {
    setSearchValues(prev => ({ ...prev, [rowIndex]: searchTerm }));
  };

  const handleProductSelect = (rowIndex: number, product: ProductOption) => {
    if (onProductSelect) {
      onProductSelect(rowIndex, product);
    }
    setOpenPopover(null);
    setSearchValues(prev => ({ ...prev, [rowIndex]: "" }));

    // Mover al siguiente campo después de seleccionar
    const colIndex = columns.findIndex(col => col.type === "product-search");
    const nextCell = getNextEditableCell(rowIndex, colIndex);
    if (nextCell) {
      setTimeout(() => {
        const key = `${nextCell.row}-${nextCell.col}`;
        inputRefs.current[key]?.focus();
        setFocusedCell(nextCell);
      }, 0);
    }
  };

  const getFilteredProducts = (rowIndex: number) => {
    const searchValue = searchValues[rowIndex]?.toLowerCase() || "";
    if (!searchValue) return productOptions;

    return productOptions.filter(
      (product) =>
        product.codigo.toLowerCase().includes(searchValue) ||
        product.name.toLowerCase().includes(searchValue)
    );
  };

  const renderCell = (row: T, rowIndex: number, column: ExcelGridColumn<T>, colIndex: number) => {
    const cellKey = `${rowIndex}-${colIndex}`;

    if (column.render) {
      return column.render(row, rowIndex);
    }

    switch (column.type) {
      case "product-search":
        return (
          <Popover
            open={openPopover === rowIndex}
            onOpenChange={(open) => setOpenPopover(open ? rowIndex : null)}
          >
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  ref={(el) => { inputRefs.current[cellKey] = el; }}
                  value={searchValues[rowIndex] || row[column.accessor as string] || ""}
                  onChange={(e) => handleProductSearch(rowIndex, e.target.value)}
                  onFocus={() => {
                    setFocusedCell({ row: rowIndex, col: colIndex });
                    setOpenPopover(rowIndex);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                  placeholder="Buscar producto..."
                  className="h-9 text-sm"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[400px]" align="start">
              <Command>
                <CommandInput
                  placeholder="Buscar por código o nombre..."
                  value={searchValues[rowIndex] || ""}
                  onValueChange={(value) => handleProductSearch(rowIndex, value)}
                />
                <CommandList className="max-h-[200px]">
                  <CommandEmpty>No se encontraron productos.</CommandEmpty>
                  {getFilteredProducts(rowIndex).map((product) => (
                    <CommandItem
                      key={product.id}
                      onSelect={() => handleProductSelect(rowIndex, product)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Código: {product.codigo}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );

      case "number":
        return (
          <Input
            ref={(el) => { inputRefs.current[cellKey] = el; }}
            type="number"
            value={row[column.accessor as string] || ""}
            onChange={(e) => column.onCellChange?.(rowIndex, e.target.value) ||
                           onCellChange(rowIndex, column.accessor as string, e.target.value)}
            onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
            className="h-9 text-sm"
            step="any"
          />
        );

      case "text":
        return (
          <Input
            ref={(el) => { inputRefs.current[cellKey] = el; }}
            type="text"
            value={row[column.accessor as string] || ""}
            onChange={(e) => column.onCellChange?.(rowIndex, e.target.value) ||
                           onCellChange(rowIndex, column.accessor as string, e.target.value)}
            onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
            className="h-9 text-sm"
          />
        );

      case "readonly":
        return (
          <div className="h-9 flex items-center px-3 text-sm text-muted-foreground">
            {row[column.accessor as string] || "-"}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onAddRow}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar línea
        </Button>
      </div>

      {/* Tabla */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  style={{ width: column.width }}
                  className="font-semibold"
                >
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="w-[50px]">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={column.id} className="p-2">
                      {renderCell(row, rowIndex, column, colIndex)}
                    </TableCell>
                  ))}
                  <TableCell className="p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRow(rowIndex)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
