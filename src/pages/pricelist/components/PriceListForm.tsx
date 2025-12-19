import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  type PriceListSchemaCreate,
  type PriceListSchemaUpdate,
} from "../lib/pricelist.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import { Separator } from "@/components/ui/separator";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { PriceMatrixTable } from "./PriceMatrixTable";
import { FormSwitch } from "@/components/FormSwitch";
import { useState, useEffect, useMemo } from "react";

type PriceListFormProps =
  | {
      defaultValues?: Partial<PriceListSchemaCreate>;
      onSubmit: (data: PriceListSchemaCreate) => void | Promise<void>;
      onCancel: () => void;
      isSubmitting?: boolean;
      mode: "create";
    }
  | {
      defaultValues?: Partial<PriceListSchemaUpdate>;
      onSubmit: (data: PriceListSchemaUpdate) => void | Promise<void>;
      onCancel: () => void;
      isSubmitting?: boolean;
      mode: "update";
    };

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

export default function PriceListForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
}: PriceListFormProps) {
  const { data: products } = useAllProducts();

  // Estados para la matriz de precios
  const [weightRanges, setWeightRanges] = useState<WeightRangeData[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductInMatrix[]>(
    []
  );
  const [priceMatrix, setPriceMatrix] = useState<Record<string, PriceCell>>({});

  // Schema simplificado solo para campos básicos (sin weight_ranges ni product_prices)
  const basicFieldsSchema = z.object({
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .max(255, "Máximo 255 caracteres"),
    code: z.string().max(50, "Máximo 50 caracteres").optional(),
    description: z.string().max(500, "Máximo 500 caracteres").optional(),
    is_active: z.boolean().optional(),
  });

  const form = useForm<any>({
    resolver: zodResolver(basicFieldsSchema),
    defaultValues: defaultValues || {
      name: "",
      code: "",
      description: "",
      is_active: true,
    },
    mode: "onChange",
  });

  // Función para actualizar weight ranges y limpiar errores
  const handleWeightRangesChange = (ranges: WeightRangeData[]) => {
    setWeightRanges(ranges);
    if (form.formState.errors.root) {
      form.clearErrors("root");
    }
  };

  // Limpiar errores cuando cambian los productos o precios
  useEffect(() => {
    if (form.formState.errors.root) {
      form.clearErrors("root");
    }
  }, [selectedProducts, priceMatrix, form]);

  // Verificar si el formulario está completo
  const isFormComplete = useMemo(() => {
    // Debe haber al menos un rango de peso
    if (weightRanges.length === 0) return false;

    // Debe haber al menos un producto
    if (selectedProducts.length === 0) return false;

    // Todos los precios deben estar llenos
    for (const product of selectedProducts) {
      for (let rangeIndex = 0; rangeIndex < weightRanges.length; rangeIndex++) {
        const key = `${product.product_id}_${rangeIndex}`;
        const priceCell = priceMatrix[key];

        if (!priceCell || !priceCell.price || priceCell.price <= 0) {
          return false;
        }
      }
    }

    return true;
  }, [weightRanges, selectedProducts, priceMatrix]);

  // Cargar datos iniciales cuando hay defaultValues
  useEffect(() => {
    if (
      defaultValues?.weight_ranges &&
      defaultValues.weight_ranges.length > 0
    ) {
      setWeightRanges(
        defaultValues.weight_ranges.map((range, index) => ({
          name: range.name,
          min_weight: range.min_weight,
          max_weight: range.max_weight ?? null,
          order: index + 1,
        }))
      );
    }

    if (
      defaultValues?.product_prices &&
      defaultValues.product_prices.length > 0 &&
      products
    ) {
      // Extraer productos únicos
      const uniqueProducts = new Map<number, ProductInMatrix>();
      const newMatrix: Record<string, PriceCell> = {};

      defaultValues.product_prices.forEach((price) => {
        if (!uniqueProducts.has(price.product_id)) {
          const product = products.find((p) => p.id === price.product_id);
          if (product) {
            uniqueProducts.set(price.product_id, {
              product_id: product.id,
              product_name: product.name,
              product_code: product.codigo,
            });
          }
        }

        // Agregar precio a la matriz
        const key = `${price.product_id}_${price.weight_range_index}`;
        newMatrix[key] = {
          price: price.price,
          currency: price.currency,
        };
      });

      setSelectedProducts(Array.from(uniqueProducts.values()));
      setPriceMatrix(newMatrix);
    }
  }, [defaultValues, products]);

  const handleFormSubmit = async (data: any) => {
    // Validar que haya al menos un rango de peso
    if (weightRanges.length === 0) {
      form.setError("root", {
        type: "manual",
        message: "Debe agregar al menos un rango de peso",
      });
      return;
    }

    // Validar que haya al menos un producto seleccionado
    if (selectedProducts.length === 0) {
      form.setError("root", {
        type: "manual",
        message: "Debe agregar al menos un producto a la matriz de precios",
      });
      return;
    }

    // Validar que todos los precios estén llenos
    const missingPrices: string[] = [];
    selectedProducts.forEach((product) => {
      weightRanges.forEach((range, rangeIndex) => {
        const key = `${product.product_id}_${rangeIndex}`;
        const priceCell = priceMatrix[key];

        if (!priceCell || !priceCell.price || priceCell.price <= 0) {
          missingPrices.push(`${product.product_name} - ${range.name}`);
        }
      });
    });

    if (missingPrices.length > 0) {
      form.setError("root", {
        type: "manual",
        message: `Debe completar los precios para: ${missingPrices
          .slice(0, 3)
          .join(", ")}${
          missingPrices.length > 3 ? ` y ${missingPrices.length - 3} más` : ""
        }`,
      });
      return;
    }

    // Convertir la matriz de precios al formato esperado por el backend
    const product_prices: any[] = [];

    selectedProducts.forEach((product) => {
      weightRanges.forEach((_, rangeIndex) => {
        const key = `${product.product_id}_${rangeIndex}`;
        const priceCell = priceMatrix[key];

        if (priceCell && priceCell.price > 0) {
          product_prices.push({
            product_id: product.product_id,
            weight_range_index: rangeIndex,
            price: priceCell.price,
            currency: priceCell.currency,
          });
        }
      });
    });

    const formData = {
      ...data,
      weight_ranges: weightRanges.map((range) => ({
        name: range.name,
        min_weight: range.min_weight,
        max_weight: range.max_weight,
        order: range.order,
      })),
      product_prices,
    };

    await onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* Información Básica */}
        <GroupFormSection
          title="Información Básica"
          icon={FileText}
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Lista de Precios 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: LP2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción de la lista de precios..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === "update" && (
            <FormSwitch
              control={form.control}
              name="is_active"
              text="Estado Activo"
              textDescription="La lista de precios estará disponible para asignar a clientes"
              className="md:col-span-2"
            />
          )}
        </GroupFormSection>

        {/* Matriz de Precios */}
        <PriceMatrixTable
          weightRanges={weightRanges}
          onWeightRangesChange={handleWeightRangesChange}
          products={products || []}
          selectedProducts={selectedProducts}
          onSelectedProductsChange={setSelectedProducts}
          priceMatrix={priceMatrix}
          onPriceMatrixChange={setPriceMatrix}
        />

        {form.formState.errors.root && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}

        <Separator />

        <Button onClick={() => form.trigger()}>Button</Button>
        <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre>

        {/* Botones de Acción */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting || !form.formState.isValid || !isFormComplete
            }
          >
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
              ? "Crear Lista de Precio"
              : "Actualizar Lista de Precio"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
