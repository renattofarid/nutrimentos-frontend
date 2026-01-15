import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { requiredStringId } from "@/lib/core.schema";

const detailFormSchema = z.object({
  product_id: requiredStringId("Debe seleccionar un producto"),
  quantity_sacks: z
    .number({ message: "La cantidad en sacos es requerida" })
    .positive("La cantidad debe ser mayor a 0"),
  quantity_kg: z
    .number({ message: "La cantidad en kg debe ser un número" })
    .nonnegative("La cantidad en kg no puede ser negativa")
    .optional(),
  unit_price: z
    .number({ message: "El precio unitario es requerido" })
    .nonnegative("El precio unitario no puede ser negativo"),
  observations: z.string().default(""),
});

type DetailFormData = z.infer<typeof detailFormSchema>;

export type { DetailFormData };

interface WarehouseDocumentDetailSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DetailFormData) => void;
  products: ProductResource[];
  initialData?: {
    product_id: string;
    quantity_sacks: number;
    quantity_kg?: number;
    unit_price: number;
    observations: string;
  };
  isEditing?: boolean;
}

export default function WarehouseDocumentDetailSheet({
  open,
  onClose,
  onSave,
  products,
  initialData,
  isEditing = false,
}: WarehouseDocumentDetailSheetProps) {
  const form = useForm<DetailFormData>({
    resolver: zodResolver(detailFormSchema) as any,
    defaultValues: {
      product_id: "",
      quantity_sacks: 0,
      quantity_kg: undefined,
      unit_price: 0,
      observations: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({
          product_id: "",
          quantity_sacks: 0,
          quantity_kg: undefined,
          unit_price: 0,
          observations: "",
        });
      }
    }
  }, [initialData, open, form]);

  const handleSubmit = (data: DetailFormData) => {
    onSave(data);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={isEditing ? "Editar Producto" : "Agregar Producto"}
      icon="Package"
      modal={false}
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="flex flex-col gap-4">
          <FormSelect
            control={form.control as any}
            name="product_id"
            label="Producto"
            placeholder="Seleccione un producto"
            options={products.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            strictFilter
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control as any}
              name="quantity_sacks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad (Sacos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="quantity_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad (Kg) - Opcional</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : parseFloat(value) || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control as any}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Unitario</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones del producto"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
}
