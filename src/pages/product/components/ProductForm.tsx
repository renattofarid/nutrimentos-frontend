"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  productSchemaCreate,
  productSchemaUpdate,
  type ProductSchema,
} from "../lib/product.schema";
import { Loader } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import type { ProductResource } from "../lib/product.interface";
import type { CategoryResource } from "@/pages/category/lib/category.interface";
import type { BrandResource } from "@/pages/brand/lib/brand.interface";
import type { UnitResource } from "@/pages/unit/lib/unit.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { Switch } from "@/components/ui/switch";
import type { CompanyResource } from "@/pages/company/lib/company.interface";

interface ProductFormProps {
  defaultValues: Partial<ProductSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  companies: CompanyResource[];
  categories: CategoryResource[];
  brands: BrandResource[];
  units: UnitResource[];
  suppliers: PersonResource[];
  product?: ProductResource;
}

export const ProductForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  companies,
  categories,
  brands,
  units,
  suppliers,
  product,
}: ProductFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? productSchemaCreate : productSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Información Básica */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      placeholder="Ej: PROD-001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      placeholder="Ej: Producto de ejemplo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSelect
              control={form.control}
              name="company_id"
              label="Empresa"
              placeholder="Seleccione una empresa"
              options={companies.map((company) => ({
                value: company.id.toString(),
                label: company.social_reason,
              }))}
            />

            <FormSelect
              control={form.control}
              name="category_id"
              label="Categoría"
              placeholder="Seleccione una categoría"
              options={categories.map((category) => ({
                value: category.id.toString(),
                label: `${"  ".repeat(Math.max(0, category.level - 1))}${
                  category.name
                }`,
              }))}
            />

            <FormSelect
              control={form.control}
              name="product_type_id"
              label="Tipo de Producto"
              placeholder="Seleccione el tipo"
              options={[
                { value: "1", label: "Normal" },
                { value: "2", label: "Kit" },
                { value: "3", label: "Servicio" },
              ]}
            />

            <FormSelect
              control={form.control}
              name="brand_id"
              label="Marca"
              placeholder="Seleccione una marca"
              options={brands.map((brand) => ({
                value: brand.id.toString(),
                label: brand.name,
              }))}
            />

            <FormSelect
              control={form.control}
              name="unit_id"
              label="Unidad"
              placeholder="Seleccione una unidad"
              options={units.map((unit) => ({
                value: unit.id.toString(),
                label: unit.name,
              }))}
            />

            <FormSelect
              control={form.control}
              name="supplier_id"
              label="Proveedor"
              placeholder="Seleccione un proveedor"
              options={suppliers.map((supplier) => ({
                value: supplier.id.toString(),
                label:
                  `${supplier.names} ${supplier.father_surname} ${supplier.mother_surname}`.trim() ||
                  supplier.business_name,
              }))}
            />

            <FormField
              control={form.control}
              name="is_taxed"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>¿Está Gravado?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 1}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 1 : 0)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Precios y Costos */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Precios y Costos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="purchase_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Compra</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Venta</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      type="number"
                      step="0.01"
                      placeholder="60.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profit_margin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Margen de Ganancia (%)</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      type="number"
                      step="0.01"
                      placeholder="20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accounting_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Contable (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inventory_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo de Inventario (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      type="number"
                      step="0.01"
                      placeholder="45.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commission_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comisión (%) (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      type="number"
                      step="0.01"
                      placeholder="5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Peso y Medidas */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Peso y Medidas (Opcional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      type="number"
                      step="0.01"
                      placeholder="2.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price_per_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio por Kg</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      type="number"
                      step="0.01"
                      placeholder="20.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Comentarios */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Comentarios (Opcional)</h3>
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Este es un producto de prueba"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
