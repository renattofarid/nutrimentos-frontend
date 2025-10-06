import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingSchemaCreate,
  SettingSchemaCreate,
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
import { useEffect } from "react";
import { SettingResource } from "../lib/setting.interface";
import { useBranches } from "@/pages/branch/lib/branch.hook";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface SettingFormProps {
  defaultValues: Partial<SettingResource>;
  onSubmit: (data: SettingSchemaCreate) => void;
  isEdit?: boolean;
  isPending?: boolean;
}

export const SettingForm = ({
  defaultValues,
  onSubmit,
  isPending,
}: SettingFormProps) => {
  const { data: branches } = useBranches();

  const form = useForm<SettingSchemaCreate>({
    resolver: zodResolver(settingSchemaCreate),
    defaultValues: {
      branch_id: defaultValues.branch_id?.toString() || "",
      allow_multiple_prices: defaultValues.allow_multiple_prices === 1,
      allow_invoice: defaultValues.allow_invoice === 1,
      allow_negative_stock: defaultValues.allow_negative_stock === 1,
      default_currency: defaultValues.default_currency || "USD",
      tax_percentage: defaultValues.tax_percentage || "",
    },
  });

  useEffect(() => {
    form.reset({
      branch_id: defaultValues.branch_id?.toString() || "",
      allow_multiple_prices: defaultValues.allow_multiple_prices === 1,
      allow_invoice: defaultValues.allow_invoice === 1,
      allow_negative_stock: defaultValues.allow_negative_stock === 1,
      default_currency: defaultValues.default_currency || "USD",
      tax_percentage: defaultValues.tax_percentage || "",
    });
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="branch_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sucursal</FormLabel>
              <FormControl>
                <SearchableSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={
                    branches?.map((branch) => ({
                      value: branch.id.toString(),
                      label: branch.name,
                    })) || []
                  }
                  placeholder="Selecciona una sucursal"
                  emptyMessage="No se encontraron sucursales"
                  searchPlaceholder="Buscar sucursal..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moneda por Defecto</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: USD, PEN, EUR" />
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

        <FormField
          control={form.control}
          name="allow_multiple_prices"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
};
