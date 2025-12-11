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
import { Button } from "@/components/ui/button";
import { FormSwitch } from "@/components/FormSwitch";
import {
  branchSchemaCreate,
  branchSchemaUpdate,
  type BranchSchema,
} from "../lib/branch.schema.ts";
import { Loader } from "lucide-react";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import { FormSelect } from "@/components/FormSelect";
import { useEffect } from "react";

interface BranchFormProps {
  defaultValues: Partial<BranchSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const BranchForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: BranchFormProps) => {
  const { user } = useAuthStore();
  const {
    data: companies,
    isLoading: loadingCompanies,
    refetch,
  } = useAllCompanies();

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? branchSchemaCreate : branchSchemaUpdate
    ),
    defaultValues: {
      name: "",
      address: "",
      serie: 0,
      phone: "",
      email: "",
      is_invoice: false,
      responsible_id: 0,
      company_id: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  useEffect(() => {
    refetch();
  }, []);

  // Auto-llenar responsible_id con el ID del usuario logueado
  useEffect(() => {
    if (user?.id && mode === "create") {
      form.setValue("responsible_id", user.id);
    }
  }, [user?.id, mode, form]);

  // Preparar opciones para el selector de empresas
  const companyOptions =
    companies?.map((company) => ({
      value: company.id.toString(),
      label: company.trade_name || company.social_reason,
    })) || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Tienda Lima Centro"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Av. Abancay 1234"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serie</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    type="number"
                    placeholder="Ej: 10"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: 987654321"
                    maxLength={9}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    type="email"
                    placeholder="Ej: tienda.lima@empresa.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-full">
            <FormSelect
              name="company_id"
              label="Empresa"
              placeholder="Seleccione una empresa"
              options={companyOptions}
              control={form.control}
              disabled={loadingCompanies}
            />
          </div>

          <div className="col-span-full">
            <FormSwitch
              control={form.control}
              name="is_invoice"
              text="¿Emite factura?"
              textDescription="Marque si esta tienda puede emitir facturas"
              className="h-auto py-2"
            />
          </div>
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting}>
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
