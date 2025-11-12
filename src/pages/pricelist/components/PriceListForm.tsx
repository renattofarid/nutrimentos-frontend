import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  priceListSchemaCreate,
  priceListSchemaUpdate,
  type PriceListSchemaCreate,
  type PriceListSchemaUpdate,
} from "../lib/pricelist.schema";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllProducts } from "@/pages/product/lib/product.hook";

type PriceListFormProps =
  | {
      defaultValues?: Partial<PriceListSchemaCreate>;
      onSubmit: (data: PriceListSchemaCreate) => void | Promise<void>;
      onCancel: () => void;
      isSubmitting?: boolean;
      mode: "create";
    }
  | {
      defaultValues?: Partial<PriceListSchemaUpdate>;
      onSubmit: (data: PriceListSchemaUpdate) => void | Promise<void>;
      onCancel: () => void;
      isSubmitting?: boolean;
      mode: "update";
    };

export default function PriceListForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
}: PriceListFormProps) {
  const { data: products } = useAllProducts();

  const form = useForm<any>({
    resolver: zodResolver(
      mode === "create" ? priceListSchemaCreate : priceListSchemaUpdate
    ),
    defaultValues: defaultValues || {
      name: "",
      code: "",
      description: "",
      is_active: true,
      weight_ranges: [
        {
          name: "",
          min_weight: 0,
          max_weight: null,
          order: 1,
        },
      ],
      product_prices: [],
    },
    mode: "onChange",
  });

  const {
    fields: weightRangeFields,
    append: appendWeightRange,
    remove: removeWeightRange,
  } = useFieldArray({
    control: form.control,
    name: "weight_ranges",
  });

  const {
    fields: productPriceFields,
    append: appendProductPrice,
    remove: removeProductPrice,
  } = useFieldArray({
    control: form.control,
    name: "product_prices",
  });

  const handleAddWeightRange = () => {
    const currentRanges = form.getValues("weight_ranges") || [];
    const nextOrder = currentRanges.length + 1;
    appendWeightRange({
      name: "",
      min_weight: 0,
      max_weight: null,
      order: nextOrder,
    });
  };

  const handleAddProductPrice = () => {
    appendProductPrice({
      product_id: 0,
      weight_range_index: 0,
      price: 0,
      currency: "PEN",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Lista de Precios 2025"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: LP2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la lista de precios..."
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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado Activo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      La lista de precios estará disponible para asignar a
                      clientes
                    </div>
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
          </CardContent>
        </Card>

        {/* Rangos de Peso */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rangos de Peso</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddWeightRange}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Rango
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weightRangeFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-muted/50"
                >
                  <div className="md:col-span-1 flex items-center justify-center">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <FormField
                    control={form.control}
                    name={`weight_ranges.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="0-300kg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`weight_ranges.${index}.min_weight`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Peso Mín.</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value as number}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`weight_ranges.${index}.max_weight`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Peso Máx.</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Sin límite"
                            value={
                              field.value === null
                                ? ""
                                : (field.value as number)
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : parseFloat(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`weight_ranges.${index}.order`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Orden</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value as number}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 1
                                  : parseInt(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeWeightRange(index)}
                      disabled={weightRangeFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Precios de Productos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Precios de Productos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Opcional: Puedes agregar precios ahora o después
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddProductPrice}
              disabled={!products || products.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Precio
            </Button>
          </CardHeader>
          <CardContent>
            {productPriceFields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay precios de productos agregados
              </div>
            ) : (
              <div className="space-y-4">
                {productPriceFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-muted/50"
                  >
                    <FormField
                      control={form.control}
                      name={`product_prices.${index}.product_id`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>Producto</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={
                              field.value ? field.value.toString() : undefined
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem
                                  key={product.id}
                                  value={product.id.toString()}
                                >
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`product_prices.${index}.weight_range_index`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Rango de Peso</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={
                              field.value !== undefined && field.value !== null
                                ? field.value.toString()
                                : undefined
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rango" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {weightRangeFields.map((range, idx) => (
                                <SelectItem
                                  key={idx + range.id}
                                  value={idx.toString()}
                                >
                                  {form.watch(`weight_ranges.${idx}.name`) ||
                                    `Rango ${idx + 1}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`product_prices.${index}.price`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Precio</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              value={field.value as number}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`product_prices.${index}.currency`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Moneda</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PEN">PEN</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProductPrice(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Botones de Acción */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
              ? "Crear Lista de Precio"
              : "Actualizar Lista de Precio"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
