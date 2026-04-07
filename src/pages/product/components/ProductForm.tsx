"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import {
  productSchemaCreate,
  productSchemaUpdate,
  type ProductSchema,
} from "../lib/product.schema";
import { Loader, Info, Weight, Save, X } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { UnitResource } from "@/pages/unit/lib/unit.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { ProductTypeResource } from "@/pages/product-type/lib/product-type.interface";
import type { CompanyResource } from "@/pages/company/lib/company.interface";
import type { ProductResource } from "../lib/product.interface";

interface ProductFormProps {
  defaultValues: Partial<ProductSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  companies: CompanyResource[];
  units: UnitResource[];
  productTypes: ProductTypeResource[];
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
  units,
  productTypes,
  suppliers,
}: ProductFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? productSchemaCreate : productSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const pricePerKg = form.watch("price_per_kg");

  useEffect(() => {
    if (pricePerKg === undefined || pricePerKg === null) return;

    const parsedPrice = Number(pricePerKg);
    const hasPricePerKg = String(pricePerKg).trim() !== "" && parsedPrice > 0;

    if (hasPricePerKg && !form.getValues("is_kg")) {
      form.setValue("is_kg", true, { shouldDirty: true, shouldValidate: true });
    }
  }, [pricePerKg, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        {/* Form Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            type="submit"
            variant="outline"
            colorIcon="green"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            <X /> Cancelar
          </Button>
        </div>

        {/* Información Básica */}
        <GroupFormSection
          title="Información Básica"
          icon={Info}
          gap="gap-3"
          cols={{ sm: 1 }}
          horizontal
        >
          <FormInput
            control={form.control}
            name="codigo"
            label="Código"
            placeholder="Ej: PROD-001"
            uppercase
          />

          <FormInput
            control={form.control}
            name="name"
            label="Nombre del Producto"
            placeholder="Ej: Producto de ejemplo"
            uppercase
          />

          <FormSelect
            control={form.control}
            name="company_id"
            label="Empresa"
            placeholder="Seleccione una empresa"
            options={companies.map((company) => ({
              value: company.id.toString(),
              label: company.social_reason,
              description: company.trade_name,
            }))}
            withValue
          />

          <FormSelect
            control={form.control}
            name="product_type_id"
            label="Tipo de Producto"
            placeholder="Seleccione el tipo"
            options={productTypes.map((type) => ({
              value: type.id.toString(),
              label: type.name,
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
                supplier.business_name ??
                `${supplier.names} ${supplier.father_surname} ${supplier.mother_surname}`.trim(),
            }))}
          />

          <FormSwitch
            control={form.control}
            name="is_taxed"
            label="Impuestos"
            text="¿Está Gravado?"
          />
        </GroupFormSection>

        {/* Peso y Precio por Kg */}
        <GroupFormSection
          title="Información de Peso"
          icon={Weight}
          cols={{ sm: 1 }}
          horizontal
        >
          <FormInput
            control={form.control}
            name="weight"
            label="Peso"
            type="number"
            step="0.01"
            min={0}
            placeholder="0.00"
          />

          <FormSwitch
            control={form.control}
            name="is_kg"
            label="Unidad de Medida"
            text="Venta por Kilogramo"
          />

          <FormInput
            control={form.control}
            name="price_per_kg"
            label="Precio por Kg"
            type="number"
            step="0.01"
            min={0}
            placeholder="0.00"
          />
        </GroupFormSection>
      </form>
    </Form>
  );
};
