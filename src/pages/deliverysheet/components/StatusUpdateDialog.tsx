"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import {
  deliverySheetStatusSchema,
  type DeliverySheetStatusSchema,
} from "../lib/deliverysheet.schema";

interface StatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DeliverySheetStatusSchema) => void;
  isSubmitting?: boolean;
  currentStatus: string;
  currentDeliveryDate: string;
}

const STATUS_OPTIONS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_REPARTO", label: "En Reparto" },
];

export function StatusUpdateDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  currentStatus,
  currentDeliveryDate,
}: StatusUpdateDialogProps) {
  const form = useForm<DeliverySheetStatusSchema>({
    resolver: zodResolver(deliverySheetStatusSchema),
    defaultValues: {
      status: currentStatus === "PENDIENTE" || currentStatus === "EN_REPARTO"
        ? currentStatus
        : "PENDIENTE",
      delivery_date: currentDeliveryDate,
      observations: "",
    },
  });

  const handleFormSubmit = (data: DeliverySheetStatusSchema) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Actualizar Estado de Planilla</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <FormSelect
                      placeholder="Seleccione un estado"
                      items={STATUS_OPTIONS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Entrega</FormLabel>
                  <FormControl>
                    <DatePickerFormField {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones adicionales..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Estado
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
