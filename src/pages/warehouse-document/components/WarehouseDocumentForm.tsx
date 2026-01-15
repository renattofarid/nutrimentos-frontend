import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { warehouseDocumentSchemaCreate } from "../lib/warehouse-document.schema";
import type { WarehouseDocumentSchema } from "../lib/warehouse-document.schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  DOCUMENT_TYPES,
  DOCUMENT_MOTIVES,
} from "../lib/warehouse-document.constants";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { Plus, Package, FileText } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { GroupFormSection } from "@/components/GroupFormSection";
import { useState, useMemo } from "react";
import WarehouseDocumentDetailSheet from "./WarehouseDocumentDetailSheet";
import { EmptyState } from "@/components/EmptyState";
import { DataTable } from "@/components/DataTable";
import { createWarehouseDocumentDetailsColumns } from "./WarehouseDocumentDetailsColumns";

interface WarehouseDocumentFormProps {
  onSubmit: (data: WarehouseDocumentSchema) => void;
  defaultValues?: Partial<WarehouseDocumentSchema>;
  isSubmitting?: boolean;
  mode: "create" | "update";
  warehouses: WarehouseResource[];
  persons: PersonResource[];
  products: ProductResource[];
  onCancel?: () => void;
}

export default function WarehouseDocumentForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  mode,
  warehouses,
  persons,
  products,
  onCancel,
}: WarehouseDocumentFormProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(warehouseDocumentSchemaCreate) as any,
    defaultValues: defaultValues || {
      warehouse_origin_id: "",
      document_type: "",
      motive: "",
      warehouse_dest_id: "",
      responsible_origin_id: "",
      responsible_dest_id: "",
      movement_date: "",
      purchase_id: "",
      observations: "",
      details: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const documentType = form.watch("document_type");
  const isTraslado = documentType === "TRASLADO";

  const [initialDetailData, setInitialDetailData] = useState<
    | {
        product_id: string;
        quantity_sacks: number;
        quantity_kg?: number;
        unit_price: number;
        observations: string;
      }
    | undefined
  >(undefined);

  const openSheet = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      const detail = fields[index];
      setInitialDetailData({
        product_id: detail.product_id,
        quantity_sacks: detail.quantity_sacks,
        quantity_kg: detail.quantity_kg,
        unit_price: detail.unit_price,
        observations: detail.observations || "",
      });
    } else {
      setEditingIndex(null);
      setInitialDetailData(undefined);
    }
    setIsSheetOpen(true);
  };

  const handleSaveDetail = (data: {
    product_id: string;
    quantity_sacks: number;
    quantity_kg?: number;
    unit_price: number;
    observations: string;
  }) => {
    if (editingIndex !== null) {
      update(editingIndex, data);
    } else {
      append(data);
    }
    setIsSheetOpen(false);
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id.toString() === productId)?.name || "";
  };

  const tableData = useMemo(() => {
    return fields.map((field) => ({
      id: field.id,
      product_id: field.product_id,
      product_name: getProductName(field.product_id),
      quantity_sacks: field.quantity_sacks,
      unit_price: field.unit_price,
      total: field.quantity_sacks * field.unit_price,
    }));
  }, [fields, products]);

  const getFieldIndex = (id: string) => {
    return fields.findIndex((field) => field.id === id);
  };

  const columns = useMemo(
    () =>
      createWarehouseDocumentDetailsColumns(openSheet, remove, getFieldIndex),
    [fields]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="document_type"
            label="Tipo de Documento"
            placeholder="Seleccione el tipo"
            options={DOCUMENT_TYPES.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
          />

          <FormSelect
            control={form.control}
            name="motive"
            label="Motivo"
            placeholder="Seleccione el motivo"
            options={DOCUMENT_MOTIVES.map((motive) => ({
              value: motive.value,
              label: motive.label,
            }))}
          />

          <DatePickerFormField
            control={form.control}
            name="movement_date"
            label="Fecha del Movimiento"
          />

          <FormSelect
            control={form.control}
            name="warehouse_origin_id"
            label="Almacén de Origen"
            placeholder="Seleccione un almacén"
            options={warehouses.map((w) => ({
              value: w.id.toString(),
              label: w.name,
            }))}
          />

          <FormSelect
            control={form.control}
            name="responsible_origin_id"
            label="Responsable de Origen"
            placeholder="Seleccione una persona"
            options={persons.map((p) => ({
              value: p.id.toString(),
              label: `${p.names} ${p.father_surname ?? ""} ${
                p.mother_surname ?? ""
              }`.trim(),
            }))}
          />

          {isTraslado && (
            <>
              <FormSelect
                control={form.control}
                name="warehouse_dest_id"
                label="Almacén de Destino"
                placeholder="Seleccione un almacén"
                options={warehouses.map((w) => ({
                  value: w.id.toString(),
                  label: w.name,
                }))}
              />

              <FormSelect
                control={form.control}
                name="responsible_dest_id"
                label="Responsable de Destino"
                placeholder="Seleccione una persona"
                options={persons.map((p) => ({
                  value: p.id.toString(),
                  label: `${p.names} ${p.father_surname ?? ""} ${
                    p.mother_surname ?? ""
                  }`.trim(),
                }))}
              />
            </>
          )}

          <FormSelect
            control={form.control}
            name="purchase_id"
            label="Compra (Opcional)"
            placeholder="Seleccione una compra"
            options={[{ value: "", label: "Ninguna" }]}
          />

          <div className="md:col-span-3">
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones adicionales"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </GroupFormSection>

        <GroupFormSection
          title="Detalles del Documento"
          icon={Package}
          cols={{ sm: 1 }}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {fields.length} producto(s) agregado(s)
              </p>
              <Button
                type="button"
                onClick={() => openSheet()}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            {fields.length > 0 ? (
              <DataTable
                columns={columns}
                data={tableData}
                isVisibleColumnFilter={false}
              />
            ) : (
              <EmptyState
                icon={Package}
                title="No hay productos agregados"
                description="Agrega productos para completar el documento de almacén"
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openSheet()}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar primer producto</span>
                  </Button>
                }
              />
            )}
          </div>
        </GroupFormSection>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
              ? "Crear Documento"
              : "Actualizar Documento"}
          </Button>
        </div>
      </form>

      <WarehouseDocumentDetailSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSaveDetail}
        products={products}
        initialData={initialDetailData}
        isEditing={editingIndex !== null}
      />
    </Form>
  );
}
