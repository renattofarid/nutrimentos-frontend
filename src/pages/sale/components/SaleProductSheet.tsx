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
  manual_price: z.string().optional(),
  manual_kg: z.string().optional(), // Campo para kg cuando es modo manual
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
  const {
    fetchDynamicPrice,
    isLoading: isPriceLoading,
    error: priceError,
  } = useDynamicPrice();
  const [priceData, setPriceData] = useState<any>(null);
  const [useManualPrice, setUseManualPrice] = useState(false);

  const form = useForm<DetailSchema>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      product_id: defaultValues?.product_id || "",
      quantity: defaultValues?.quantity_sacks || "",
      additional_kg: defaultValues?.quantity_kg || "0",
      manual_price: "",
      manual_kg: "",
    },
  });

  const selectedProductId = form.watch("product_id");
  const selectedQuantity = form.watch("quantity");
  const selectedAdditionalKg = form.watch("additional_kg");
  const manualPrice = form.watch("manual_price");
  const manualKg = form.watch("manual_kg");

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
        manual_kg: "",
      });
    } else if (open && mode === "create") {
      form.reset({
        product_id: "",
        quantity: "",
        additional_kg: "0",
        manual_kg: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues, mode]);

  // Fetch dynamic price cuando cambian los valores
  useEffect(() => {
    const fetchPrice = async () => {
      if (!selectedProductId || !selectedQuantity || !customerId) {
        setPriceData(null);
        return;
      }

      const quantity = parseFloat(selectedQuantity) || 0;
      const additionalKg = parseFloat(selectedAdditionalKg || "0");

      if (quantity === 0 && additionalKg === 0) {
        ("Cantidad es 0");
        setPriceData(null);
        return;
      }

      // Calcular la cantidad en decimales considerando el peso del saco
      // Fórmula: cantidad_decimal = sacos + (kg_adicionales / peso_del_saco)
      let quantitySacksDecimal = quantity;
      const productWeight = selectedProduct?.weight
        ? parseFloat(selectedProduct.weight)
        : 0;

      if (productWeight > 0 && additionalKg > 0) {
        // Convertir kg adicionales a fracción de sacos
        const additionalSacks = additionalKg / productWeight;
        quantitySacksDecimal = quantity + additionalSacks;
      }

      const result = await fetchDynamicPrice({
        product_id: selectedProductId,
        person_id: customerId,
        quantity_sacks: quantitySacksDecimal,
        quantity_kg: 0, // Los kg adicionales ya están incluidos en quantity_sacks
      });

      if (result) {
        setPriceData(result);
      }
    };

    fetchPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, selectedQuantity, selectedAdditionalKg, customerId]);

  const handleSubmit = (data: DetailSchema) => {
    // Validar que tengamos precio (ya sea dinámico o manual)
    if (!useManualPrice && !priceData) return;
    if (
      useManualPrice &&
      (!data.manual_price || parseFloat(data.manual_price) <= 0)
    )
      return;
    if (useManualPrice && (!data.manual_kg || parseFloat(data.manual_kg) <= 0))
      return;

    const roundTo6Decimals = (value: number): number => {
      return Math.round(value * 1000000) / 1000000;
    };

    // Calcular la cantidad decimal (igual que en el useEffect)
    let quantity: number;
    let additionalKg: number;
    let quantitySacksDecimal: number;
    let totalWeightKg: number;

    if (useManualPrice) {
      // En modo manual solo usamos kg
      quantity = 0;
      additionalKg = 0;
      totalWeightKg = parseFloat(data.manual_kg || "0");
      quantitySacksDecimal = 0; // No hay sacos en modo manual
    } else {
      // Modo con API (precio dinámico)
      quantity = parseFloat(data.quantity) || 0;
      additionalKg = parseFloat(data.additional_kg || "0");
      const productWeight = selectedProduct?.weight
        ? parseFloat(selectedProduct.weight)
        : 0;

      quantitySacksDecimal = quantity;
      if (productWeight > 0 && additionalKg > 0) {
        const additionalSacks = additionalKg / productWeight;
        quantitySacksDecimal = quantity + additionalSacks;
      }

      // Calcular peso total en kg
      totalWeightKg =
        productWeight > 0
          ? roundTo6Decimals(productWeight * quantity + additionalKg)
          : 0;
    }

    // Usar precio manual o precio dinámico
    let unitPrice: number;
    let subtotal: number;

    if (useManualPrice) {
      // Precio manual: siempre es por kg
      unitPrice = parseFloat(data.manual_price || "0");
      subtotal = roundTo6Decimals(totalWeightKg * unitPrice);
    } else {
      // Precio dinámico - usar el subtotal que viene de la API
      unitPrice = parseFloat(priceData.pricing.unit_price);
      subtotal = parseFloat(priceData.pricing.subtotal);
    }

    const igv = roundTo6Decimals(subtotal * 0.18);
    const total = roundTo6Decimals(subtotal + igv);

    const formData: DetailFormData = {
      product_id: data.product_id,
      product_name: selectedProduct?.name,
      quantity: useManualPrice
        ? totalWeightKg.toString()
        : quantitySacksDecimal.toString(), // En modo manual son los kg totales
      quantity_sacks: useManualPrice ? "0" : data.quantity, // En modo manual es 0
      quantity_kg: useManualPrice
        ? data.manual_kg || "0"
        : data.additional_kg || "0", // En modo manual usamos manual_kg
      unit_price: unitPrice.toString(),
      subtotal,
      igv,
      total,
      total_kg: totalWeightKg, // Peso total en kg
    };

    onSubmit(formData);
    form.reset();
    setPriceData(null);
    setUseManualPrice(false);
    onClose();
  };

  const handleClose = () => {
    form.reset();
    setPriceData(null);
    setUseManualPrice(false);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda por Código */}
            <FormSelect
              control={form.control}
              name="product_id"
              label="Buscar por Código"
              placeholder={
                warehouseId
                  ? "Ingrese código..."
                  : "Primero seleccione un almacén"
              }
              options={products.map((product) => {
                const stockInWarehouse = product.stock_warehouse?.find(
                  (stock) => stock.warehouse_id.toString() === warehouseId
                );
                return {
                  value: product.id.toString(),
                  label: product.codigo,
                  description: `${product.name} | Stock: ${
                    stockInWarehouse?.stock ?? 0
                  }`,
                };
              })}
              disabled={!warehouseId}
            />

            {/* Búsqueda por Nombre */}
            <FormSelect
              control={form.control}
              name="product_id"
              label="Buscar por Nombre"
              placeholder={
                warehouseId
                  ? "Ingrese nombre..."
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
                };
              })}
              disabled={!warehouseId}
            />
          </div>

          {!useManualPrice && (
            <>
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
            </>
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

          {priceError && !isPriceLoading && !useManualPrice && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
              <p className="text-sm text-destructive font-medium">
                Error al obtener precio: {priceError}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseManualPrice(true)}
                className="w-full"
              >
                Ingresar Precio Manual
              </Button>
            </div>
          )}

          {!priceData &&
            !isPriceLoading &&
            !priceError &&
            selectedProductId &&
            selectedQuantity &&
            !useManualPrice && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  No se encontró precio para este producto
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseManualPrice(true)}
                  className="w-full"
                >
                  Ingresar Precio Manual
                </Button>
              </div>
            )}

          {useManualPrice && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Modo: Precio Manual (solo kg)
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUseManualPrice(false);
                    form.setValue("manual_price", "");
                    form.setValue("manual_kg", "");
                  }}
                >
                  Cancelar
                </Button>
              </div>
              <FormField
                control={form.control}
                name="manual_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad (Kg)</FormLabel>
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
              <FormField
                control={form.control}
                name="manual_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por Kg</FormLabel>
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
            </div>
          )}

          {priceData && !isPriceLoading && !useManualPrice && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  PRECIO DINÁMICO
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseManualPrice(true)}
                  className="h-7 text-xs"
                >
                  Usar Precio Manual
                </Button>
              </div>
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
                  {priceData.pricing.currency}{" "}
                  {parseFloat(priceData.pricing.subtotal).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="neutral" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isPriceLoading ||
                (!useManualPrice && !priceData) ||
                (useManualPrice &&
                  (!manualPrice ||
                    parseFloat(manualPrice) <= 0 ||
                    !manualKg ||
                    parseFloat(manualKg) <= 0))
              }
            >
              {mode === "create" ? "Agregar" : "Actualizar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
};
