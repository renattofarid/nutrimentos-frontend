"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/components/GeneralSheet";
import { FormSelect } from "@/components/FormSelect";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { useEffect, useState } from "react";
import { useDynamicPrice } from "../lib/dynamic-price.hook";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const detailSchema = z.object({
  product_id: z.string().min(1, "Seleccione un producto"),
  quantity: z.string().min(1, "Ingrese la cantidad"),
  additional_kg: z.string().optional(),
});

type DetailSchema = z.infer<typeof detailSchema>;

export interface DetailFormData {
  product_id: string;
  product_name?: string;
  quantity: string; // Cantidad total en decimal (ej: 1.02) - SE ENVÍA AL BACKEND
  quantity_sacks: string; // Cantidad de sacos ingresada por el usuario (ej: 1)
  quantity_kg: string; // Kg adicionales ingresados por el usuario (ej: 1)
  unit_price: string;
  subtotal: number;
  igv: number;
  total: number;
  total_kg?: number; // Peso total en kg (ej: 51)
}

interface SaleProductSheetProps {
  open: boolean;
  onClose: () => void;
  products: ProductResource[];
  customerId: string;
  warehouseId: string;
  onSubmit: (data: DetailFormData) => void;
  defaultValues?: DetailFormData;
  mode: "create" | "update";
}

