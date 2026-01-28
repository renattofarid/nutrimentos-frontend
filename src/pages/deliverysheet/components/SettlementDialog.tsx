"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  settlementSchema,
  type SettlementSchema,
} from "../lib/deliverysheet.schema";
import type { DeliverySheetSale } from "../lib/deliverysheet.interface";
import { Badge } from "@/components/ui/badge";
import GeneralSheet from "@/components/GeneralSheet";

interface SettlementDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SettlementSchema) => void;
  isSubmitting?: boolean;
  sales: DeliverySheetSale[];
}

const DELIVERY_STATUS_OPTIONS = [
  { value: "ENTREGADO", label: "Entregado" },
  { value: "NO_ENTREGADO", label: "No Entregado" },
  { value: "DEVUELTO", label: "Devuelto" },
];

export function SettlementDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  sales,
}: SettlementDialogProps) {
  const form = useForm<SettlementSchema>({
    resolver: zodResolver(settlementSchema) as any,
    defaultValues: {
      sales: sales.map((sale) => ({
        sale_id: sale.id,
        delivery_status: sale.delivery_status,
        delivery_notes: sale.delivery_notes || "",
      })),
    },
  });

  const handleStatusChange = (index: number, status: string) => {
    form.setValue(`sales.${index}.delivery_status`, status);
  };

  const handleNotesChange = (index: number, notes: string) => {
    form.setValue(`sales.${index}.delivery_notes`, notes);
  };

  const handleFormSubmit = (data: SettlementSchema) => {
    onSubmit(data);
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Rendición de Planilla"
      subtitle="Registre el estado de entrega de cada venta"
      size="4xl"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            {sales.map((sale, index) => {
              const formValues = form.watch(`sales.${index}`);
              return (
                <div key={sale.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {sale.document_type}
                        </span>
                        <span className="font-mono font-semibold">
                          {sale.full_document_number}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sale.customer?.full_name}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      S/. {sale.total_amount}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Estado de Entrega
                    </label>
                    <Select
                      value={
                        formValues?.delivery_status || sale.delivery_status
                      }
                      onValueChange={(value) =>
                        handleStatusChange(index, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {DELIVERY_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Notas de Entrega
                    </label>
                    <Textarea
                      placeholder="Notas de entrega..."
                      className="resize-y min-h-[80px]"
                      value={formValues?.delivery_notes || ""}
                      onChange={(e) => handleNotesChange(index, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Rendición
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
}
