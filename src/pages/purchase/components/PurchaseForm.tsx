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
import { Button } from "@/components/ui/button";
import { Loader, Plus, Trash2, Pencil, Users2, UserPlus } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSwitch } from "@/components/FormSwitch";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { CompanyResource } from "@/pages/company/lib/company.interface";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { SupplierDialog } from "@/pages/supplier/components/SupplierDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { errorToast } from "@/lib/core.function";
import { format } from "date-fns";
import {
  purchaseSchemaCreate,
  purchaseSchemaUpdate,
  type PurchaseSchema,
} from "../lib/purchase.schema";
import {
  CURRENCIES,
  DOCUMENT_TYPES,
  PAYMENT_TYPES,
  type PurchaseResource,
} from "../lib/purchase.interface";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import { ExcelGrid, type ExcelGridColumn, type ProductOption } from "@/components/ExcelGrid";
import { formatNumber } from "@/lib/formatCurrency";

interface PurchaseFormProps {
  defaultValues: Partial<PurchaseSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  suppliers: PersonResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
  purchase?: PurchaseResource;
  companies?: CompanyResource[];
  branches: BranchResource[];
  onRefreshSuppliers?: () => void;
}

interface DetailRow {
  product_id: string;
  product_code?: string;
  product_name?: string;
  quantity_kg: string;
  quantity_sacks: string;
  unit_price: string;
  tax: string;
  subtotal: number;
  total: number;
}

interface InstallmentRow {
  due_days: string;
  amount: string;
}

