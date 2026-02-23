"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { GeneralModal } from "@/components/GeneralModal";
import { useEffect } from "react";

const weightRangeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  min_weight: z.number().min(0, "El peso mínimo debe ser mayor o igual a 0"),
  max_weight: z.number().nullable(),
});

type WeightRangeSchema = z.infer<typeof weightRangeSchema>;

interface AddWeightRangeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WeightRangeSchema) => void;
}

export const AddWeightRangeModal = ({
  open,
  onClose,
  onSubmit,
}: AddWeightRangeModalProps) => {
  const form = useForm<WeightRangeSchema>({
    resolver: zodResolver(weightRangeSchema),
    defaultValues: {
      name: "",
      min_weight: 0,
      max_weight: null,
    },
  });

  const handleSubmit = (data: WeightRangeSchema) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const { watch, setValue } = form;
  const minWeight = watch("min_weight");
  const maxWeight = watch("max_weight");

  useEffect(() => {
    setValue(
      "name",
      maxWeight ? `${minWeight}-${maxWeight}kg` : `+${minWeight}kg`,
    );
  }, [minWeight, maxWeight]);

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Agregar Rango de Peso"
      subtitle="Complete los campos para agregar un nuevo rango de peso"
      icon="Weight"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="min_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Mínimo (kg) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : parseFloat(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Máximo (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Sin límite (dejar vacío)"
                    value={field.value === null ? "" : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value),
                      )
                    }
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
                <FormLabel>Nombre del Rango *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 0-300kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="neutral" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Rango</Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