export const SaleProductSheet = ({
  open,
  onClose,
  products,
  customerId,
  warehouseId,
  onSubmit,
  defaultValues,
  mode,
}: SaleProductSheetProps) => {
  const { fetchDynamicPrice, isLoading: isPriceLoading, error: priceError } = useDynamicPrice();
  const [priceData, setPriceData] = useState<any>(null);

  const form = useForm<DetailSchema>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      product_id: defaultValues?.product_id || "",
      quantity: defaultValues?.quantity_sacks || "",
      additional_kg: defaultValues?.quantity_kg || "0",
    },
  });

  const selectedProductId = form.watch("product_id");
  const selectedQuantity = form.watch("quantity");
  const selectedAdditionalKg = form.watch("additional_kg");

  const selectedProduct = products.find(
    (p) => p.id.toString() === selectedProductId
  );

  // Resetear el formulario cuando cambian los defaultValues (modo edición)
  useEffect(() => {
    if (open && defaultValues && mode === "update") {
      form.reset({
        product_id: defaultValues.product_id || "",
        quantity: defaultValues.quantity_sacks || "",
        additional_kg: defaultValues.quantity_kg || "0",
      });
    } else if (open && mode === "create") {
      form.reset({
        product_id: "",
        quantity: "",
        additional_kg: "0",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues, mode]);

  // Fetch dynamic price cuando cambian los valores
  useEffect(() => {
    const fetchPrice = async () => {
      if (!selectedProductId || !selectedQuantity || !customerId) {
        console.log("Falta información:", { selectedProductId, selectedQuantity, customerId });
        setPriceData(null);
        return;
      }

      const quantity = parseFloat(selectedQuantity) || 0;
      const additionalKg = parseFloat(selectedAdditionalKg || "0");

      if (quantity === 0 && additionalKg === 0) {
        console.log("Cantidad es 0");
        setPriceData(null);
        return;
      }

      // Calcular la cantidad en decimales considerando el peso del saco
      // Fórmula: cantidad_decimal = sacos + (kg_adicionales / peso_del_saco)
      let quantitySacksDecimal = quantity;
      const productWeight = selectedProduct?.weight ? parseFloat(selectedProduct.weight) : 0;

      if (productWeight > 0 && additionalKg > 0) {
        // Convertir kg adicionales a fracción de sacos
        const additionalSacks = additionalKg / productWeight;
        quantitySacksDecimal = quantity + additionalSacks;
      }

      console.log("Obteniendo precio dinámico...", {
        product_id: selectedProductId,
        person_id: customerId,
        quantity_sacks: quantitySacksDecimal,
        quantity_kg: 0, // Ahora enviamos 0 porque ya incluimos los kg en quantity_sacks
        peso_del_saco: productWeight,
        calculo: `${quantity} sacos + (${additionalKg} kg / ${productWeight} kg) = ${quantitySacksDecimal}`,
      });

      const result = await fetchDynamicPrice({
        product_id: selectedProductId,
        person_id: customerId,
        quantity_sacks: quantitySacksDecimal,
        quantity_kg: 0, // Los kg adicionales ya están incluidos en quantity_sacks
      });

      if (result) {
        console.log("Precio obtenido:", result);
        setPriceData(result);
      } else {
        console.log("No se obtuvo precio");
      }
    };

    fetchPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, selectedQuantity, selectedAdditionalKg, customerId]);

  const handleSubmit = (data: DetailSchema) => {
    if (!priceData) return;

    const roundTo6Decimals = (value: number): number => {
      return Math.round(value * 1000000) / 1000000;
    };

    // Calcular la cantidad decimal (igual que en el useEffect)
    const quantity = parseFloat(data.quantity) || 0;
    const additionalKg = parseFloat(data.additional_kg || "0");
    const productWeight = selectedProduct?.weight ? parseFloat(selectedProduct.weight) : 0;

    let quantitySacksDecimal = quantity;
    if (productWeight > 0 && additionalKg > 0) {
      const additionalSacks = additionalKg / productWeight;
      quantitySacksDecimal = quantity + additionalSacks;
    }

    // Calcular el subtotal según el tipo de producto
    // Si el producto se vende por kg (is_kg = 1), usar peso total × precio_por_kg
    // Si no, usar cantidad de sacos × precio_unitario
    let subtotal: number;
    if (selectedProduct?.is_kg === 1) {
      // Producto por kg: usar peso total en kg × precio por kg
      const pricePerKg = parseFloat(priceData.pricing.price_per_kg);
      const totalWeightKg = priceData.quantities.total_weight_kg;
      subtotal = roundTo6Decimals(totalWeightKg * pricePerKg);
    } else {
      // Producto por unidad: usar cantidad de sacos × precio unitario
      const unitPrice = parseFloat(priceData.pricing.unit_price);
      subtotal = roundTo6Decimals(quantity * unitPrice);
    }
    const igv = roundTo6Decimals(subtotal * 0.18);
    const total = roundTo6Decimals(subtotal + igv);

    const formData: DetailFormData = {
      product_id: data.product_id,
      product_name: selectedProduct?.name,
      quantity: quantitySacksDecimal.toString(), // Cantidad total en decimal (SE ENVÍA AL BACKEND)
      quantity_sacks: data.quantity, // Sacos ingresados por el usuario
      quantity_kg: data.additional_kg || "0", // Kg adicionales ingresados por el usuario
      unit_price: priceData.pricing.unit_price,
      subtotal,
      igv,
      total,
      total_kg: priceData.quantities.total_weight_kg, // Peso total en kg
    };

    onSubmit(formData);
    form.reset();
    setPriceData(null);
    onClose();
  };

  const handleClose = () => {
    form.reset();
    setPriceData(null);
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={mode === "create" ? "Agregar Producto" : "Editar Producto"}
      subtitle="Complete los campos para agregar un producto a la venta"
      icon="Package"
      size="lg"
      modal={false}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormSelect
            control={form.control}
            name="product_id"
            label="Producto"
            placeholder={
              warehouseId
                ? "Seleccione un producto"
                : "Primero seleccione un almacén"
            }
            options={products.map((product) => {
              const stockInWarehouse = product.stock_warehouse?.find(
                (stock) => stock.warehouse_id.toString() === warehouseId
              );
              return {
                value: product.id.toString(),
                label: product.name,
                description: `${product.codigo} | Stock: ${
                  stockInWarehouse?.stock ?? 0
                }`,
                searchCode: product.codigo,
              };
            })}
            disabled={!warehouseId}
            enableCodeSearch={true}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad (Sacos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    step="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedProduct?.is_kg === 1 && (
            <FormField
              control={form.control}
              name="additional_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kg Adicionales</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
          )}

          {/* Vista previa del precio */}
          {isPriceLoading && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Calculando precio...
              </span>
            </div>
          )}

          {priceError && !isPriceLoading && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                Error al obtener precio: {priceError}
              </p>
            </div>
          )}

          {priceData && !isPriceLoading && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Categoría Cliente:</span>
                <Badge variant="secondary">
                  {priceData.client_category.name}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rango de Peso:</span>
                <Badge variant="secondary">
                  {priceData.weight_range.formatted_range}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Peso Total:</span>
                <span className="text-sm font-bold text-blue-600">
                  {priceData.quantities.total_weight_kg} kg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Precio Unitario:</span>
                <span className="text-sm font-bold text-primary">
                  {priceData.pricing.currency} {priceData.pricing.unit_price}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-bold">Subtotal:</span>
                <span className="text-lg font-bold text-primary">
                  {priceData.pricing.currency} {
                    (() => {
                      // Calcular subtotal según el tipo de producto
                      if (selectedProduct?.is_kg === 1) {
                        // Producto por kg: peso total × precio por kg
                        const pricePerKg = parseFloat(priceData.pricing.price_per_kg);
                        const totalWeightKg = priceData.quantities.total_weight_kg;
                        return (totalWeightKg * pricePerKg).toFixed(2);
                      } else {
                        // Producto por unidad: sacos × precio unitario
                        return (parseFloat(selectedQuantity || "0") * parseFloat(priceData.pricing.unit_price)).toFixed(2);
                      }
                    })()
                  }
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="neutral" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!priceData || isPriceLoading}>
              {mode === "create" ? "Agregar" : "Actualizar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
};
