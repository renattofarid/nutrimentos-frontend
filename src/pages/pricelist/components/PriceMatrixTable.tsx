"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, DollarSign, Weight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddWeightRangeModal } from "./AddWeightRangeModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useProduct } from "@/pages/product/lib/product.hook";
import type { ProductResource } from "@/pages/product/lib/product.interface";

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
  selectedProducts: ProductInMatrix[];
  onSelectedProductsChange: (products: ProductInMatrix[]) => void;
  priceMatrix: Record<string, PriceCell>; // key: "productId_rangeIndex"
  onPriceMatrixChange: (matrix: Record<string, PriceCell>) => void;
}

export const PriceMatrixTable = ({
  weightRanges,
  onWeightRangesChange,
  selectedProducts,
  onSelectedProductsChange,
  priceMatrix,
  onPriceMatrixChange,
}: PriceMatrixTableProps) => {
  const [showWeightRangeModal, setShowWeightRangeModal] = useState(false);

  const productSearchForm = useForm<{ product_id: string }>({
    defaultValues: { product_id: "" },
  });

  const handleAddProduct = (value: string, item?: ProductResource) => {
    if (!value || !item) return;
    if (!selectedProducts.some((p) => p.product_id === item.id)) {
      onSelectedProductsChange([
        ...selectedProducts,
        {
          product_id: item.id,
          product_name: item.name,
          product_code: item.codigo,
        },
      ]);
    }
    setTimeout(() => productSearchForm.reset(), 0);
  };

  const handleAddWeightRange = (data: {
    name: string;
    min_weight: number;
    max_weight: number | null;
  }) => {
    onWeightRangesChange([
      ...weightRanges,
      { ...data, order: weightRanges.length + 1 },
    ]);
  };

  const handleRemoveWeightRange = (index: number) => {
    onWeightRangesChange(weightRanges.filter((_, i) => i !== index));

    const newMatrix = { ...priceMatrix };
    selectedProducts.forEach((product) => {
      delete newMatrix[`${product.product_id}_${index}`];
    });
    onPriceMatrixChange(newMatrix);
  };

  const handleRemoveProduct = (productId: number) => {
    onSelectedProductsChange(
      selectedProducts.filter((p) => p.product_id !== productId)
    );

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
      [key]: { ...currentCell, price: value === "" ? 0 : parseFloat(value) },
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
      [key]: { ...currentCell, currency },
    });
  };

  const getPriceValue = (productId: number, rangeIndex: number): string => {
    const price = priceMatrix[`${productId}_${rangeIndex}`]?.price;
    return price && price > 0 ? price.toString() : "";
  };

  const getCurrencyValue = (productId: number, rangeIndex: number): string =>
    priceMatrix[`${productId}_${rangeIndex}`]?.currency || "PEN";

  return (
    <div className="space-y-4">
      {/* Header */}
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowWeightRangeModal(true)}
        >
          <Weight className="h-4 w-4 mr-2" />
          Agregar Rango
        </Button>
      </div>

      {/* Búsqueda de producto */}
      <Form {...productSearchForm}>
        <FormSelectAsync
          name="product_id"
          control={productSearchForm.control}
          label="Agregar Producto"
          placeholder="Buscar por código o nombre..."
          useQueryHook={useProduct}
          mapOptionFn={(item: ProductResource) => ({
            value: String(item.id),
            label: item.name,
            description: item.codigo,
          })}
          onValueChange={handleAddProduct}
          withValue={false}
        />
      </Form>

      {/* Tabla */}
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

      <AddWeightRangeModal
        open={showWeightRangeModal}
        onClose={() => setShowWeightRangeModal(false)}
        onSubmit={handleAddWeightRange}
      />
    </div>
  );
};
