"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExcelGridColumn<T> {
  id: string;
  header: string;
  type: "product-search" | "product-code" | "text" | "number" | "readonly";
  width?: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  onCellChange?: (index: number, value: string) => void;
  hidden?: (row: T) => boolean; // Función para determinar si la columna debe ocultarse para una fila específica
  disabled?: (row: T) => boolean; // Función para determinar si el campo debe estar deshabilitado
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
  disabled?: boolean;
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
  disabled = false,
}: ExcelGridProps<T>) {
  const [focusedCell, setFocusedCell] = React.useState<{
    row: number;
    col: number;
  } | null>(null);
  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // Función para verificar si una columna está oculta para una fila específica
  const isColumnHidden = (column: ExcelGridColumn<T>, row: T): boolean => {
    return column.hidden ? column.hidden(row) : false;
  };

  // Función para obtener la siguiente celda editable
  const getNextEditableCell = (currentRow: number, currentCol: number): { row: number; col: number } | null => {
    const currentRowData = data[currentRow];

    // Buscar en la misma fila
    for (let col = currentCol + 1; col < columns.length; col++) {
      const column = columns[col];
      if (column.type !== "readonly" && !isColumnHidden(column, currentRowData)) {
        return { row: currentRow, col };
      }
    }

    // Si llegamos al final de la fila, ir a la siguiente
    if (currentRow < data.length - 1) {
      const nextRowData = data[currentRow + 1];
      for (let col = 0; col < columns.length; col++) {
        const column = columns[col];
        if (column.type !== "readonly" && !isColumnHidden(column, nextRowData)) {
          return { row: currentRow + 1, col };
        }
      }
    }

    return null;
  };

  const getPreviousEditableCell = (currentRow: number, currentCol: number): { row: number; col: number } | null => {
    const currentRowData = data[currentRow];

    // Buscar en la misma fila
    for (let col = currentCol - 1; col >= 0; col--) {
      const column = columns[col];
      if (column.type !== "readonly" && !isColumnHidden(column, currentRowData)) {
        return { row: currentRow, col };
      }
    }

    // Si llegamos al inicio de la fila, ir a la anterior
    if (currentRow > 0) {
      const prevRowData = data[currentRow - 1];
      for (let col = columns.length - 1; col >= 0; col--) {
        const column = columns[col];
        if (column.type !== "readonly" && !isColumnHidden(column, prevRowData)) {
          return { row: currentRow - 1, col };
        }
      }
    }

    return null;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    rowIndex: number,
    colIndex: number,
    column: ExcelGridColumn<T>
  ) => {
    if (e.key === "Tab") {
      e.preventDefault();

      // Si es un campo de código de producto, validar antes de avanzar
      if (column.type === "product-code") {
        const currentValue = data[rowIndex][column.accessor as string];

        if (currentValue && currentValue.trim() !== "") {
          const searchValue = currentValue.toString().toLowerCase();

          // Buscar coincidencias: exactas o parciales
          const exactMatch = productOptions.find(p =>
            p.codigo.toLowerCase() === searchValue
          );

          const partialMatches = productOptions.filter(p =>
            p.codigo.toLowerCase().includes(searchValue)
          );

          if (exactMatch) {
            // Si hay coincidencia exacta, seleccionarla
            if (onProductSelect) {
              onProductSelect(rowIndex, exactMatch);
            }
          } else if (partialMatches.length === 1) {
            // Si hay solo UNA coincidencia parcial, seleccionarla automáticamente
            if (onProductSelect) {
              onProductSelect(rowIndex, partialMatches[0]);
            }
          } else if (partialMatches.length > 1) {
            // Si hay múltiples coincidencias, mostrar error indicando que hay varias opciones
            const input = e.target as HTMLInputElement;
            input.setCustomValidity(`Se encontraron ${partialMatches.length} productos con ese código. Sea más específico.`);
            input.reportValidity();
            setTimeout(() => {
              input.setCustomValidity("");
            }, 3000);
            return; // No avanzar a la siguiente celda
          } else {
            // Si no hay ninguna coincidencia, mostrar error
            const input = e.target as HTMLInputElement;
            input.setCustomValidity("Código de producto no encontrado");
            input.reportValidity();
            setTimeout(() => {
              input.setCustomValidity("");
            }, 2000);
            return; // No avanzar a la siguiente celda
          }
        }
      }

      const nextCell = e.shiftKey
        ? getPreviousEditableCell(rowIndex, colIndex)
        : getNextEditableCell(rowIndex, colIndex);

      if (nextCell) {
        setFocusedCell(nextCell);
        setTimeout(() => {
          const key = `${nextCell.row}-${nextCell.col}`;
          const input = inputRefs.current[key];
          if (input) {
            input.focus();
            input.select(); // Seleccionar todo el texto
          }
        }, 0);
      } else if (!e.shiftKey) {
        // Si no hay siguiente celda y estamos en la última fila, agregar nueva fila
        if (rowIndex === data.length - 1 && !disabled) {
          onAddRow();
          setTimeout(() => {
            // Enfocar la primera celda editable de la nueva fila
            const firstEditableCol = columns.findIndex(col => col.type !== "readonly");
            if (firstEditableCol !== -1) {
              const key = `${data.length}-${firstEditableCol}`;
              const input = inputRefs.current[key];
              if (input) {
                input.focus();
                input.select(); // Seleccionar todo el texto
              }
              setFocusedCell({ row: data.length, col: firstEditableCol });
            }
          }, 50);
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      // Si estamos en la última fila, agregar una nueva
      if (rowIndex === data.length - 1 && !disabled) {
        onAddRow();
        setTimeout(() => {
          // Enfocar la primera celda editable de la nueva fila
          const firstEditableCol = columns.findIndex(col => col.type !== "readonly");
          if (firstEditableCol !== -1) {
            const key = `${data.length}-${firstEditableCol}`;
            const input = inputRefs.current[key];
            if (input) {
              input.focus();
              input.select(); // Seleccionar todo el texto
            }
            setFocusedCell({ row: data.length, col: firstEditableCol });
          }
        }, 50);
      } else {
        // Ir a la misma columna en la siguiente fila
        const nextRow = rowIndex + 1;
        setFocusedCell({ row: nextRow, col: colIndex });
        setTimeout(() => {
          const key = `${nextRow}-${colIndex}`;
          const input = inputRefs.current[key];
          if (input) {
            input.focus();
            input.select(); // Seleccionar todo el texto
          }
        }, 0);
      }
    } else if (e.key === "Delete" && !disabled) {
      // Si presiona Delete/Suprimir en una celda vacía, eliminar la fila
      const currentValue = data[rowIndex][column.accessor as string];
      const isEmpty = !currentValue || currentValue.toString().trim() === "";

      if (isEmpty && data.length > 1) {
        e.preventDefault();
        onRemoveRow(rowIndex);

        // Enfocar la misma celda en la fila anterior o siguiente
        setTimeout(() => {
          const targetRow = rowIndex > 0 ? rowIndex - 1 : 0;
          const key = `${targetRow}-${colIndex}`;
          const input = inputRefs.current[key];
          if (input) {
            input.focus();
            input.select();
          }
          setFocusedCell({ row: targetRow, col: colIndex });
        }, 50);
      }
    }
  };


  const renderCell = (row: T, rowIndex: number, column: ExcelGridColumn<T>, colIndex: number) => {
    const cellKey = `${rowIndex}-${colIndex}`;

    if (column.render) {
      return column.render(row, rowIndex);
    }

    switch (column.type) {
      case "product-code":
        // Campo de código de producto - busca coincidencias parciales y muestra sugerencias
        const codeValue = row[column.accessor as string] || "";
        const codeDatalistId = `products-code-${rowIndex}`;

        // Filtrar productos que coincidan con el valor actual
        const matchingProducts = codeValue
          ? productOptions.filter(p =>
              p.codigo.toLowerCase().includes(codeValue.toString().toLowerCase())
            )
          : [];

        return (
          <>
            <input
              ref={(el) => { inputRefs.current[cellKey] = el; }}
              type="text"
              value={codeValue}
              onChange={(e) => {
                const value = e.target.value;
                // Solo actualizar el valor del campo, NO buscar automáticamente
                onCellChange(rowIndex, column.accessor as string, value);
              }}
              onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex, column)}
              placeholder="Código..."
              className="w-full h-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-inset bg-transparent"
              list={matchingProducts.length > 1 ? codeDatalistId : undefined}
              autoComplete="off"
            />
            {matchingProducts.length > 1 && (
              <datalist id={codeDatalistId}>
                {matchingProducts.map((product) => (
                  <option key={product.id} value={product.codigo}>
                    {product.name}
                  </option>
                ))}
              </datalist>
            )}
          </>
        );

      case "product-search":
        // Campo de búsqueda de producto - con datalist
        const searchValue = row[column.accessor as string] || "";
        const datalistId = `products-name-${rowIndex}`;

        return (
          <>
            <input
              ref={(el) => { inputRefs.current[cellKey] = el; }}
              type="text"
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;

                // Buscar el producto por nombre
                const product = productOptions.find(p =>
                  p.name.toLowerCase() === value.toLowerCase()
                );

                // Si se encontró el producto, seleccionarlo
                if (product && onProductSelect) {
                  onProductSelect(rowIndex, product);
                } else {
                  // Si no se encontró, solo actualizar el valor del campo
                  onCellChange(rowIndex, column.accessor as string, value);
                }
              }}
              onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex, column)}
              placeholder="Producto..."
              className="w-full h-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-inset bg-transparent"
              list={datalistId}
              autoComplete="off"
            />
            <datalist id={datalistId}>
              {productOptions.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.codigo}
                </option>
              ))}
            </datalist>
          </>
        );

      case "number":
        const isDisabled = column.disabled ? column.disabled(row) : false;
        return (
          <input
            ref={(el) => { inputRefs.current[cellKey] = el; }}
            type="number"
            value={row[column.accessor as string] || ""}
            onChange={(e) => {
              const fieldName = column.accessor as string;
              const value = e.target.value;

              // Solo permitir valores positivos o vacío
              if (value === "" || parseFloat(value) >= 0) {
                onCellChange(rowIndex, fieldName, value);
              }
            }}
            onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex, column)}
            className={cn(
              "w-full h-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-inset bg-transparent text-right",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            step="any"
            min="0"
            disabled={isDisabled}
          />
        );

      case "text":
        return (
          <input
            ref={(el) => { inputRefs.current[cellKey] = el; }}
            type="text"
            value={row[column.accessor as string] || ""}
            onChange={(e) => column.onCellChange?.(rowIndex, e.target.value) ||
                           onCellChange(rowIndex, column.accessor as string, e.target.value)}
            onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex, column)}
            className="w-full h-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-inset bg-transparent"
          />
        );

      case "readonly":
        return (
          <div className="h-full flex items-center px-2 py-1 text-sm text-muted-foreground">
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
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          Agregar línea
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (focusedCell !== null && data.length > 0) {
              onRemoveRow(focusedCell.row);
              setFocusedCell(null);
            }
          }}
          size="sm"
          variant="outline"
          className="gap-2 text-destructive hover:text-destructive"
          disabled={focusedCell === null || data.length === 0}
        >
          <X className="h-4 w-4" />
          Quitar línea
        </Button>
      </div>

      {/* Tabla */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  style={{ width: column.width }}
                  className="font-semibold border-r h-10 bg-muted/50"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="group hover:bg-muted/50">
                  {columns.map((column, colIndex) => {
                    const hidden = isColumnHidden(column, row);
                    return (
                      <TableCell
                        key={column.id}
                        className={cn(
                          "p-0 h-9 border-r last:border-r-0",
                          hidden && "pointer-events-none"
                        )}
                        style={{
                          visibility: hidden ? 'hidden' : 'visible',
                          width: column.width
                        }}
                      >
                        {!hidden && renderCell(row, rowIndex, column, colIndex)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
