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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import {
  deliverySheetPaymentSchema,
  type DeliverySheetPaymentSchema,
} from "../lib/deliverysheet.schema";
import { GroupFormSection } from "@/components/GroupFormSection";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DeliverySheetPaymentSchema) => void;
  isSubmitting?: boolean;
  pendingAmount: string;
}

export function PaymentDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  pendingAmount,
}: PaymentDialogProps) {
  const [totalPaid, setTotalPaid] = useState(0);

  const form = useForm<DeliverySheetPaymentSchema>({
    resolver: zodResolver(deliverySheetPaymentSchema),
    defaultValues: {
      payment_date: new Date().toISOString().split("T")[0],
      amount_cash: "0",
      amount_card: "0",
      amount_yape: "0",
      amount_plin: "0",
      amount_deposit: "0",
      amount_transfer: "0",
      amount_other: "0",
      observations: "",
    },
  });

  const watchAmountCash = form.watch("amount_cash");
  const watchAmountCard = form.watch("amount_card");
  const watchAmountYape = form.watch("amount_yape");
  const watchAmountPlin = form.watch("amount_plin");
  const watchAmountDeposit = form.watch("amount_deposit");
  const watchAmountTransfer = form.watch("amount_transfer");
  const watchAmountOther = form.watch("amount_other");

  useEffect(() => {
    const cash = parseFloat(watchAmountCash) || 0;
    const card = parseFloat(watchAmountCard) || 0;
    const yape = parseFloat(watchAmountYape) || 0;
    const plin = parseFloat(watchAmountPlin) || 0;
    const deposit = parseFloat(watchAmountDeposit) || 0;
    const transfer = parseFloat(watchAmountTransfer) || 0;
    const other = parseFloat(watchAmountOther) || 0;

    setTotalPaid(cash + card + yape + plin + deposit + transfer + other);
  }, [
    watchAmountCash,
    watchAmountCard,
    watchAmountYape,
    watchAmountPlin,
    watchAmountDeposit,
    watchAmountTransfer,
    watchAmountOther,
  ]);

  const handleFormSubmit = (data: DeliverySheetPaymentSchema) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pago de Planilla</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Monto Pendiente</p>
            <p className="text-2xl font-bold">S/. {pendingAmount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total a Pagar</p>
            <p className="text-2xl font-bold text-primary">
              S/. {totalPaid.toFixed(2)}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Pago</FormLabel>
                  <FormControl>
                    <DatePickerFormField {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <GroupFormSection
              title="Métodos de Pago"
              description="Ingrese los montos según el método de pago utilizado"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount_cash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Efectivo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_card"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarjeta</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_yape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yape</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_plin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plin</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depósito</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_transfer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transferencia</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Otro</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </GroupFormSection>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones del pago..."
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
              <Button type="submit" disabled={isSubmitting || totalPaid === 0}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Pago
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
