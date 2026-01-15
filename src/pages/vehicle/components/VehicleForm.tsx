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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  vehicleSchemaCreate,
  vehicleSchemaUpdate,
  type VehicleSchema,
} from "../lib/vehicle.schema.ts";
import { Loader } from "lucide-react";
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { FormSelect } from "@/components/FormSelect";
import { FormInput } from "@/components/FormInput";
import type { Option } from "@/lib/core.interface";

interface VehicleFormProps {
  defaultValues: Partial<VehicleSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const VehicleForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: VehicleFormProps) => {
  const { data: suppliers } = useAllSuppliers();

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? vehicleSchemaCreate : vehicleSchemaUpdate
    ),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      vehicle_type: "",
      max_weight: 0,
      owner_id: "",
      observations: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Convertir suppliers a opciones para FormSelect
  const supplierOptions: Option[] =
    suppliers?.map((supplier) => ({
      value: supplier.id.toString(),
      label: `${supplier.names} ${supplier.father_surname} ${supplier.mother_surname}`,
    })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <FormInput
            control={form.control}
            name="plate"
            label="Placa"
            placeholder="Ej: ABC-123"
            className="font-mono uppercase"
            maxLength={20}
            onChange={(value) => form.setValue("plate", value.toUpperCase())}
          />

          <FormInput
            control={form.control}
            name="brand"
            label="Marca"
            placeholder="Ej: HYUNDAI"
          />

          <FormInput
            control={form.control}
            name="model"
            label="Modelo"
            placeholder="Ej: MODELO 1"
          />

          <FormInput
            control={form.control}
            name="year"
            label="Año"
            type="number"
            placeholder="Ej: 2020"
          />

          <FormInput
            control={form.control}
            name="color"
            label="Color"
            placeholder="Ej: negro"
          />

          <FormInput
            control={form.control}
            name="vehicle_type"
            label="Tipo de Vehículo"
            placeholder="Ej: carga"
          />

          <FormInput
            control={form.control}
            name="max_weight"
            label="Peso Máximo (kg)"
            type="number"
            placeholder="Ej: 100"
          />

          <FormSelect
            control={form.control}
            name="owner_id"
            label="Proveedor"
            placeholder="Seleccione un proveedor"
            options={supplierOptions}
          />

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>

         <Button
            size="sm"
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
