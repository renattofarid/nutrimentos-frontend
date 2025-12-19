"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/GeneralModal";
import { FormSelect } from "@/components/FormSelect";
import type { ProductResource } from "@/pages/product/lib/product.interface";

const productSchema = z.object({
  product_id: z.string().min(1, "Debe seleccionar un producto"),
});

type ProductSchema = z.infer<typeof productSchema>;

interface AddProductToMatrixModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (productId: number) => void;
  products: ProductResource[];
  selectedProductIds: number[];
}

export const AddProductToMatrixModal = ({
  open,
  onClose,
  onSubmit,
  products,
  selectedProductIds,
}: AddProductToMatrixModalProps) => {
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_id: "",
    },
  });

  // Filtrar productos que ya están seleccionados
  const availableProducts = products.filter(
    (p) => !selectedProductIds.includes(p.id)
  );

  const handleSubmit = (data: ProductSchema) => {
    onSubmit(parseInt(data.product_id));
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Agregar Producto"
      subtitle="Seleccione el producto para agregar a la matriz de precios"
      icon="Package"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormSelect
            control={form.control}
            name="product_id"
            label="Producto"
            placeholder="Seleccione un producto"
            options={availableProducts.map((product) => ({
              value: product.id.toString(),
              label: product.name,
              description: product.codigo,
              searchCode: product.codigo,
            }))}
            enableCodeSearch={true}
          />

          {availableProducts.length === 0 && (
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground text-center">
              No hay más productos disponibles para agregar
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="neutral" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={availableProducts.length === 0}>
              Agregar Producto
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
