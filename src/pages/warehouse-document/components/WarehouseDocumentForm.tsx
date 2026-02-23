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
import { Package, FileText, AlertCircle } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import { useState, useEffect, useCallback } from "react";
import {
  ExcelGrid,
  type ExcelGridColumn,
  type ProductOption,
} from "@/components/ExcelGrid";
import { formatNumber } from "@/lib/formatCurrency";
import type { PurchaseResource } from "@/pages/purchase/lib/purchase.interface";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { getProduct } from "@/pages/product/lib/product.actions";
import { PRODUCT } from "@/pages/product/lib/product.interface";

interface WarehouseDocumentFormProps {
  onSubmit: (data: WarehouseDocumentSchema) => void;
  defaultValues?: Partial<WarehouseDocumentSchema>;
  isSubmitting?: boolean;
  mode: "create" | "update";
  warehouses: WarehouseResource[];
  persons: PersonResource[];
  purchases?: PurchaseResource[];
  onCancel?: () => void;
}

interface DetailRow {
  product_id: string;
  product_code?: string;
  product_name?: string;
  quantity_sacks: string;
  quantity_kg: string;
  unit_price: string;
  observations: string;
  total: number;
}

export default function WarehouseDocumentForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  mode,
  warehouses,
  persons,
  purchases = [],
  onCancel,
}: WarehouseDocumentFormProps) {
  const queryClient = useQueryClient();
  const [details, setDetails] = useState<DetailRow[]>([]);

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

  const documentType = form.watch("document_type");
  const isTraslado = documentType === "TRASLADO";
  const selectedPurchaseId = form.watch("purchase_id");

  // Inicializar detalles desde defaultValues (para modo edición)
  useEffect(() => {
    if (
      mode === "update" &&
      defaultValues?.details &&
      defaultValues.details.length > 0
    ) {
      const mappedDetails = defaultValues.details.map((detail: any) => {
        const quantityKg = parseFloat(detail.quantity_kg || "0");
        const unitPrice = parseFloat(detail.unit_price || "0");
        const total = quantityKg * unitPrice;

        return {
          product_id: detail.product_id,
          product_code: detail.product_code || "",
          product_name: detail.product_name || "",
          quantity_sacks: detail.quantity_sacks?.toString() || "",
          quantity_kg: detail.quantity_kg?.toString() || "",
          unit_price: detail.unit_price?.toString() || "",
          observations: detail.observations || "",
          total,
        };
      });
      setDetails(mappedDetails);
      form.clearErrors("details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar detalles cuando se selecciona una compra
  useEffect(() => {
    if (selectedPurchaseId && selectedPurchaseId !== "") {
      const selectedPurchase = purchases.find(
        (p) => p.id.toString() === selectedPurchaseId
      );

      if (selectedPurchase) {
        // Llenar automáticamente el almacén, tipo de documento y motivo
        form.setValue(
          "warehouse_origin_id",
          selectedPurchase.warehouse_id.toString()
        );
        form.setValue("document_type", "INGRESO");
        form.setValue("motive", "COMPRA");

        // Llenar los detalles si existen
        if (selectedPurchase.details) {
          const mappedDetails: DetailRow[] = selectedPurchase.details.map(
            (detail) => {
              const quantityKg = detail.quantity_kg;
              const unitPrice = detail.unit_price;
              const total = quantityKg * unitPrice;

              return {
                product_id: detail.product.id.toString(),
                product_code: detail.product.codigo,
                product_name: detail.product.name,
                quantity_sacks: detail.quantity_sacks.toString(),
                quantity_kg: detail.quantity_kg.toString(),
                unit_price: detail.unit_price.toString(),
                observations: "",
                total,
              };
            }
          );

          setDetails(mappedDetails);
          // Actualizar el campo details del formulario
          form.setValue(
            "details",
            convertDetailsToSchema(mappedDetails) as any
          );
          form.clearErrors("details");
        }
      }
    } else if (selectedPurchaseId === "" && mode === "create") {
      // Si se deselecciona la compra, limpiar los detalles y los campos relacionados
      setDetails([]);
      form.setValue("details", []);
      form.setValue("warehouse_origin_id", "");
      form.setValue("document_type", "");
      form.setValue("motive", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPurchaseId]);

  // Función para convertir DetailRow[] a formato del schema
  const convertDetailsToSchema = (details: DetailRow[]) => {
    return details.map((detail) => ({
      product_id: detail.product_id,
      quantity_sacks: parseFloat(detail.quantity_sacks) || 0,
      quantity_kg: parseFloat(detail.quantity_kg) || undefined,
      unit_price: parseFloat(detail.unit_price) || 0,
      observations: detail.observations || "",
    }));
  };

  // Funciones para ExcelGrid
  const handleAddRow = () => {
    const newDetail: DetailRow = {
      product_id: "",
      product_code: "",
      product_name: "",
      quantity_sacks: "",
      quantity_kg: "",
      unit_price: "",
      observations: "",
      total: 0,
    };
    const updatedDetails = [...details, newDetail];
    setDetails(updatedDetails);
    // Actualizar el campo details del formulario para que la validación funcione
    form.setValue("details", convertDetailsToSchema(updatedDetails) as any);
    if (updatedDetails.length > 0) {
      form.clearErrors("details");
    }
  };

  const handleRemoveRow = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    // Actualizar el campo details del formulario
    form.setValue("details", convertDetailsToSchema(updatedDetails) as any);
    if (updatedDetails.length === 0) {
      form.setError("details", { message: "Debe agregar al menos un detalle" });
    }
  };

  const handleCellChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };

    // Recalcular totales cuando cambian cantidad o precio
    if (field === "quantity_kg" || field === "unit_price") {
      const detail = updatedDetails[index];
      const quantityKg = parseFloat(detail.quantity_kg) || 0;
      const unitPrice = parseFloat(detail.unit_price) || 0;
      const total = quantityKg * unitPrice;

      updatedDetails[index] = {
        ...updatedDetails[index],
        total,
      };
    }

    setDetails(updatedDetails);
    // Actualizar el campo details del formulario
    form.setValue("details", convertDetailsToSchema(updatedDetails) as any);
    form.clearErrors("details");
  };

  const handleProductSelect = useCallback((index: number, product: ProductOption) => {
    setDetails((prev) => {
      const updatedDetails = [...prev];
      updatedDetails[index] = {
        ...updatedDetails[index],
        product_id: product.id,
        product_code: product.codigo,
        product_name: product.name,
      };
      form.setValue("details", convertDetailsToSchema(updatedDetails) as any);
      form.clearErrors("details");
      return updatedDetails;
    });
  }, [form]);

  const handleProductCodeTab = useCallback(
    async (
      rowIndex: number,
      code: string,
      advance: () => void,
      setError: (msg: string) => void
    ) => {
      if (!code.trim()) {
        advance();
        return;
      }

      try {
        const result = await queryClient.fetchQuery({
          queryKey: [PRODUCT.QUERY_KEY, { codigo: code }],
          queryFn: () => getProduct({ params: { codigo: code } }),
          staleTime: 30_000,
        });

        if (result.data && result.data.length > 0) {
          const p = result.data[0];
          handleProductSelect(rowIndex, {
            id: p.id.toString(),
            codigo: p.codigo,
            name: p.name,
            weight: p.weight,
          });
          advance();
        } else {
          setError(`No se encontró ningún producto con código "${code}"`);
        }
      } catch {
        setError("Error al buscar el producto. Intente de nuevo.");
      }
    },
    [queryClient, handleProductSelect]
  );

  const calculateDetailsTotal = () => {
    return details.reduce((sum, detail) => sum + (detail.total || 0), 0);
  };

  // Configuración de columnas para ExcelGrid
  const gridColumns: ExcelGridColumn<DetailRow>[] = [
    {
      id: "product_code",
      header: "Código",
      type: "product-code",
      width: "120px",
      accessor: "product_code",
    },
    {
      id: "product",
      header: "Producto",
      type: "product-search",
      width: "300px",
      accessor: "product_name",
    },
    {
      id: "quantity_sacks",
      header: "Sacos",
      type: "number",
      width: "100px",
      accessor: "quantity_sacks",
    },
    {
      id: "quantity_kg",
      header: "Cantidad (KG)",
      type: "number",
      width: "120px",
      accessor: "quantity_kg",
    },
    {
      id: "unit_price",
      header: "Precio Unitario",
      type: "number",
      width: "120px",
      accessor: "unit_price",
    },
    {
      id: "total",
      header: "Total",
      type: "readonly",
      width: "120px",
      render: (row) => (
        <div className="h-full flex items-center justify-end px-2 py-1 text-sm font-semibold">
          {row.total ? `S/. ${formatNumber(row.total)}` : "-"}
        </div>
      ),
    },
    {
      id: "observations",
      header: "Observaciones",
      type: "text",
      width: "200px",
      accessor: "observations",
    },
  ];

  // Sin lista estática: la búsqueda es async por código (handleProductCodeTab)
  const productOptions: ProductOption[] = [];

  // Validar detalles antes del submit
  const validateDetails = () => {
    if (details.length === 0) {
      form.setError("details", {
        message: "Debe agregar al menos un detalle",
      });
      return false;
    }

    // Validar que cada detalle tenga los campos requeridos
    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      if (!detail.product_id) {
        form.setError("details", {
          message: `Fila ${i + 1}: Debe seleccionar un producto`,
        });
        return false;
      }
      if (!detail.quantity_sacks || parseFloat(detail.quantity_sacks) <= 0) {
        form.setError("details", {
          message: `Fila ${i + 1}: La cantidad en sacos debe ser mayor a 0`,
        });
        return false;
      }
      if (!detail.unit_price || parseFloat(detail.unit_price) < 0) {
        form.setError("details", {
          message: `Fila ${i + 1}: El precio unitario es requerido`,
        });
        return false;
      }
    }

    return true;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          // Validar detalles
          if (!validateDetails()) {
            return;
          }

          // Convertir los detalles antes de enviar
          const formattedData = {
            ...data,
            details: convertDetailsToSchema(details),
          };
          onSubmit(formattedData as any);
        })}
        className="space-y-6"
      >
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            name="purchase_id"
            label="Compra (Opcional)"
            placeholder="Seleccione una compra"
            options={[
              { value: "", label: "Ninguna" },
              ...purchases.map((purchase) => ({
                value: purchase.id.toString(),
                label: `${purchase.document_number} - ${purchase.supplier_fullname}`,
                description: `Total: S/. ${purchase.total_amount}`,
              })),
            ]}
          />

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

          <DatePickerFormField
            control={form.control}
            name="movement_date"
            label="Fecha del Movimiento"
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
          <ExcelGrid
            columns={gridColumns}
            data={details}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onCellChange={handleCellChange}
            productOptions={productOptions}
            onProductSelect={handleProductSelect}
            onProductCodeTab={handleProductCodeTab}
            emptyMessage="Agregue productos al documento"
          />

          {details.length > 0 && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  S/. {formatNumber(calculateDetailsTotal())}
                </span>
              </div>
            </div>
          )}
        </GroupFormSection>

        {Object.keys(form.formState.errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Errores en el formulario</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>
                    <strong>{getFieldLabel(field)}:</strong>{" "}
                    {error?.message?.toString() || "Campo inválido"}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
    </Form>
  );
}

// Función auxiliar para obtener el label de un campo
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    warehouse_origin_id: "Almacén de Origen",
    warehouse_dest_id: "Almacén de Destino",
    document_type: "Tipo de Documento",
    motive: "Motivo",
    responsible_origin_id: "Responsable de Origen",
    responsible_dest_id: "Responsable de Destino",
    movement_date: "Fecha del Movimiento",
    purchase_id: "Compra",
    observations: "Observaciones",
    details: "Detalles del Documento",
  };
  return labels[field] || field;
}
