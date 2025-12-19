"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, DollarSign, Weight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { AddWeightRangeModal } from "./AddWeightRangeModal";
import { AddProductToMatrixModal } from "./AddProductToMatrixModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WeightRangeData {
  name: string;
  min_weight: number;
  max_weight: number | null;
  order: number;
}

interface ProductInMatrix {
  product_id: number;
  product_name: string;
  product_code: string;
}

interface PriceCell {
  price: number;
  currency: string;
}

interface PriceMatrixTableProps {
  weightRanges: WeightRangeData[];
  onWeightRangesChange: (ranges: WeightRangeData[]) => void;
  products: ProductResource[];
  selectedProducts: ProductInMatrix[];
  onSelectedProductsChange: (products: ProductInMatrix[]) => void;
  priceMatrix: Record<string, PriceCell>; // key: "productId_rangeIndex"
  onPriceMatrixChange: (matrix: Record<string, PriceCell>) => void;
}

export const PriceMatrixTable = ({
  weightRanges,
  onWeightRangesChange,
  products,
  selectedProducts,
  onSelectedProductsChange,
  priceMatrix,
  onPriceMatrixChange,
}: PriceMatrixTableProps) => {
  const [showWeightRangeModal, setShowWeightRangeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const handleAddWeightRange = (data: {
    name: string;
    min_weight: number;
    max_weight: number | null;
  }) => {
    const newRange: WeightRangeData = {
      ...data,
      order: weightRanges.length + 1,
    };
    onWeightRangesChange([...weightRanges, newRange]);
  };

  const handleRemoveWeightRange = (index: number) => {
    const newRanges = weightRanges.filter((_, i) => i !== index);
    onWeightRangesChange(newRanges);

    // Limpiar precios asociados a este rango
    const newMatrix = { ...priceMatrix };
    selectedProducts.forEach((product) => {
      delete newMatrix[`${product.product_id}_${index}`];
    });
    onPriceMatrixChange(newMatrix);
  };

  const handleAddProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newProduct: ProductInMatrix = {
      product_id: product.id,
      product_name: product.name,
      product_code: product.codigo,
    };
    onSelectedProductsChange([...selectedProducts, newProduct]);
  };

  const handleRemoveProduct = (productId: number) => {
    const newProducts = selectedProducts.filter(
      (p) => p.product_id !== productId
    );
    onSelectedProductsChange(newProducts);

    // Limpiar precios asociados a este producto
    const newMatrix = { ...priceMatrix };
    weightRanges.forEach((_, rangeIndex) => {
      delete newMatrix[`${productId}_${rangeIndex}`];
    });
    onPriceMatrixChange(newMatrix);
  };

  const handlePriceChange = (
    productId: number,
    rangeIndex: number,
    value: string
  ) => {
    const key = `${productId}_${rangeIndex}`;
    const currentCell = priceMatrix[key] || { price: 0, currency: "PEN" };

    onPriceMatrixChange({
      ...priceMatrix,
      [key]: {
        ...currentCell,
        price: value === "" ? 0 : parseFloat(value),
      },
    });
  };

  const handleCurrencyChange = (
    productId: number,
    rangeIndex: number,
    currency: string
  ) => {
    const key = `${productId}_${rangeIndex}`;
    const currentCell = priceMatrix[key] || { price: 0, currency: "PEN" };

    onPriceMatrixChange({
      ...priceMatrix,
      [key]: {
        ...currentCell,
        currency,
      },
    });
  };

  const getPriceValue = (productId: number, rangeIndex: number): number => {
    const key = `${productId}_${rangeIndex}`;
    return priceMatrix[key]?.price || 0;
  };

  const getCurrencyValue = (productId: number, rangeIndex: number): string => {
    const key = `${productId}_${rangeIndex}`;
    return priceMatrix[key]?.currency || "PEN";
  };

  return (
    <div className="space-y-4">
      {/* Header con botones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Matriz de Precios</h3>
            <p className="text-sm text-muted-foreground">
              Configure los precios por producto y rango de peso
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowWeightRangeModal(true)}
          >
            <Weight className="h-4 w-4 mr-2" />
            Agregar Rango
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowProductModal(true)}
            disabled={!products || products.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Tabla de doble entrada */}
      {selectedProducts.length === 0 && weightRanges.length === 0 ? (
        <div className="text-center py-12 rounded-lg border-2 border-dashed border-muted bg-muted/20">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground font-medium">
            Agregue rangos de peso y productos para comenzar
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-3 text-left font-semibold sticky left-0 bg-muted/50 z-10 min-w-[200px]">
                  Producto
                </th>
                {weightRanges.length === 0 ? (
                  <th className="border p-3 text-center text-muted-foreground italic">
                    No hay rangos de peso agregados
                  </th>
                ) : (
                  weightRanges.map((range, index) => (
                    <th
                      key={index}
                      className="border p-3 text-center font-semibold min-w-[180px]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {range.name}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemoveWeightRange(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {range.min_weight}kg -{" "}
                          {range.max_weight !== null
                            ? `${range.max_weight}kg`
                            : "Sin límite"}
                        </div>
                      </div>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {selectedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={weightRanges.length + 1}
                    className="border p-8 text-center text-muted-foreground italic"
                  >
                    No hay productos agregados
                  </td>
                </tr>
              ) : (
                selectedProducts.map((product) => (
                  <tr key={product.product_id} className="hover:bg-muted/20">
                    <td className="border p-3 sticky left-0 bg-background z-10">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm">
                            {product.product_name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {product.product_code}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                          onClick={() => handleRemoveProduct(product.product_id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    {weightRanges.length === 0 ? (
                      <td className="border p-3 text-center text-muted-foreground italic">
                        Agregue rangos de peso
                      </td>
                    ) : (
                      weightRanges.map((_, rangeIndex) => (
                        <td key={rangeIndex} className="border p-2">
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="h-8 text-sm"
                              value={getPriceValue(product.product_id, rangeIndex)}
                              onChange={(e) =>
                                handlePriceChange(
                                  product.product_id,
                                  rangeIndex,
                                  e.target.value
                                )
                              }
                            />
                            <Select
                              value={getCurrencyValue(product.product_id, rangeIndex)}
                              onValueChange={(value) =>
                                handleCurrencyChange(
                                  product.product_id,
                                  rangeIndex,
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="h-8 w-[70px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PEN">PEN</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      ))
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      <AddWeightRangeModal
        open={showWeightRangeModal}
        onClose={() => setShowWeightRangeModal(false)}
        onSubmit={handleAddWeightRange}
      />

      <AddProductToMatrixModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleAddProduct}
        products={products || []}
        selectedProductIds={selectedProducts.map((p) => p.product_id)}
      />
    </div>
  );
};
