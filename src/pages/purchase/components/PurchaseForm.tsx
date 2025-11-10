"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  purchaseSchemaCreate,
  type PurchaseSchema,
} from "../lib/purchase.schema";
import { Loader, Plus, Trash2 } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { CompanyResource } from "@/pages/company/lib/company.interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

interface PurchaseFormProps {
  defaultValues: Partial<PurchaseSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  companies: CompanyResource[];
  warehouses: WarehouseResource[];
  suppliers: PersonResource[];
  products: ProductResource[];
}

export const PurchaseForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  companies,
  warehouses,
  suppliers,
  products,
}: PurchaseFormProps) => {
  const form = useForm<PurchaseSchema>({
    resolver: zodResolver(purchaseSchemaCreate),
    defaultValues: {
      payment_type: "CONTADO",
      document_type: "BOLETA",
      currency: "PEN",
      include_igv: false,
      details: [{ product_id: 0, quantity: 1, unit_price: 0 }],
      installments: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const paymentType = form.watch("payment_type");

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const {
    fields: installmentFields,
    append: appendInstallment,
    remove: removeInstallment,
  } = useFieldArray({
    control: form.control,
    name: "installments",
  });

  // Limpiar cuotas cuando el tipo de pago no es crédito
  useEffect(() => {
    if (paymentType !== "CREDITO") {
      form.setValue("installments", []);
    }
  }, [paymentType, form]);

  const calculateTotal = () => {
    const details = form.getValues("details") || [];
    return details.reduce((sum, detail) => {
      return sum + (detail.quantity || 0) * (detail.unit_price || 0);
    }, 0);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full max-w-6xl mx-auto"
      >
        {/* Información General */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              control={form.control}
              name="company_id"
              label="Empresa"
              placeholder="Seleccione una empresa"
              options={companies.map((company) => ({
                value: company.id.toString(),
                label: company.social_reason,
              }))}
            />

            <FormSelect
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Seleccione un almacén"
              options={warehouses.map((warehouse) => ({
                value: warehouse.id.toString(),
                label: warehouse.name,
              }))}
            />

            <FormSelect
              control={form.control}
              name="supplier_id"
              label="Proveedor"
              placeholder="Seleccione un proveedor"
              options={suppliers.map((supplier) => ({
                value: supplier.id.toString(),
                label:
                  supplier.business_name ||
                  `${supplier.names} ${supplier.father_surname} ${supplier.mother_surname}`.trim(),
              }))}
            />
          </div>
        </div>

        {/* Información del Documento */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Información del Documento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BOLETA">Boleta</SelectItem>
                      <SelectItem value="FACTURA">Factura</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Documento</FormLabel>
                  <FormControl>
                    <Input
                      variant="primary"
                      placeholder="Ej: B001-00123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issue_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Emisión</FormLabel>
                  <FormControl>
                    <Input variant="primary" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reception_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Recepción</FormLabel>
                  <FormControl>
                    <Input variant="primary" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Vencimiento</FormLabel>
                  <FormControl>
                    <Input variant="primary" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información de Pago */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Información de Pago</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pago</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CONTADO">Contado</SelectItem>
                      <SelectItem value="CREDITO">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione moneda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PEN">Soles (PEN)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="include_igv"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 space-y-0 gap-2">
                  <div className="space-y-0.5">
                    <FormLabel>Incluir IGV</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Detalles de Compra */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Detalles de Compra</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendDetail({ product_id: 0, quantity: 1, unit_price: 0 })
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          <div className="space-y-4">
            {detailFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
              >
                <FormSelect
                  control={form.control}
                  name={`details.${index}.product_id`}
                  label="Producto"
                  placeholder="Seleccione producto"
                  options={products.map((product) => ({
                    value: product.id.toString(),
                    label: `${product.codigo} - ${product.name}`,
                  }))}
                />

                <FormField
                  control={form.control}
                  name={`details.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          variant="primary"
                          type="number"
                          step="0.01"
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
                  name={`details.${index}.unit_price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Unitario</FormLabel>
                      <FormControl>
                        <Input
                          variant="primary"
                          type="number"
                          step="0.01"
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

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDetail(index)}
                    disabled={detailFields.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end p-4 bg-muted rounded-lg">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                {form.watch("currency") === "PEN" ? "S/." : "$"}{" "}
                {calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Cuotas (solo si es crédito) */}
        {paymentType === "CREDITO" && (
          <div className="bg-sidebar p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Cuotas</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendInstallment({ due_days: 30, amount: 0 })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Cuota
              </Button>
            </div>

            <div className="space-y-4">
              {installmentFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`installments.${index}.due_days`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Días de Vencimiento</FormLabel>
                        <FormControl>
                          <Input
                            variant="primary"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`installments.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <Input
                            variant="primary"
                            type="number"
                            step="0.01"
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

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeInstallment(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Compra"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
