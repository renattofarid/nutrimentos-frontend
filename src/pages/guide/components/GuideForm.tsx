"use client";

import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader, Plus, Trash2, Pencil, Truck, MapPin } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import { guideSchema, type GuideSchema } from "../lib/guide.schema";
import {
  MODALITIES,
  CARRIER_DOCUMENT_TYPES,
  DRIVER_DOCUMENT_TYPES,
  UNIT_MEASUREMENTS,
  type GuideResource,
  type GuideMotiveResource,
} from "../lib/guide.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface GuideFormProps {
  defaultValues: Partial<GuideSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  branches: BranchResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
  customers: PersonResource[];
  motives: GuideMotiveResource[];
  guide?: GuideResource;
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity: string;
  unit_code: string;
  description: string;
}

export const GuideForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  branches,
  warehouses,
  products,
  customers,
  motives,
}: GuideFormProps) => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WarehouseResource[]
  >([]);
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null
  );
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: "",
    quantity: "",
    unit_code: "",
    description: "",
  });
  const [localProducts] = useState<ProductResource[]>(products);

  const detailTempForm = useForm({
    defaultValues: {
      temp_product_id: currentDetail.product_id,
      temp_quantity: currentDetail.quantity,
      temp_unit_code: currentDetail.unit_code,
      temp_description: currentDetail.description,
    },
  });

  const form = useForm({
    resolver: zodResolver(guideSchema) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Watchers para detalles
  const selectedProductId = detailTempForm.watch("temp_product_id");
  const selectedQuantity = detailTempForm.watch("temp_quantity");
  const selectedUnitCode = detailTempForm.watch("temp_unit_code");
  const selectedDescription = detailTempForm.watch("temp_description");

  const selectedBranchId = form.watch("branch_id");

  // Inicializar detalles y cuotas desde defaultValues (para modo edición)
  useEffect(() => {
    if (mode === "update" && defaultValues) {
      if (defaultValues.branch_id) {
        const filtered = warehouses.filter(
          (warehouse) =>
            warehouse.branch_id.toString() === defaultValues.branch_id
        );
        setFilteredWarehouses(filtered);
      }
      // Disparar validación después de setear valores en modo edición
      form.trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      const filtered = warehouses.filter(
        (warehouse) => warehouse.branch_id.toString() === selectedBranchId
      );
      setFilteredWarehouses(filtered);

      // Si el warehouse seleccionado no está en la nueva lista filtrada, limpiar
      const currentWarehouseId = form.getValues("warehouse_id");
      if (currentWarehouseId) {
        const isValid = filtered.some(
          (warehouse) => warehouse.id.toString() === currentWarehouseId
        );
        if (!isValid) {
          form.setValue("warehouse_id", "");
        }
      }
    } else {
      setFilteredWarehouses([]);
      form.setValue("warehouse_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, warehouses]);

  // Observers para detalles
  useEffect(() => {
    setCurrentDetail((prev) => ({
      ...prev,
      product_id: selectedProductId || "",
      quantity: selectedQuantity || "",
      unit_code: selectedUnitCode || "",
      description: selectedDescription || "",
    }));
  }, [
    selectedProductId,
    selectedQuantity,
    selectedUnitCode,
    selectedDescription,
  ]);

  // Establecer fechas automáticamente
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    form.setValue("issue_date", formattedDate);
    form.setValue("transfer_date", formattedDate);
  }, [form]);

  // Cargar detalles existentes en modo edición
  useEffect(() => {
    if (defaultValues.details && defaultValues.details.length > 0) {
      const mappedDetails = defaultValues.details.map((detail: any) => {
        const product = localProducts.find(
          (p) => p.id.toString() === detail.product_id
        );
        return {
          product_id: detail.product_id,
          product_name: product?.name,
          quantity: detail.quantity,
          unit_code: detail.unit_code,
          description: detail.description,
        };
      });
      setDetails(mappedDetails);
      form.setValue("details", mappedDetails);
    }
  }, [defaultValues.details, localProducts, form]);

  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity ||
      !currentDetail.unit_code ||
      !currentDetail.description
    ) {
      return;
    }

    const product = localProducts.find(
      (p) => p.id.toString() === currentDetail.product_id
    );

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: product?.name,
    };

    if (editingDetailIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = newDetail;
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
      setEditingDetailIndex(null);
    } else {
      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }

    const emptyDetail = {
      product_id: "",
      quantity: "",
      unit_code: "",
      description: "",
    };
    setCurrentDetail(emptyDetail);
    detailTempForm.reset({
      temp_product_id: "",
      temp_quantity: "",
      temp_unit_code: "",
      temp_description: "",
    });
  };

  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setCurrentDetail(detail);
    detailTempForm.setValue("temp_product_id", detail.product_id);
    detailTempForm.setValue("temp_quantity", detail.quantity);
    detailTempForm.setValue("temp_unit_code", detail.unit_code);
    detailTempForm.setValue("temp_description", detail.description);
    setEditingDetailIndex(index);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleFormSubmit = (data: any) => {
    const formattedDetails = details.map((d) => ({
      product_id: parseInt(d.product_id),
      quantity: parseFloat(d.quantity),
      unit_code: d.unit_code,
      description: d.description,
    }));

    onSubmit({
      ...data,
      details: formattedDetails,
    });
  };

  const selectedWarehouseId = form.watch("warehouse_id");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full"
      >
        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="branch_id"
            label="Tienda"
            placeholder="Seleccione una tienda"
            options={branches.map((branch) => ({
              value: branch.id.toString(),
              label: branch.name,
              description: branch.address,
            }))}
          />

          <FormSelect
            control={form.control}
            name="warehouse_id"
            label="Almacén"
            placeholder="Seleccione un almacén"
            options={filteredWarehouses.map((warehouse) => ({
              value: warehouse.id.toString(),
              label: warehouse.name,
              description: warehouse.address,
            }))}
          />

          <FormSelect
            control={form.control}
            name="customer_id"
            label="Cliente"
            placeholder="Seleccione un cliente"
            options={customers.map((customer) => ({
              value: customer.id.toString(),
              label:
                customer.business_name ??
                `${customer.names} ${customer.father_surname} ${customer.mother_surname}`.trim(),
            }))}
          />

          <FormSelect
            control={form.control}
            name="motive_id"
            label="Motivo de Traslado"
            placeholder="Seleccione un motivo"
            options={motives.map((motive) => ({
              value: motive.id.toString(),
              label: motive.name,
            }))}
          />

          <FormSelect
            control={form.control}
            name="modality"
            label="Modalidad de Transporte"
            placeholder="Seleccione modalidad"
            options={MODALITIES.map((mod) => ({
              value: mod.value,
              label: mod.label,
            }))}
          />

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
            placeholder="Seleccione fecha"
          />

          <DatePickerFormField
            control={form.control}
            name="transfer_date"
            label="Fecha de Traslado"
            placeholder="Seleccione fecha"
          />

          <FormField
            control={form.control}
            name="sale_document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento de Venta</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: F001-00123"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Información del Transportista */}
        <GroupFormSection
          title="Información del Transportista"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="carrier_document_type"
            label="Tipo de Documento"
            placeholder="Seleccione"
            options={CARRIER_DOCUMENT_TYPES.map((dt) => ({
              value: dt.value,
              label: dt.label,
            }))}
          />

          <FormField
            control={form.control}
            name="carrier_document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: 20123456789"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carrier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Transportista</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Transportes SAC"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carrier_ruc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC del Transportista</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: 20123456789"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carrier_mtc_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número MTC</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: MTC-123456"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa del Vehículo (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: ABC-123"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Información del Conductor */}
        <GroupFormSection
          title="Información del Conductor (Opcional)"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="driver_document_type"
            label="Tipo de Documento"
            placeholder="Seleccione"
            options={DRIVER_DOCUMENT_TYPES.map((dt) => ({
              value: dt.value,
              label: dt.label,
            }))}
          />

          <FormField
            control={form.control}
            name="driver_document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: 12345678"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="driver_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Conductor</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Juan Pérez"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="driver_license"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Licencia de Conducir</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Q12345678"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Direcciones */}
        <GroupFormSection
          title="Direcciones de Origen y Destino"
          icon={MapPin}
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="origin_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Origen</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ej: Av. Principal 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="origin_ubigeo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubigeo de Origen</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: 150101"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Destino</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ej: Av. Secundaria 456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination_ubigeo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubigeo de Destino</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: 150102"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Información de Carga */}
        <GroupFormSection
          title="Información de Carga"
          icon={Truck}
          cols={{ sm: 1, md: 3 }}
        >
          <FormSelect
            control={form.control}
            name="unit_measurement"
            label="Unidad de Medida"
            placeholder="Seleccione"
            options={UNIT_MEASUREMENTS.map((um) => ({
              value: um.value,
              label: um.label,
            }))}
          />

          <FormField
            control={form.control}
            name="total_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Total</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    variant="default"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_packages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total de Bultos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    variant="default"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Detalles de Productos */}
        <GroupFormSection
          title="Detalles de la Guía"
          icon={Truck}
          cols={{ sm: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-sidebar rounded-lg">
            <div className="md:col-span-2">
              <Form {...detailTempForm}>
                <FormSelect
                  control={detailTempForm.control}
                  name="temp_product_id"
                  label="Producto"
                  placeholder="Seleccione un producto"
                  options={products.map((product) => {
                    const stockInWarehouse = product.stock_warehouse?.find(
                      (stock) =>
                        stock.warehouse_id.toString() === selectedWarehouseId
                    );
                    return {
                      value: product.id.toString(),
                      label: product.name,
                      description: `${product.codigo} | Stock: ${
                        stockInWarehouse?.stock ?? 0
                      }`,
                    };
                  })}
                />
              </Form>
            </div>

            <FormField
              control={detailTempForm.control}
              name="temp_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      variant="default"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={detailTempForm.control}
              name="temp_unit_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Unidad</FormLabel>
                  <FormControl>
                    <Input variant="default" placeholder="Ej: NIU" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="md:col-span-4">
              <FormField
                control={detailTempForm.control}
                name="temp_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del producto"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-4 flex justify-end">
              <Button
                type="button"
                variant="default"
                onClick={handleAddDetail}
                disabled={
                  !currentDetail.product_id ||
                  !currentDetail.quantity ||
                  !currentDetail.unit_code ||
                  !currentDetail.description
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                {editingDetailIndex !== null ? "Actualizar" : "Agregar"}
              </Button>
            </div>
          </div>

          {details.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.product_name}</TableCell>
                      <TableCell className="text-right">
                        {detail.quantity}
                      </TableCell>
                      <TableCell>{detail.unit_code}</TableCell>
                      <TableCell>{detail.description}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDetail(index)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDetail(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Badge variant="outline" className="text-lg p-3">
                No hay detalles agregados
              </Badge>
            </div>
          )}
        </GroupFormSection>

        {/* Observaciones */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Observaciones (Opcional)</h3>
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting || (mode === "create" && details.length === 0)
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
