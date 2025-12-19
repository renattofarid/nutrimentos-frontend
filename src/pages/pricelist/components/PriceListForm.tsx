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
import { Plus, Trash2, GripVertical, FileText, Weight, DollarSign } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
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
        <GroupFormSection
          title="Información Básica"
          icon={FileText}
          cols={{ sm: 1, md: 2 }}
        >
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

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
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
        </GroupFormSection>

        {/* Rangos de Peso */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Weight className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Rangos de Peso</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddWeightRange}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Rango
            </Button>
          </div>

          <div className="space-y-3">
            {weightRangeFields.map((field, index) => (
              <div
                key={field.id}
                className="relative group bg-background rounded-lg border border-muted shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-1 flex items-center justify-center">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    </div>

                    <FormField
                      control={form.control}
                      name={`weight_ranges.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Nombre del Rango</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 0-300kg" {...field} />
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
                          <FormLabel>Peso Mínimo (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
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
                          <FormLabel>Peso Máximo (kg)</FormLabel>
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
                              min="1"
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

                    <div className="md:col-span-2 flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWeightRange(index)}
                        disabled={weightRangeFields.length === 1}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Precios de Productos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Precios de Productos</h3>
                <p className="text-sm text-muted-foreground">
                  Opcional: Puedes agregar precios ahora o después
                </p>
              </div>
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
          </div>

          {productPriceFields.length === 0 ? (
            <div className="text-center py-12 rounded-lg border-2 border-dashed border-muted bg-muted/20">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">
                No hay precios de productos agregados
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Haz clic en "Agregar Precio" para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {productPriceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative group bg-background rounded-lg border border-muted shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
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
                                placeholder="0.00"
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

                      <div className="md:col-span-1 flex items-end justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProductPrice(index)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
