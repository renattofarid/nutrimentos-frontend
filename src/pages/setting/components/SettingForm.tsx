"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingSchemaCreate,
  type SettingSchemaCreate,
} from "../lib/setting.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { FormSelect } from "@/components/FormSelect";
import { Loader } from "lucide-react";
import FormSkeleton from "@/components/FormSkeleton";

interface SettingFormProps {
  defaultValues: Partial<SettingSchemaCreate>;
  onSubmit: (data: SettingSchemaCreate) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const SettingForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SettingFormProps) => {
  const { data: branches = [], isLoading: isLoadingBranches } =
    useAllBranches();

  const form = useForm<SettingSchemaCreate>({
    resolver: zodResolver(settingSchemaCreate),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  if (isLoadingBranches || !branches) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <FormSelect
            label={"Sucursal"}
            name={"branch_id"}
            control={form.control}
            options={branches.map((branch) => ({
              label: branch.name,
              value: branch.id.toString(),
            }))}
            placeholder="Seleccione una sucursal"
          />

          <FormField
            control={form.control}
            name="default_currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda por Defecto</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    {...field}
                    placeholder="Ej: USD, PEN, EUR"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Porcentaje de Impuesto (%)</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Ej: 18.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-sidebar p-4 rounded-lg">
          <FormField
            control={form.control}
            name="allow_multiple_prices"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Permitir Múltiples Precios</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allow_invoice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Permitir Facturación</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allow_negative_stock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Permitir Stock Negativo</FormLabel>
                </div>
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
