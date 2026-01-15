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
import { format } from "date-fns";

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
      sale_id: "0",
      issue_date: format(new Date(), "yyyy-MM-dd"),
      credit_note_motive_id: "0",
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
          quantity_sacks: detail.quantity_sacks || 0,
          quantity_kg: detail.quantity_kg || 0,
          unit_price: detail.unit_price,
          selected: false,
        })
      );
      replace(mappedDetails);
    } else {
      replace([]);
    }
  }, [selectedSale, replace]);

  // Handler para transformar los datos antes de enviar
  const handleSubmit = (data: CreditNoteSchema) => {
    // Filtrar solo los detalles seleccionados y remover el campo 'selected'
    const filteredDetails = data.details
      .filter((detail) => detail.selected)
      .map(({ selected, ...rest }) => rest);

    // Enviar los datos transformados
    onSubmit({
      ...data,
      details: filteredDetails as any,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full"
      >
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
            </CardContent>
          </Card>
        )}

        {/* Detalles seleccionables para la nota de crédito */}
        {fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Detalles de la Nota de Crédito
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Seleccione los productos y ajuste las cantidades/precios para
                incluir en la nota de crédito
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const detail = selectedSale?.details[index];
                  if (!detail) return null;

                  return (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <FormField
                          control={form.control}
                          name={`details.${index}.selected`}
                          render={({ field: checkboxField }) => (
                            <FormItem className="flex items-center space-y-0 pt-2">
                              <FormControl>
                                <Checkbox
                                  checked={checkboxField.value}
                                  onCheckedChange={checkboxField.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">
                                {detail.product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Código: {detail.product.codigo} | Unidad:{" "}
                                {detail.product.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                Total Original
                              </p>
                              <p className="font-bold">
                                {selectedSale.currency === "USD" ? "$" : "S/."}{" "}
                                {parseFloat(detail.total.toString()).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <FormField
                              control={form.control}
                              name={`details.${index}.quantity_sacks`}
                              render={({ field: qtySacksField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Cantidad Sacos
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0"
                                      {...qtySacksField}
                                      onChange={(e) =>
                                        qtySacksField.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      disabled={
                                        !form.watch(`details.${index}.selected`)
                                      }
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">
                                    Máx: {detail.quantity_sacks}
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`details.${index}.quantity_kg`}
                              render={({ field: qtyKgField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Cantidad Kg
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0"
                                      {...qtyKgField}
                                      onChange={(e) =>
                                        qtyKgField.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      disabled={
                                        !form.watch(`details.${index}.selected`)
                                      }
                                    />
                                  </FormControl>
                                  <p>
                                    <span className="text-xs text-muted-foreground">
                                      Máx: {detail.quantity_kg}
                                    </span>
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`details.${index}.unit_price`}
                              render={({ field: priceField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Precio Unitario
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...priceField}
                                      onChange={(e) =>
                                        priceField.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      disabled={
                                        !form.watch(`details.${index}.selected`)
                                      }
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">
                                    Original:{" "}
                                    {parseFloat(
                                      detail.unit_price.toString()
                                    ).toFixed(2)}
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {form.formState.errors.details?.root && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.details.root.message}
                </p>
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
