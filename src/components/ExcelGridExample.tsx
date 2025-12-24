"use client";

import * as React from "react";
import { ExcelGrid, type ExcelGridColumn, type ProductOption } from "./ExcelGrid";

// Define tu tipo de fila
interface DetailRow {
  product_id: string;
  product_name: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  igv: string;
  total: string;
}

// Ejemplo de productos disponibles
const mockProducts: ProductOption[] = [
  { id: "1", codigo: "PROD-001", name: "Producto 1" },
  { id: "2", codigo: "PROD-002", name: "Producto 2" },
  { id: "3", codigo: "PROD-003", name: "Producto 3" },
];

export function ExcelGridExample() {
  const [details, setDetails] = React.useState<DetailRow[]>([]);

  // Definir las columnas
  const columns: ExcelGridColumn<DetailRow>[] = [
    {
      id: "product",
      header: "Producto",
      type: "product-search",
      accessor: "product_name",
      width: "300px",
    },
    {
      id: "quantity",
      header: "Cantidad",
      type: "number",
      accessor: "quantity",
      width: "120px",
    },
    {
      id: "unit_price",
      header: "Precio Unit.",
      type: "number",
      accessor: "unit_price",
      width: "120px",
    },
    {
      id: "subtotal",
      header: "Subtotal",
      type: "readonly",
      accessor: "subtotal",
      width: "120px",
      render: (row) => (
        <div className="text-right font-medium">
          {parseFloat(row.subtotal || "0").toFixed(2)}
        </div>
      ),
    },
    {
      id: "igv",
      header: "IGV (18%)",
      type: "readonly",
      accessor: "igv",
      width: "120px",
      render: (row) => (
        <div className="text-right text-orange-600">
          {parseFloat(row.igv || "0").toFixed(2)}
        </div>
      ),
    },
    {
      id: "total",
      header: "Total",
      type: "readonly",
      accessor: "total",
      width: "120px",
      render: (row) => (
        <div className="text-right font-bold text-primary">
          {parseFloat(row.total || "0").toFixed(2)}
        </div>
      ),
    },
  ];

  // Función para agregar una nueva fila
  const handleAddRow = () => {
    setDetails((prev) => [
      ...prev,
      {
        product_id: "",
        product_name: "",
        quantity: "",
        unit_price: "",
        subtotal: "0",
        igv: "0",
        total: "0",
      },
    ]);
  };

  // Función para eliminar una fila
  const handleRemoveRow = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // Función para calcular los totales cuando cambia cantidad o precio
  const calculateTotals = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity || "0");
    const price = parseFloat(unitPrice || "0");
    const subtotal = qty * price;
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    return {
      subtotal: subtotal.toFixed(2),
      igv: igv.toFixed(2),
      total: total.toFixed(2),
    };
  };

  // Función cuando cambia el valor de una celda
  const handleCellChange = (index: number, field: string, value: string) => {
    setDetails((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };

      // Recalcular totales si cambia cantidad o precio
      if (field === "quantity" || field === "unit_price") {
        const totals = calculateTotals(row.quantity, row.unit_price);
        row.subtotal = totals.subtotal;
        row.igv = totals.igv;
        row.total = totals.total;
      }

      updated[index] = row;
      return updated;
    });
  };

  // Función cuando se selecciona un producto
  const handleProductSelect = (index: number, product: ProductOption) => {
    setDetails((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        product_id: product.id,
        product_name: product.name,
      };
      return updated;
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Ejemplo de Excel Grid</h2>

      <ExcelGrid
        columns={columns}
        data={details}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        onCellChange={handleCellChange}
        productOptions={mockProducts}
        onProductSelect={handleProductSelect}
      />

      {/* Mostrar totales generales */}
      {details.length > 0 && (
        <div className="mt-4 p-4 border rounded-md bg-muted/50">
          <h3 className="font-semibold mb-2">Totales</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Subtotal:</span>{" "}
              <span className="font-medium">
                {details
                  .reduce((acc, row) => acc + parseFloat(row.subtotal || "0"), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">IGV:</span>{" "}
              <span className="font-medium text-orange-600">
                {details
                  .reduce((acc, row) => acc + parseFloat(row.igv || "0"), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-bold text-primary">
                {details
                  .reduce((acc, row) => acc + parseFloat(row.total || "0"), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
