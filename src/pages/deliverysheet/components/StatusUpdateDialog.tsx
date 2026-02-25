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
}: StatusUpdateDialogProps) {
  const form = useForm<DeliverySheetStatusSchema>({
    resolver: zodResolver(deliverySheetStatusSchema),
    defaultValues: {
      status: currentStatus === "PENDIENTE" || currentStatus === "EN_REPARTO"
        ? currentStatus
        : "PENDIENTE",
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
            <FormSelect
              control={form.control}
              name="status"
              label="Estado"
              placeholder="Seleccione un estado"
              options={STATUS_OPTIONS}
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