export const PurchaseForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  suppliers,
  warehouses,
  products,
  branches,
  onRefreshSuppliers,
}: PurchaseFormProps) => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WarehouseResource[]
  >([]);

  // Estado para el diálogo de proveedor
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [includeIgv, setIncludeIgv] = useState<boolean>(
    defaultValues.include_igv || false
  );

  const IGV_RATE = 0.18;

  // Estados para cuotas
  const [installments, setInstallments] = useState<InstallmentRow[]>([]);
  const [editingInstallmentIndex, setEditingInstallmentIndex] = useState<
    number | null
  >(null);
  const [currentInstallment, setCurrentInstallment] = useState<InstallmentRow>({
    due_days: "",
    amount: "",
  });

  // Formulario temporal solo para cuotas
  const installmentTempForm = useForm({
    defaultValues: {
      temp_due_days: currentInstallment.due_days,
      temp_amount: currentInstallment.amount,
    },
  });

  // Watchers para cuotas
  const selectedDueDays = installmentTempForm.watch("temp_due_days");
  const selectedAmount = installmentTempForm.watch("temp_amount");

  // Observers para cuotas
  useEffect(() => {
    if (selectedDueDays !== currentInstallment.due_days) {
      setCurrentInstallment((prev) => ({
        ...prev,
        due_days: selectedDueDays || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDueDays]);

  useEffect(() => {
    if (selectedAmount !== currentInstallment.amount) {
      setCurrentInstallment((prev) => ({
        ...prev,
        amount: selectedAmount || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAmount]);

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? purchaseSchemaCreate : purchaseSchemaUpdate
    ),
    defaultValues: {
      discount_global: 0,
      freight_cost: 0,
      loading_cost: 0,
      include_cost_account: true,
      reference_number: "",
      observations: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

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

  // Watch para el tipo de pago y el switch de IGV
  const selectedPaymentType = form.watch("payment_type");
  const watchIncludeIgv = form.watch("include_igv");

  // Sincronizar el estado local includeIgv con el formulario
  useEffect(() => {
    if (watchIncludeIgv !== undefined && watchIncludeIgv !== includeIgv) {
      setIncludeIgv(watchIncludeIgv);
    }
  }, [watchIncludeIgv, includeIgv]);

  // Establecer fechas automáticamente al cargar el formulario
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    form.setValue("issue_date", formattedDate);
    form.setValue("reception_date", formattedDate);

    // Establecer due_date a 30 días después por defecto
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const formattedDueDate = format(dueDate, "yyyy-MM-dd");
    form.setValue("due_date", formattedDueDate);
  }, [form]);

  // Inicializar details e installments desde defaultValues cuando se carga el formulario
  useEffect(() => {
    if (defaultValues.details && defaultValues.details.length > 0) {
      const mappedDetails = defaultValues.details.map((detail) => {
        const product = products.find(
          (p) => p.id.toString() === detail.product_id
        );
        const quantityKg = parseFloat(detail.quantity_kg);
        const unitPrice = parseFloat(detail.unit_price);
        const tax = parseFloat(detail.tax);
        const subtotal = quantityKg * unitPrice;
        const total = subtotal + tax;

        return {
          product_id: detail.product_id,
          product_code: product?.codigo,
          product_name: product?.name,
          quantity_kg: detail.quantity_kg,
          quantity_sacks: detail.quantity_sacks,
          unit_price: detail.unit_price,
          tax: detail.tax,
          subtotal,
          total,
        };
      });
      setDetails(mappedDetails);
      form.setValue("details", mappedDetails);
    }

    if (defaultValues.installments && defaultValues.installments.length > 0) {
      setInstallments(defaultValues.installments);
      form.setValue("installments", defaultValues.installments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funciones para ExcelGrid
  const handleAddRow = () => {
    const newDetail: DetailRow = {
      product_id: "",
      product_code: "",
      product_name: "",
      quantity_kg: "",
      quantity_sacks: "",
      unit_price: "",
      tax: "",
      subtotal: 0,
      total: 0,
    };
    const updatedDetails = [...details, newDetail];
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleRemoveRow = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleCellChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };

    // Recalcular totales cuando cambian cantidad_kg o precio
    if (field === "quantity_kg" || field === "unit_price") {
      const detail = updatedDetails[index];
      const quantityKg = parseFloat(detail.quantity_kg) || 0;
      const unitPrice = parseFloat(detail.unit_price) || 0;
      let subtotal = 0;
      let tax = 0;
      let total = 0;

      if (quantityKg > 0 && unitPrice > 0) {
        if (includeIgv) {
          // includeIgv=true: El precio NO incluye IGV, se lo agregamos
          subtotal = quantityKg * unitPrice;
          tax = subtotal * IGV_RATE;
          total = subtotal + tax;
        } else {
          // includeIgv=false: El precio YA incluye IGV, lo descomponemos
          const totalIncl = quantityKg * unitPrice;
          subtotal = totalIncl / (1 + IGV_RATE);
          tax = totalIncl - subtotal;
          total = totalIncl;
        }
      }

      updatedDetails[index] = {
        ...updatedDetails[index],
        tax: tax.toFixed(2),
        subtotal,
        total,
      };
    }

    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleProductSelect = (index: number, product: ProductOption) => {
    const selectedProduct = products.find(p => p.id.toString() === product.id);
    if (!selectedProduct) return;

    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      product_id: product.id,
      product_code: product.codigo,
      product_name: product.name,
    };

    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const calculateDetailsTotal = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.total || 0), 0);
    return sum;
  };

  // Calcula el total REAL de la compra (detalles - descuento + flete + estiba)
  const calculatePurchaseTotal = () => {
    const detailsTotal = calculateDetailsTotal();
    const discount = form.getValues("discount_global") || 0;
    const freight = form.getValues("freight_cost") || 0;
    const loading = form.getValues("loading_cost") || 0;
    return detailsTotal - discount + freight + loading;
  };

  const calculateSubtotalTotal = () => {
    const sum = details.reduce(
      (sum, detail) => sum + (detail.subtotal || 0),
      0
    );
    return sum;
  };

  const calculateTaxTotal = () => {
    const sum = details.reduce(
      (sum, detail) =>
        sum + (isNaN(parseFloat(detail.tax)) ? 0 : parseFloat(detail.tax)),
      0
    );
    return sum;
  };

  // Recalcular detalles cuando cambie el modo de interpretación de precios (incluye IGV o no)
  useEffect(() => {
    if (!details || details.length === 0) return;

    const recalculated = details.map((d) => {
      const q = parseFloat(d.quantity_kg || "0");
      const up = parseFloat(d.unit_price || "0");
      let subtotal = 0;
      let tax = 0;
      let total = 0;

      if (includeIgv) {
        // includeIgv=true: El precio NO incluye IGV, se lo agregamos
        subtotal = q * up;
        tax = subtotal * IGV_RATE;
        total = subtotal + tax;
      } else {
        // includeIgv=false: El precio YA incluye IGV, lo descomponemos
        const totalIncl = q * up;
        subtotal = totalIncl / (1 + IGV_RATE);
        tax = totalIncl - subtotal;
        total = totalIncl;
      }

      return {
        ...d,
        subtotal,
        total,
        tax: tax.toFixed(2),
      };
    });

    setDetails(recalculated);
    form.setValue("details", recalculated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeIgv]);

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
      header: "Descripción",
      type: "product-search",
      width: "300px",
      accessor: "product_name",
    },
    {
      id: "quantity_kg",
      header: "Cantidad (KG)",
      type: "number",
      width: "120px",
      accessor: "quantity_kg",
    },
    {
      id: "quantity_sacks",
      header: "Sacos",
      type: "number",
      width: "100px",
      accessor: "quantity_sacks",
    },
    {
      id: "unit_price",
      header: "Precio",
      type: "number",
      width: "120px",
      accessor: "unit_price",
    },
    {
      id: "subtotal",
      header: "Subtotal",
      type: "readonly",
      width: "120px",
      render: (row) => (
        <div className="h-full flex items-center justify-end px-2 py-1 text-sm">
          {row.subtotal ? `S/. ${formatNumber(row.subtotal)}` : "-"}
        </div>
      ),
    },
    {
      id: "tax",
      header: "IGV",
      type: "readonly",
      width: "100px",
      render: (row) => (
        <div className="h-full flex items-center justify-end px-2 py-1 text-sm">
          {row.tax ? `S/. ${formatNumber(parseFloat(row.tax))}` : "-"}
        </div>
      ),
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
  ];

  // Preparar opciones de productos para el grid
  const productOptions: ProductOption[] = products.map((product) => ({
    id: product.id.toString(),
    codigo: product.codigo,
    name: product.name,
  }));

  // Funciones para cuotas
  const handleAddInstallment = () => {
    if (!currentInstallment.due_days || !currentInstallment.amount) {
      return;
    }

    const newAmount = parseFloat(currentInstallment.amount);
    const purchaseTotal = calculatePurchaseTotal();

    // Calcular el total de cuotas (excluyendo la que se está editando si aplica)
    let currentInstallmentsTotal = installments.reduce((sum, inst, idx) => {
      if (editingInstallmentIndex !== null && idx === editingInstallmentIndex) {
        return sum; // Excluir la cuota que se está editando
      }
      return sum + parseFloat(inst.amount);
    }, 0);

    // Validar que no exceda el total de la compra
    if (currentInstallmentsTotal + newAmount > purchaseTotal) {
      errorToast(
        `El total de cuotas no puede exceder el total de la compra (${purchaseTotal.toFixed(
          2
        )})`
      );
      return;
    }

    const newInstallment: InstallmentRow = { ...currentInstallment };

    if (editingInstallmentIndex !== null) {
      const updatedInstallments = [...installments];
      updatedInstallments[editingInstallmentIndex] = newInstallment;
      setInstallments(updatedInstallments);
      form.setValue("installments", updatedInstallments);
      setEditingInstallmentIndex(null);
    } else {
      const updatedInstallments = [...installments, newInstallment];
      setInstallments(updatedInstallments);
      form.setValue("installments", updatedInstallments);
    }

    setCurrentInstallment({
      due_days: "",
      amount: "",
    });
    installmentTempForm.setValue("temp_due_days", "");
    installmentTempForm.setValue("temp_amount", "");
  };

  const handleEditInstallment = (index: number) => {
    const inst = installments[index];
    setCurrentInstallment(inst);
    // Actualizar formulario temporal manualmente
    installmentTempForm.setValue("temp_due_days", inst.due_days);
    installmentTempForm.setValue("temp_amount", inst.amount);
    setEditingInstallmentIndex(index);
  };

  const handleRemoveInstallment = (index: number) => {
    const updatedInstallments = installments.filter((_, i) => i !== index);
    setInstallments(updatedInstallments);
    form.setValue("installments", updatedInstallments);
  };

  const calculateInstallmentsTotal = () => {
    const sum = installments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0
    );
    return sum;
  };

  // Validar si las cuotas coinciden con el total (si hay cuotas)
  const installmentsMatchTotal = () => {
    if (installments.length === 0) return true; // Si no hay cuotas, está ok
    const purchaseTotal = calculatePurchaseTotal();
    const installmentsTotal = calculateInstallmentsTotal();
    return Math.abs(purchaseTotal - installmentsTotal) < 0.000001; // Tolerancia acorde a 6 decimales
  };

  const handleFormSubmit = (data: any) => {
    // Validar que si es a crédito, debe tener cuotas
    if (selectedPaymentType === "CREDITO" && installments.length === 0) {
      errorToast("Para pagos a crédito, debe agregar al menos una cuota");
      return;
    }

    // Validar que las cuotas coincidan con el total SOLO si es a crédito
    if (
      selectedPaymentType === "CREDITO" &&
      installments.length > 0 &&
      !installmentsMatchTotal()
    ) {
      errorToast(
        `El total de cuotas (${calculateInstallmentsTotal()}) debe ser igual al total de la compra (${calculatePurchaseTotal()})`
      );
      return;
    }

    // Preparar cuotas según el tipo de pago
    let validInstallments: { due_days: string; amount: number }[] | undefined;

    if (selectedPaymentType === "CONTADO") {
      // Cuando es al contado, no se envían cuotas
      validInstallments = undefined;
    } else {
      // Para pagos a crédito, usar las cuotas ingresadas
      validInstallments = installments
        .filter((inst) => inst.due_days && inst.amount)
        .map((inst) => ({
          due_days: inst.due_days,
          amount: parseFloat(inst.amount),
        }));
    }

    // Formatear detalles para el backend
    const formattedDetails = details.map((d) => ({
      product_id: parseInt(d.product_id),
      quantity_kg: parseFloat(d.quantity_kg),
      quantity_sacks: parseFloat(d.quantity_sacks),
      unit_price: parseFloat(d.unit_price),
      tax: parseFloat(d.tax),
    }));

    const submitData: any = {
      ...data,
      details: formattedDetails,
    };

    // Solo agregar installments si no es undefined
    if (validInstallments !== undefined) {
      submitData.installments = validInstallments;
    }

    onSubmit(submitData);
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
          icon={Users2}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormSelect
            control={form.control}
            label="Tienda"
            name="branch_id"
            placeholder="Seleccione una tienda"
            options={
              branches?.map((branch) => ({
                value: branch.id.toString(),
                label: branch.name,
                description: branch.address,
              })) || []
            }
            withValue={false}
          />

          {/* Proveedor y Almacén */}
          <div className="flex gap-2 items-end">
            <div className="truncate! flex-1">
              <FormSelect
                control={form.control}
                name="supplier_id"
                label="Proveedor"
                placeholder="Seleccione un proveedor"
                options={suppliers.map((supplier) => ({
                  value: supplier.id.toString(),
                  label:
                    supplier.business_name ??
                    supplier.names +
                      " " +
                      supplier.father_surname +
                      " " +
                      supplier.mother_surname,
                  description:
                    (supplier.number_document ?? "-") +
                    " | " +
                    (supplier.zone_name ?? "-"),
                }))}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsSupplierDialogOpen(true)}
              title="Agregar nuevo proveedor"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

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
            name="document_type"
            label="Tipo de Documento"
            placeholder="Seleccione"
            options={DOCUMENT_TYPES.map((dt) => ({
              value: dt.value,
              label: dt.label,
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
            name="reception_date"
            label="Fecha de Recepción"
            placeholder="Seleccione fecha"
          />

          <DatePickerFormField
            control={form.control}
            name="due_date"
            label="Fecha de Vencimiento"
            placeholder="Seleccione fecha"
          />

          <FormSelect
            control={form.control}
            name="currency"
            label="Moneda"
            placeholder="Seleccione"
            options={CURRENCIES.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
          />

          <FormField
            control={form.control}
            name="document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
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
            name="reference_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Referencia</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Número de referencia (opcional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="payment_type"
            label="Tipo de Pago"
            placeholder="Seleccione"
            options={PAYMENT_TYPES.map((pt) => ({
              value: pt.value,
              label: pt.label,
            }))}
          />

          <FormField
            control={form.control}
            name="discount_global"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descuento Global</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    variant="default"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                      )
                    }
                    value={field.value ?? 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="freight_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de Flete</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    variant="default"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                      )
                    }
                    value={field.value ?? 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loading_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de Estiba</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    variant="default"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                      )
                    }
                    value={field.value ?? 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* IGV */}
          <FormSwitch
            control={form.control}
            name="include_igv"
            text="Incluir IGV (18%)"
            textDescription="Los precios ingresados NO incluyen IGV"
            className="h-auto"
          />

          <FormSwitch
            control={form.control}
            name="include_cost_account"
            text="Incluir Cuenta de Costos"
            textDescription="Activar para incluir en contabilidad"
            className="h-auto"
          />

          <div className="md:col-span-3">
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Input
                      variant="default"
                      placeholder="Observaciones adicionales (opcional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </GroupFormSection>

        {/* Detalles */}
        <GroupFormSection
          title="Detalles de la Compra"
          icon={Users2}
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
            emptyMessage="Agregue productos a la compra"
            disabled={!selectedWarehouseId}
          />

          {details.length > 0 && (
            <div className="mt-4 space-y-2 p-4 bg-muted/30 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold">
                  S/. {formatNumber(calculateSubtotalTotal())}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-orange-600">
                  IGV (18%):
                </span>
                <span className="font-bold text-orange-600">
                  S/. {formatNumber(calculateTaxTotal())}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  S/. {formatNumber(calculateDetailsTotal())}
                </span>
              </div>
            </div>
          )}
        </GroupFormSection>

        {/* Cuotas - Solo mostrar si es a crédito */}
        {selectedPaymentType === "CREDITO" && (
          <GroupFormSection
            title="Cuotas de Pago"
            icon={Users2}
            cols={{ sm: 1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-sidebar rounded-lg">
              <FormField
                control={installmentTempForm.control}
                name="temp_due_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Vencimiento</FormLabel>
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
                control={installmentTempForm.control}
                name="temp_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        variant="default"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleAddInstallment}
                  disabled={
                    !currentInstallment.due_days || !currentInstallment.amount
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingInstallmentIndex !== null ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </div>

            {installments.length > 0 ? (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cuota #</TableHead>
                        <TableHead className="text-right">
                          Días Vencimiento
                        </TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installments.map((inst, index) => (
                        <TableRow key={index}>
                          <TableCell>Cuota {index + 1}</TableCell>
                          <TableCell className="text-right">
                            {inst.due_days} días
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {parseFloat(inst.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditInstallment(index)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveInstallment(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-bold">
                          TOTAL CUOTAS:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-blue-600">
                          {calculateInstallmentsTotal().toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {/* Advertencia de validación */}
                {!installmentsMatchTotal() && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                      ⚠️ El total de cuotas (
                      {calculateInstallmentsTotal().toFixed(2)}) debe ser igual
                      al total de la compra (
                      {calculatePurchaseTotal().toFixed(2)}).
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Badge variant="outline" className="text-lg p-3">
                  No hay cuotas agregadas
                </Badge>
              </div>
            )}
          </GroupFormSection>
          // <Card>
          //   <CardHeader>
          //     <CardTitle>Cuotas (Obligatorio)</CardTitle>
          //   </CardHeader>
          //   <CardContent className="space-y-4">

          //   </CardContent>
          // </Card>
        )}

        {/* <pre>
          <code>
            {JSON.stringify(form.getValues(), null, 2)}
            {JSON.stringify(form.formState.errors, null, 2)}
          </code>
        </pre> */}

        {/* Botones */}
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>

         <Button
            size="sm"
            type="submit"
            disabled={
              isSubmitting ||
              (mode === "create" && details.length === 0) ||
              (mode === "create" &&
                selectedPaymentType === "CREDITO" &&
                installments.length === 0) ||
              (mode === "create" &&
                installments.length > 0 &&
                !installmentsMatchTotal())
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>

      {/* Diálogo para agregar proveedor */}
      <SupplierDialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
        onSupplierCreated={() => {
          onRefreshSuppliers?.();
        }}
      />
    </Form>
  );
};
