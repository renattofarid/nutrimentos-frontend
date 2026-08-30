import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { warehouseDocumentSchemaCreate } from "../lib/warehouse-document.schema";
import type { WarehouseDocumentSchema } from "../lib/warehouse-document.schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/FormSelect";
import { DateTimePickerForm } from "@/components/DateTimePickerForm";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { Package, FileText, AlertCircle, Loader, Save, X } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ExcelGrid,
  type ExcelGridColumn,
  type ProductOption,
} from "@/components/ExcelGrid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProduct } from "@/pages/product/lib/product.hook";
import { warningToast, errorToast } from "@/lib/core.function";
import { getWarehouseStock } from "../lib/warehouse-document.actions";

interface WarehouseDocumentFormProps {
  onSubmit: (data: WarehouseDocumentSchema) => void;
  defaultValues?: Partial<WarehouseDocumentSchema>;
  isSubmitting?: boolean;
  mode: "create" | "update";
  warehouses: WarehouseResource[];
  persons: PersonResource[];
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
  purchase_price?: string;
  price_per_kg?: string;
}


export default function WarehouseDocumentForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  mode,
  warehouses,
  persons,
  onCancel,
}: WarehouseDocumentFormProps) {
  const [details, setDetails] = useState<DetailRow[]>([]);

  // ── Aviso de stock del almacén de origen ────────────────────────────────
  // Al escribir la cantidad se consulta el stock al backend (GET /inventory con
  // warehouse_id + product_id), igual que ventas consulta el precio dinámico.
  // Es solo un aviso (warningToast / errorToast): no bloquea el guardado.
  // peso del saco por producto, para comparar cuando la línea va en kg.
  const [productWeight, setProductWeight] = useState<Record<string, number>>({});
  // Última cantidad ya avisada por fila, para no repetir el toast en cada tecla.
  const lastStockWarnRef = useRef<Record<number, string>>({});
  // Timers de debounce por fila para no consultar en cada tecla.
  const stockDebounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {},
  );
  // Productos con error de consulta ya notificado (para no repetir el toast).
  const stockErrorToastRef = useRef<Set<string>>(new Set());
  // Si ya se avisó que falta elegir el almacén de origen.
  const noWarehouseWarnedRef = useRef(false);

  // Estado para búsqueda async de producto por código (al dar Tab)
  const [productCodeSearch, setProductCodeSearch] = useState<{
    rowIndex: number;
    code: string;
  } | null>(null);
  const productCodeCallbacksRef = useRef<{
    advance: () => void;
    setError: (msg: string) => void;
  } | null>(null);

  const { data: productSearchResult, isFetching: isSearchingProduct } =
    useProduct(
      productCodeSearch
        ? { codigo: productCodeSearch.code, direction: "asc" }
        : undefined,
    );

  const form = useForm({
    resolver: zodResolver(warehouseDocumentSchemaCreate) as any,
    defaultValues: {
      warehouse_origin_id: "",
      document_type: "TRASLADO",
      warehouse_dest_id: "",
      responsible_origin_id: "",
      responsible_dest_id: "37",
      movement_date: "",
      observations: "",
      details: [],
      ...defaultValues,
      motive: "TRASLADO_INTERNO",
    },
  });

  const documentType = form.watch("document_type");
  const isTraslado = documentType === "TRASLADO";

  // Inicializar detalles desde defaultValues (para modo edición)
  useEffect(() => {
    if (
      mode === "update" &&
      defaultValues?.details &&
      defaultValues.details.length > 0
    ) {
      const mappedDetails = defaultValues.details.map((detail: any) => {
        return {
          product_id: detail.product_id,
          product_code: detail.product_code || "",
          product_name: detail.product_name || "",
          quantity_sacks: detail.quantity_sacks?.toString() || "",
          quantity_kg: detail.quantity_kg?.toString() || "",
          unit_price: detail.unit_price?.toString() || "0",
          observations: detail.observations || "",
          total: 0,
        };
      });
      setDetails(mappedDetails);
      form.clearErrors("details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para convertir DetailRow[] a formato del schema
  const convertDetailsToSchema = (details: DetailRow[]) => {
    return details.map((detail) => {
      return {
        product_id: detail.product_id,
        quantity_sacks: parseFloat(detail.quantity_sacks) || 0,
        quantity_kg: parseFloat(detail.quantity_kg) || 0,
        unit_price: parseFloat(detail.unit_price) || 0,
        observations: detail.observations || "",
      };
    });
  };

  // Funciones para ExcelGrid
  const handleAddRow = () => {
    // No permitir agregar filas si aún no se eligieron los almacenes:
    // sin almacén de origen no se puede validar el stock, y en un traslado
    // también hace falta el de destino.
    const originId = form.getValues("warehouse_origin_id");
    const destId = form.getValues("warehouse_dest_id");
    if (!originId || (isTraslado && !destId)) {
      warningToast(
        isTraslado
          ? "Selecciona el almacén de origen y el de destino antes de agregar productos"
          : "Selecciona el almacén de origen antes de agregar productos",
      );
      return;
    }
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
    setDetails((prev) => {
      const updatedDetails = [...prev, newDetail];
      form.setValue("details", convertDetailsToSchema(updatedDetails) as any);
      form.clearErrors("details");
      return updatedDetails;
    });
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

  const warehouseOriginId = form.watch("warehouse_origin_id");

  // Al cambiar el almacén de origen se reinician los avisos ya mostrados y se
  // vuelve a consultar el stock de las filas que ya tienen producto y cantidad
  // (el usuario pudo escribir la cantidad antes de elegir el almacén).
  useEffect(() => {
    lastStockWarnRef.current = {};
    stockErrorToastRef.current.clear();
    noWarehouseWarnedRef.current = false;
    Object.values(stockDebounceRef.current).forEach((t) => clearTimeout(t));

    if (!warehouseOriginId) return;
    details.forEach((row, index) => {
      if (!row.product_id) return;
      const sacksQty = parseFloat(row.quantity_sacks) || 0;
      const kgQty = parseFloat(row.quantity_kg) || 0;
      if (sacksQty > 0) {
        void checkStock(
          index,
          "quantity_sacks",
          row.quantity_sacks,
          row.product_id,
          row.product_name,
        );
      } else if (kgQty > 0) {
        void checkStock(
          index,
          "quantity_kg",
          row.quantity_kg,
          row.product_id,
          row.product_name,
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseOriginId]);

  // Limpiar timers de debounce al desmontar.
  useEffect(() => {
    const timers = stockDebounceRef.current;
    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t));
    };
  }, []);

  // Consulta el stock al backend y, si la cantidad ingresada lo supera, avisa
  // con warningToast (no bloquea). Si la consulta falla, avisa con errorToast.
  const checkStock = useCallback(
    async (
      index: number,
      field: "quantity_sacks" | "quantity_kg",
      value: string,
      productId: string,
      productName: string | undefined,
    ) => {
      const warehouseId = form.getValues("warehouse_origin_id");
      if (!warehouseId || !productId) return;

      const name = productName || "el producto";
      const qty = parseFloat(value) || 0;
      if (qty <= 0) {
        delete lastStockWarnRef.current[index];
        return;
      }

      // Muestra el aviso solo si cambió respecto al último ya mostrado en la fila.
      const notifyOnce = (msg: string) => {
        if (lastStockWarnRef.current[index] !== msg) {
          lastStockWarnRef.current[index] = msg;
          warningToast(msg);
        }
      };

      let sacks: number | null;
      try {
        sacks = await getWarehouseStock(Number(warehouseId), Number(productId));
        stockErrorToastRef.current.delete(productId);
      } catch (error) {
        console.error("No se pudo consultar el stock del almacén de origen:", error);
        if (!stockErrorToastRef.current.has(productId)) {
          stockErrorToastRef.current.add(productId);
          errorToast(
            `No se pudo consultar el stock de ${name} en el almacén de origen`,
          );
        }
        return;
      }

      // Respuesta 200 pero sin registro de inventario para ese producto/almacén.
      if (sacks == null) {
        notifyOnce(`${name} no tiene stock registrado en el almacén de origen`);
        return;
      }

      const weight = productWeight[productId] ?? 0;
      const isSacks = field === "quantity_sacks";
      const unit = isSacks ? "saco(s)" : "kg";
      const available = isSacks ? sacks : weight > 0 ? sacks * weight : null;

      // Línea en kg pero no conocemos el peso del saco: no se puede comparar.
      if (available == null) {
        notifyOnce(
          `No se pudo verificar el stock en kg de ${name}: falta el peso del saco`,
        );
        return;
      }

      if (qty > available) {
        notifyOnce(
          `Stock insuficiente de ${name}: disponible ${available} ${unit} en el almacén de origen`,
        );
      } else {
        delete lastStockWarnRef.current[index];
      }
    },
    [form, productWeight],
  );

  const handleCellChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...details];
    const current = { ...updatedDetails[index], [field]: value };

    updatedDetails[index] = current;
    setDetails(updatedDetails);
    form.setValue("details", convertDetailsToSchema(updatedDetails) as any);
    form.clearErrors("details");

    // Al escribir la cantidad, consultar el stock al backend (debounce por fila),
    // igual que ventas consulta el precio dinámico.
    if (
      (field === "quantity_sacks" || field === "quantity_kg") &&
      current.product_id
    ) {
      if (!warehouseOriginId) {
        if (!noWarehouseWarnedRef.current) {
          noWarehouseWarnedRef.current = true;
          warningToast(
            "Selecciona el almacén de origen para validar el stock disponible",
          );
        }
        return;
      }
      const productId = current.product_id;
      const productName = current.product_name;
      const qtyField = field;
      clearTimeout(stockDebounceRef.current[index]);
      stockDebounceRef.current[index] = setTimeout(() => {
        void checkStock(index, qtyField, value, productId, productName);
      }, 350);
    }
  };

  const handleProductSelect = useCallback(
    (index: number, product: ProductOption) => {
      setProductWeight((prev) => ({
        ...prev,
        [product.id]: product.weight ? parseFloat(product.weight) || 0 : 0,
      }));
      setDetails((prev) => {
        const updatedDetails = [...prev];
        const current = updatedDetails[index];

        updatedDetails[index] = {
          ...current,
          product_id: product.id,
          product_code: product.codigo,
          product_name: product.name,
        };
        form.setValue("details", convertDetailsToSchema(updatedDetails) as any);
        form.clearErrors("details");
        return updatedDetails;
      });
    },
    [form],
  );

  // Cuando useProduct retorna resultado, auto-seleccionar primer producto y avanzar celda
  useEffect(() => {
    if (!productCodeSearch || isSearchingProduct) return;
    const callbacks = productCodeCallbacksRef.current;
    if (!callbacks) return;

    const productSelected = productSearchResult?.data?.find(
      (p) => p.codigo === productCodeSearch?.code,
    );

    if (productSelected) {
      handleProductSelect(productCodeSearch.rowIndex, {
        id: productSelected.id.toString(),
        codigo: productSelected.codigo,
        name: productSelected.name,
        weight: productSelected.weight,
        price_per_kg: productSelected.price_per_kg,
        purchase_price: productSelected.purchase_price,
      });
      callbacks.advance();
    } else if (productSearchResult !== undefined) {
      callbacks.setError(
        `No se encontró ningún producto con código "${productCodeSearch.code}"`,
      );
    }

    productCodeCallbacksRef.current = null;
    setProductCodeSearch(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearchResult, isSearchingProduct]);

  const handleProductCodeTab = useCallback(
    (
      rowIndex: number,
      code: string,
      advance: () => void,
      setError: (msg: string) => void,
    ) => {
      if (!code.trim()) {
        advance();
        return;
      }
      productCodeCallbacksRef.current = { advance, setError };
      setProductCodeSearch({ rowIndex, code });
    },
    [],
  );

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
      const hasSacks = parseFloat(detail.quantity_sacks) > 0;
      const hasKg = parseFloat(detail.quantity_kg) > 0;
      if (!hasSacks && !hasKg) {
        form.setError("details", {
          message: `Fila ${i + 1}: Ingrese cantidad en sacos o en kg`,
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
        {/* Form Actions */}
        <div className="flex items-center gap-2 border-b pb-2">
          <Button
            variant="outline"
            colorIcon="green"
            size="sm"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X /> Cancelar
            </Button>
          )}
        </div>

        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
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

          <DateTimePickerForm
            control={form.control}
            name="movement_date"
            label="Fecha del Movimiento"
          />

          {isTraslado && (
            <>
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
            </>
          )}

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
            skipColumnsOnEnter={["product"]}
          />
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
    observations: "Observaciones",
    details: "Detalles del Documento",
  };
  return labels[field] || field;
}
