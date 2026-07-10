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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  menuGroupSchemaCreate,
  menuGroupSchemaUpdate,
  type MenuGroupSchema,
} from "../lib/menuGroup.schema";
import { Loader } from "lucide-react";
import * as LucideReact from "lucide-react";
import type { MenuGroupResource } from "../lib/menuGroup.interface";

interface Props {
  defaultValues: Partial<MenuGroupSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  parentOptions: MenuGroupResource[];
}

export const MenuGroupForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  parentOptions,
}: Props) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? menuGroupSchemaCreate : menuGroupSchemaUpdate
    ),
    defaultValues: {
      name: "",
      icon: "",
      group_menu_id: null,
      ...defaultValues,
    },
    mode: "onChange",
  });

  const iconValue = form.watch("icon");
  const IconPreview = iconValue
    ? (LucideReact[iconValue as keyof typeof LucideReact] as
        | React.ComponentType<any>
        | undefined)
    : undefined;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 gap-4 bg-sidebar p-4 rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Configuración"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícono (nombre de lucide-react)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    {IconPreview && (
                      <div className="bg-primary text-primary-foreground rounded-md p-2">
                        <IconPreview className="size-4" />
                      </div>
                    )}
                    <Input
                      variant="default"
                      placeholder="Ej: Settings"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="group_menu_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo padre (opcional)</FormLabel>
                <Select
                  onValueChange={(v) =>
                    field.onChange(v === "none" ? null : Number(v))
                  }
                  value={field.value ? String(field.value) : "none"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un grupo padre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin grupo padre</SelectItem>
                    {parentOptions.map((group) => (
                      <SelectItem key={group.id} value={String(group.id)}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
