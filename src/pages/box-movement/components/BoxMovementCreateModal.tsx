import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useBoxMovementStore } from "../lib/box-movement.store";
import {
  boxMovementSchemaCreate,
  type BoxMovementSchemaCreate,
} from "../lib/box-movement.schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { successToast, errorToast } from "@/lib/core.function";
import { FormSelect } from "@/components/FormSelect";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { useAllPaymentConcepts } from "@/pages/payment-concept/lib/payment-concept.hook";

interface BoxMovementCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boxId: number;
  onSuccess: () => void;
}

export default function BoxMovementCreateModal({
  open,
  onOpenChange,
  boxId,
  onSuccess,
}: BoxMovementCreateModalProps) {
  const { createBoxMovement, isSubmitting } = useBoxMovementStore();
  const { data: persons } = useAllClients();
  const { user } = useAuthStore();

  // Obtener las cajas aperturadas del usuario
  const userBoxes = user?.boxes || [];
  const defaultBoxId = userBoxes.length > 0 ? userBoxes[0].id : boxId;

  const form = useForm<BoxMovementSchemaCreate>({
    resolver: zodResolver(boxMovementSchemaCreate) as any,
    defaultValues: {
      box_id: defaultBoxId,
      customer_id: 0,
      payment_concept_id: 0,
      type: "INGRESO",
      amount_cash: 0,
      amount_deposit: 0,
      amount_yape: 0,
      amount_plin: 0,
      amount_tarjeta: 0,
      amount_other: 0,
      comment: "",
    },
  });

  const onSubmit = async (data: BoxMovementSchemaCreate) => {
    try {
      await createBoxMovement(data);
      successToast("Movimiento registrado exitosamente");
      form.reset();
      onSuccess();
    } catch (error: any) {
      errorToast(
        (error.response.data.message ?? error.response.data.error) ||
          "Error al registrar movimiento"
      );
    }
  };

  const typewatch = form.watch("type");

  const conceptParams = useMemo(() => ({ type: typewatch }), [typewatch]);
  const { data: concepts } = useAllPaymentConcepts(conceptParams);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Caja</DialogTitle>
          <DialogDescription>
            Complete los campos para registrar un nuevo movimiento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                name="box_id"
                control={form.control}
                label="Caja"
                placeholder="Seleccione una caja"
                options={userBoxes.map((box) => ({
                  value: box.id.toString(),
                  label: `${box.name} - ${box.serie}`,
                }))}
              />

              <FormSelect
                name="type"
                control={form.control}
                label="Tipo de Movimiento"
                placeholder="Seleccione el tipo"
                options={[
                  { value: "INGRESO", label: "INGRESO" },
                  { value: "EGRESO", label: "EGRESO" },
                ]}
              />
            </div>

            <FormSelect
              name="customer_id"
              control={form.control}
              label="Cliente"
              placeholder="Seleccione un cliente"
              options={
                persons?.map((person) => ({
                  value: person.id.toString(),
                  label:
                    person.business_name ??
                    person.names +
                      " " +
                      (person.father_surname ?? "") +
                      " " +
                      (person.mother_surname ?? ""),
                })) || []
              }
            />

            <FormSelect
              name="payment_concept_id"
              control={form.control}
              label="Concepto de Pago"
              placeholder="Seleccione un concepto de pago"
              options={
                concepts?.map((concept) => ({
                  value: concept.id.toString(),
                  label: concept.name,
                })) || []
              }
            />

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Métodos de Pago</h3>
              <div className="grid grid-cols-2 gap-4">
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_tarjeta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarjeta</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentario adicional..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar Movimiento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
