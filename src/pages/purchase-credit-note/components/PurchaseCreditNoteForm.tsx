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
  purchaseCreditNoteSchemaCreate,
  type PurchaseCreditNoteSchema,
  type PurchaseCreditNoteDetailSchema,
} from "../lib/purchase-credit-note.schema";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSwitch } from "@/components/FormSwitch";
import type { PurchaseResource } from "@/pages/purchase/lib/purchase.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  NC_DOCUMENT_TYPES,
  NC_CURRENCIES,
} from "../lib/purchase-credit-note.interface";
import { GroupFormSection } from "@/components/GroupFormSection";
import {
  FileText,
  ShoppingCart,
  FileCheck,
  MessageSquare,
  DollarSign,
  Package,
} from "lucide-react";

interface PurchaseCreditNoteFormProps {
  defaultValues: Partial<PurchaseCreditNoteSchema>;
  onSubmit: (data: PurchaseCreditNoteSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  purchases?: Array<{ value: string; label: string }>;
  suppliers?: Array<{ value: string; label: string }>;
  warehouses?: Array<{ value: string; label: string }>;
  creditNoteTypes?: Array<{ value: string; label: string }>;
  selectedPurchase?: PurchaseResource | null;
  onPurchaseChange?: (purchaseId: number | null) => void;
}

export const PurchaseCreditNoteForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  purchases = [],
  suppliers = [],
  warehouses = [],
  creditNoteTypes = [],
  selectedPurchase,
  onPurchaseChange,
}: PurchaseCreditNoteFormProps) => {
  const form = useForm<PurchaseCreditNoteSchema>({
    resolver: zodResolver(purchaseCreditNoteSchemaCreate),
    defaultValues: {
      is_detailed: true,
      purchase_id: "",
      supplier_id: "0",
      warehouse_id: "",
      document_type: "FACTURA",
      issue_date: format(new Date(), "yyyy-MM-dd"),
      affected_document_type: "FACTURA",
      affected_document_number: "",
      affected_issue_date: format(new Date(), "yyyy-MM-dd"),
      credit_note_type_id: "0",
      credit_note_description: "",
      currency: "PEN",
      observations: "",
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      details: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const isDetailed = form.watch("is_detailed");
  const watchPurchaseId = form.watch("purchase_id");
  const watchSubtotal = form.watch("subtotal");

  // Cuando cambia purchase_id, notificar al padre
  useEffect(() => {
    if (isDetailed && watchPurchaseId) {
      const purchaseId = Number(watchPurchaseId);
      onPurchaseChange?.(purchaseId);
    } else if (isDetailed) {
      onPurchaseChange?.(null);
    }
  }, [watchPurchaseId, onPurchaseChange, isDetailed]);

  // Cuando cambia la compra seleccionada, cargar sus detalles
  useEffect(() => {
    if (selectedPurchase?.details && isDetailed) {
      const mappedDetails: PurchaseCreditNoteDetailSchema[] =
        selectedPurchase.details.map((detail) => ({
          purchase_detail_id: detail.id,
          product_id: detail.product.id,
          quantity_sacks: detail.quantity_sacks || 0,
          quantity_kg: detail.quantity_kg || 0,
          unit_price: detail.unit_price,
          description: "",
          selected: false,
        }));
      replace(mappedDetails);

      // Auto-fill supplier and warehouse
      form.setValue(
        "supplier_id",
        selectedPurchase.supplier_id.toString(),
      );
      form.setValue(
        "warehouse_id",
        selectedPurchase.warehouse_id.toString(),
      );

      // Auto-fill affected document fields from purchase
      form.setValue("affected_document_type", selectedPurchase.document_type);
      form.setValue("affected_document_number", selectedPurchase.document_number);
      form.setValue(
        "affected_issue_date",
        format(new Date(selectedPurchase.issue_date), "yyyy-MM-dd"),
      );
    } else if (isDetailed) {
      replace([]);
    }
  }, [selectedPurchase, replace, isDetailed]);

  // Calcular IGV y total automáticamente en modo consolidado
  useEffect(() => {
    if (!isDetailed && watchSubtotal !== undefined) {
      const subtotal = Number(watchSubtotal) || 0;
      const igv = subtotal * 0.18;
      const total = subtotal * 1.18;

      form.setValue("tax_amount", Number(igv.toFixed(2)));
      form.setValue("total_amount", Number(total.toFixed(2)));
    }
  }, [watchSubtotal, isDetailed, form]);

  // Limpiar al cambiar modo
  useEffect(() => {
    if (!isDetailed) {
      replace([]);
      form.setValue("purchase_id", "");
    } else {
      form.setValue("subtotal", 0);
      form.setValue("tax_amount", 0);
      form.setValue("total_amount", 0);
    }
  }, [isDetailed]);

  const handleSubmit = (data: PurchaseCreditNoteSchema) => {
    if (data.is_detailed && data.details) {
      const filteredDetails = data.details
        .filter((detail) => detail.selected)
        .map(({ selected, ...rest }) => rest);
      onSubmit({
        ...data,
        details: filteredDetails as any,
      });
    } else {
      onSubmit({
        ...data,
        details: undefined,
      });
    }
  };

  const documentTypeOptions = NC_DOCUMENT_TYPES.map((dt) => ({
    value: dt.value,
    label: dt.label,
  }));

  const currencyOptions = NC_CURRENCIES.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full"
      >
        {/* Modo de NC */}
        <GroupFormSection
          title="Tipo de Nota de Crédito"
          icon={FileText}
          cols={{ sm: 1, md: 1 }}
        >
          <FormSwitch
            control={form.control}
            name="is_detailed"
            label="Modo de Nota de Crédito"
            text={
              isDetailed
                ? "Detallada - Asociada a una compra específica"
                : "Consolidada - Sin compra asociada (montos manuales)"
            }
          />
        </GroupFormSection>

        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={ShoppingCart}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          {isDetailed && (
            <FormSelect
              control={form.control}
              name="purchase_id"
              label="Compra"
              placeholder="Seleccione una compra"
              options={purchases}
            />
          )}

          <FormSelect
            control={form.control}
            name="supplier_id"
            label="Proveedor"
            placeholder="Seleccione un proveedor"
            options={suppliers}
            disabled={isDetailed && !!selectedPurchase}
          />

          <FormSelect
            control={form.control}
            name="warehouse_id"
            label="Almacén"
            placeholder="Seleccione un almacén"
            options={warehouses}
            disabled={isDetailed && !!selectedPurchase}
          />

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
            placeholder="Seleccione la fecha"
          />

          <FormSelect
            control={form.control}
            name="document_type"
            label="Tipo Doc. NC"
            placeholder="Seleccione tipo"
            options={documentTypeOptions}
          />

          <FormSelect
            control={form.control}
            name="credit_note_type_id"
            label="Tipo de Nota de Crédito"
            placeholder="Seleccione tipo NC"
            options={creditNoteTypes}
          />

          <FormSelect
            control={form.control}
            name="currency"
            label="Moneda"
            placeholder="Seleccione moneda"
            options={currencyOptions}
          />
        </GroupFormSection>

        {/* Documento Afectado */}
        <GroupFormSection
          title="Documento Afectado"
          icon={FileCheck}
          cols={{ sm: 1, md: 3 }}
        >
          <FormSelect
            control={form.control}
            name="affected_document_type"
            label="Tipo Doc. Afectado"
            placeholder="Seleccione tipo"
            options={documentTypeOptions}
          />

          <FormField
            control={form.control}
            name="affected_document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° Doc. Afectado</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: F001-00001234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DatePickerFormField
            control={form.control}
            name="affected_issue_date"
            label="Fecha Doc. Afectado"
            placeholder="Seleccione la fecha"
          />
        </GroupFormSection>

        {/* Descripciones */}
        <GroupFormSection
          title="Descripciones"
          icon={MessageSquare}
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="credit_note_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción de la nota de crédito"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
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
                    placeholder="Ingrese observaciones adicionales"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Resumen de la compra seleccionada (modo detallada) */}
        {isDetailed && selectedPurchase && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de la Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-semibold">
                    {selectedPurchase.document_type}{" "}
                    {selectedPurchase.document_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-semibold">
                    {new Date(selectedPurchase.issue_date).toLocaleDateString(
                      "es-PE",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <p className="font-semibold">
                    {selectedPurchase.supplier_fullname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Almacén</p>
                  <p className="font-semibold">
                    {selectedPurchase.warehouse_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-lg">
                    {selectedPurchase.currency === "USD" ? "$" : "S/."}{" "}
                    {parseFloat(
                      selectedPurchase.total_amount.toString(),
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    color={
                      selectedPurchase.status === "PAGADA"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedPurchase.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Montos consolidada */}
        {!isDetailed && (
          <GroupFormSection
            title="Montos"
            icon={DollarSign}
            cols={{ sm: 1, md: 3 }}
          >
            <FormField
              control={form.control}
              name="subtotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtotal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
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
              name="tax_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IGV</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
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
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </GroupFormSection>
        )}

        {/* Detalles seleccionables (modo detallada) */}
        {isDetailed && fields.length > 0 && (
          <GroupFormSection
            title="Detalles de la Nota de Crédito"
            icon={Package}
            cols={{ sm: 1, md: 1 }}
          >
            <div className="col-span-full space-y-4">
                {fields.map((field, index) => {
                  const detail = selectedPurchase?.details[index];
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
                                Código: {detail.product.codigo}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                Total Original
                              </p>
                              <p className="font-bold">
                                {selectedPurchase.currency === "USD"
                                  ? "$"
                                  : "S/."}{" "}
                                {parseFloat(detail.total.toString()).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      disabled={
                                        !form.watch(
                                          `details.${index}.selected`,
                                        )
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
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      disabled={
                                        !form.watch(
                                          `details.${index}.selected`,
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">
                                    Máx: {detail.quantity_kg}
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
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      disabled={
                                        !form.watch(
                                          `details.${index}.selected`,
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">
                                    Original:{" "}
                                    {parseFloat(
                                      detail.unit_price.toString(),
                                    ).toFixed(2)}
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`details.${index}.description`}
                              render={({ field: descField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Descripción
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Descripción"
                                      {...descField}
                                      disabled={
                                        !form.watch(
                                          `details.${index}.selected`,
                                        )
                                      }
                                    />
                                  </FormControl>
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
              {form.formState.errors.details && (
                <p className="text-sm text-destructive mt-2">
                  {typeof form.formState.errors.details === "object" &&
                  "root" in form.formState.errors.details
                    ? (form.formState.errors.details as any).root?.message
                    : (form.formState.errors.details as any)?.message}
                </p>
              )}
            </div>
          </GroupFormSection>
        )}

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
