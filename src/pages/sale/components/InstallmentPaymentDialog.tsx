"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/FormInput";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { SaleInstallmentResource } from "../lib/sale.interface";
import { createSalePayment } from "../lib/sale.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { dateStringSchema } from "@/lib/core.schema";
import { format } from "date-fns";

const paymentFormSchema = z.object({
  payment_date: dateStringSchema("Fecha de Pago"),
  amount_cash: z.coerce.string().optional(),
  amount_card: z.coerce.string().optional(),
  amount_yape: z.coerce.string().optional(),
  amount_plin: z.coerce.string().optional(),
  amount_deposit: z.coerce.string().optional(),
  amount_transfer: z.coerce.string().optional(),
  amount_other: z.coerce.string().optional(),
  observation: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface InstallmentPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  installment: SaleInstallmentResource | null;
  currency: string;
  onSuccess: () => void;
}

export default function InstallmentPaymentDialog({
  open,
  onClose,
  installment,
  currency,
  onSuccess,
}: InstallmentPaymentDialogProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as any,
    defaultValues: {
      payment_date: format(new Date(), "yyyy-MM-dd"),
      amount_cash: "",
      amount_card: "",
      amount_yape: "",
      amount_plin: "",
      amount_deposit: "",
      amount_transfer: "",
      amount_other: "",
      observation: "",
    },
  });

  const { watch, reset } = form;
  const formValues = watch();

  useEffect(() => {
    if (open) {
      reset({
        payment_date: format(new Date(), "yyyy-MM-dd"),
        amount_cash: "",
        amount_card: "",
        amount_yape: "",
        amount_plin: "",
        amount_deposit: "",
        amount_transfer: "",
        amount_other: "",
        observation: "",
      });
    }
  }, [open, reset]);

  const calculateTotal = () => {
    return (
      parseFloat(formValues.amount_cash || "0") +
      parseFloat(formValues.amount_card || "0") +
      parseFloat(formValues.amount_yape || "0") +
      parseFloat(formValues.amount_plin || "0") +
      parseFloat(formValues.amount_deposit || "0") +
      parseFloat(formValues.amount_transfer || "0") +
      parseFloat(formValues.amount_other || "0")
    );
  };

  const onSubmit = async (data: PaymentFormValues) => {
    if (!installment) return;

    const total = calculateTotal();
    const pendingAmount = installment.pending_amount;

    if (total === 0) {
      errorToast("Debe ingresar al menos un monto de pago");
      return;
    }

    if (total > pendingAmount) {
      errorToast(
        `El monto total (${currency} ${total.toFixed(
          2
        )}) excede el monto pendiente (${currency} ${pendingAmount.toFixed(2)})`
      );
      return;
    }

    try {
      await createSalePayment(installment.id, {
        payment_date: data.payment_date ?? format(new Date(), "yyyy-MM-dd"),
        amount_cash: parseFloat(data.amount_cash || "0"),
        amount_card: parseFloat(data.amount_card || "0"),
        amount_yape: parseFloat(data.amount_yape || "0"),
        amount_plin: parseFloat(data.amount_plin || "0"),
        amount_deposit: parseFloat(data.amount_deposit || "0"),
        amount_transfer: parseFloat(data.amount_transfer || "0"),
        amount_other: parseFloat(data.amount_other || "0"),
        observation: data.observation || "",
      });

      successToast("Pago registrado correctamente");
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al registrar el pago"
      );
    }
  };

  if (!installment) return null;

  const total = calculateTotal();
  const pendingAmount = installment.pending_amount;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Registrar Pago - Cuota ${installment.installment_number}`}
      subtitle="Ingresa los detalles del pago para esta cuota"
      size="2xl"
      icon="Wallet"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Installment Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Monto de la Cuota
              </span>
              <span className="font-semibold">
                {currency} {installment.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Monto Pendiente
              </span>
              <span className="font-semibold text-orange-600">
                {currency} {pendingAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Date */}
          <DatePickerFormField
            control={form.control}
            name="payment_date"
            label="Fecha de Pago"
            placeholder="Selecciona la fecha de pago"
            disabledRange={{ after: new Date() }}
          />

          {/* Payment Methods */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Métodos de Pago
            </p>
            <div className="grid grid-cols-4 gap-4">
              <FormInput
                control={form.control}
                name="amount_cash"
                label="Efectivo"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="amount_card"
                label="Tarjeta"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="amount_yape"
                label="Yape"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="amount_plin"
                label="Plin"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="amount_deposit"
                label="Depósito"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="amount_transfer"
                label="Transferencia"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              <div className="col-span-2">
                <FormInput
                  control={form.control}
                  name="amount_other"
                  label="Otro"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total a Pagar</span>
              <span
                className={`text-xl font-bold ${
                  total > pendingAmount ? "text-red-600" : "text-primary"
                }`}
              >
                {currency} {total.toFixed(2)}
              </span>
            </div>
            {total > pendingAmount && (
              <p className="text-sm text-red-600 mt-2">
                El total excede el monto pendiente
              </p>
            )}
            {total > 0 && total <= pendingAmount && (
              <p className="text-sm text-muted-foreground mt-2">
                Pendiente después del pago: {currency}{" "}
                {(pendingAmount - total).toFixed(2)}
              </p>
            )}
          </div>

          {/* Observation */}
          <FormInput
            control={form.control}
            name="observation"
            label="Observación"
            placeholder="Ingrese una observación (opcional)"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || total === 0 || total > pendingAmount}
            >
              {isSubmitting ? "Registrando..." : "Registrar Pago"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralSheet>
  );
}
