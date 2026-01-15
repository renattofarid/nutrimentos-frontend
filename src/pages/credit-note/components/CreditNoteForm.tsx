import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  creditNoteSchemaCreate,
  type CreditNoteSchema,
  type CreditNoteDetailSchema,
} from "../lib/credit-note.schema";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSwitch } from "@/components/FormSwitch";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface CreditNoteFormProps {
  defaultValues: Partial<CreditNoteSchema>;
  onSubmit: (data: CreditNoteSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  sales?: Array<{ value: string; label: string }>;
  motives?: Array<{ value: string; label: string }>;
  selectedSale?: SaleResource | null;
  onSaleChange?: (saleId: number | null) => void;
}

export const CreditNoteForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  sales = [],
  motives = [],
  selectedSale,
  onSaleChange,
}: CreditNoteFormProps) => {
  const form = useForm<CreditNoteSchema>({
    resolver: zodResolver(creditNoteSchemaCreate),
    defaultValues: {
      sale_id: undefined,
      issue_date: "",
      credit_note_motive_id: undefined,
      affects_stock: true,
      observations: "",
      details: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "details",
  });

  // Observar cambios en el campo sale_id
  const watchSaleId = form.watch("sale_id");

  useEffect(() => {
    if (watchSaleId) {
      const saleId = Number(watchSaleId);
      onSaleChange?.(saleId);
    } else {
      onSaleChange?.(null);
    }
  }, [watchSaleId, onSaleChange]);

  // Cuando cambia la venta seleccionada, cargar sus detalles
  useEffect(() => {
    if (selectedSale?.details) {
      const mappedDetails: CreditNoteDetailSchema[] = selectedSale.details.map(
        (detail) => ({
          sale_detail_id: detail.id,
          product_id: detail.product_id,
          quantity_sacks: detail.quantity,
          quantity_kg: 0,
          unit_price: detail.unit_price,
          selected: false,
        })
      );
      replace(mappedDetails);
    } else {
      replace([]);
    }
  }, [selectedSale, replace]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <FormSelect
            control={form.control}
            name="sale_id"
            label="Venta"
            placeholder="Seleccione una venta"
            options={sales}
          />

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
            placeholder="Seleccione la fecha"
          />

          <FormSelect
            control={form.control}
            name="credit_note_motive_id"
            label="Motivo"
            placeholder="Seleccione un motivo"
            options={motives}
          />

          <FormSwitch
            control={form.control}
            name="affects_stock"
            label="Afecta Stock"
            text="Indica si la nota de crédito afecta el inventario"
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese observaciones adicionales"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Resumen de la venta seleccionada */}
        {selectedSale && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de la Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-semibold">
                    {selectedSale.document_type} {selectedSale.serie}-
                    {selectedSale.numero}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-semibold">
                    {new Date(selectedSale.issue_date).toLocaleDateString(
                      "es-PE"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">
                    {selectedSale.customer.business_name ||
                      selectedSale.customer.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSale.customer.number_document}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant={
                      selectedSale.status === "PAGADA" ? "default" : "secondary"
                    }
                  >
                    {selectedSale.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="font-semibold">
                    {selectedSale.currency === "USD" ? "$" : "S/."}{" "}
                    {parseFloat(selectedSale.subtotal.toString()).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IGV</p>
                  <p className="font-semibold">
                    {selectedSale.currency === "USD" ? "$" : "S/."}{" "}
                    {parseFloat(selectedSale.tax_amount.toString()).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-lg">
                    {selectedSale.currency === "USD" ? "$" : "S/."}{" "}
                    {parseFloat(selectedSale.total_amount.toString()).toFixed(
                      2
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Pago</p>
                  <Badge variant="outline">{selectedSale.payment_type}</Badge>
                </div>
              </div>

              {/* Detalles de productos */}
              {selectedSale.details && selectedSale.details.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">
                    Productos ({selectedSale.details.length})
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedSale.details.map((detail, index) => (
                      <div
                        key={detail.id || index}
                        className="flex justify-between items-center p-2 bg-background rounded border"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {detail.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {detail.product.codigo} | {detail.quantity}{" "}
                            {detail.product.unit} x{" "}
                            {selectedSale.currency === "USD" ? "$" : "S/."}{" "}
                            {parseFloat(detail.unit_price.toString()).toFixed(
                              2
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {selectedSale.currency === "USD" ? "$" : "S/."}{" "}
                            {parseFloat(detail.total.toString()).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
         <Button
            size="sm"
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
