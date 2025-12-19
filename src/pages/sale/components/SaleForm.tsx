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
import { Textarea } from "@/components/ui/textarea";
import {
  saleSchemaCreate,
  saleSchemaUpdate,
  type SaleSchema,
} from "../lib/sale.schema";
import {
  Loader,
  Plus,
  Trash2,
  Pencil,
  Users2,
  CreditCard,
  ListChecks,
  UserPlus,
} from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { SaleResource } from "../lib/sale.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import { useState, useEffect } from "react";
import { formatDecimalTrunc } from "@/lib/utils";
import { formatNumber } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DOCUMENT_TYPES,
  PAYMENT_TYPES,
  CURRENCIES,
} from "../lib/sale.interface";
import { errorToast } from "@/lib/core.function";
import { GroupFormSection } from "@/components/GroupFormSection";
import { ClientDialog } from "@/pages/client/components/ClientDialog";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { getNextSeries } from "../lib/sale.actions";
import { DataTable } from "@/components/DataTable";
import { SaleProductSheet, type DetailFormData } from "./SaleProductSheet";
import { createSaleDetailColumns } from "./sale-details-columns";

interface SaleFormProps {
  defaultValues: Partial<SaleSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  branches: BranchResource[];
  customers: PersonResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
  sale?: SaleResource;
  onRefreshClients: () => void;
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity: string;
  unit_price: string;
  subtotal: number;
  igv: number;
  total: number;
  additional_kg?: string; // kg adicionales cuando is_kg está habilitado
  total_kg?: number; // peso total calculado (peso base * cantidad + kg adicionales)
}

interface InstallmentRow {
  installment_number: string;
  due_days: string;
  amount: string;
}

export const SaleForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  branches,
  customers,
  warehouses,
  products,
  onRefreshClients,
}: SaleFormProps) => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WarehouseResource[]
  >([]);

  const [filteredProducts, setFilteredProducts] = useState<ProductResource[]>(
    []
  );

  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [editingProductData, setEditingProductData] = useState<DetailFormData | undefined>(undefined);

  // Hook para obtener vendedores
  const { data: workers = [] } = useAllWorkers();

  // Estados para serie y número automático
  const [autoSerie, setAutoSerie] = useState<string>("");
  const [autoNumero, setAutoNumero] = useState<string>("");

  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);

  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null
  );

  // Estados para cuotas
  const [installments, setInstallments] = useState<InstallmentRow[]>([]);
  const [editingInstallmentIndex, setEditingInstallmentIndex] = useState<
    number | null
  >(null);
  const [currentInstallment, setCurrentInstallment] = useState<InstallmentRow>({
    installment_number: "",
    due_days: "",
    amount: "",
  });

  // Formularios temporales
  const installmentTempForm = useForm({
    defaultValues: {
      temp_installment_number: currentInstallment.installment_number,
      temp_due_days: currentInstallment.due_days,
      temp_amount: currentInstallment.amount,
    },
  });

  // Watchers para cuotas
  const selectedInstallmentNumber = installmentTempForm.watch(
    "temp_installment_number"
  );
  const selectedDueDays = installmentTempForm.watch("temp_due_days");
  const selectedAmount = installmentTempForm.watch("temp_amount");

  // Observers para cuotas
  useEffect(() => {
    if (selectedInstallmentNumber !== currentInstallment.installment_number) {
      setCurrentInstallment((prev) => ({
        ...prev,
        installment_number: selectedInstallmentNumber || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstallmentNumber]);

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
      mode === "create" ? saleSchemaCreate : saleSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      details: details.length > 0 ? details : [],
      installments: installments.length > 0 ? installments : [],
    },
    mode: "onChange",
  });

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

      if (defaultValues.warehouse_id) {
        const filtered = products.filter((product) => {
          const stockInWarehouse = product.stock_warehouse?.find(
            (stock) =>
              stock.warehouse_id.toString() === defaultValues.warehouse_id
          );
          return stockInWarehouse && stockInWarehouse.stock > 0;
        });
        setFilteredProducts(filtered);
      }

      // Inicializar detalles
      if (defaultValues.details && defaultValues.details.length > 0) {
        const initialDetails = defaultValues.details.map((detail: any) => {
          const product = products.find(
            (p) => p.id.toString() === detail.product_id
          );
          const quantity = parseFloat(detail.quantity);
          const unitPrice = parseFloat(detail.unit_price);
          const subtotal = roundTo6Decimals(quantity * unitPrice);
          const igv = roundTo6Decimals(subtotal * 0.18);
          const total = roundTo6Decimals(subtotal + igv);

          // Calcular peso total en kg
          const productWeight = product?.weight ? parseFloat(product.weight) : 0;
          const additionalKg = parseFloat(detail.additional_kg || "0");
          const totalKg = roundTo6Decimals(productWeight * quantity + additionalKg);

          return {
            product_id: detail.product_id,
            product_name: product?.name,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            subtotal,
            igv,
            total,
            additional_kg: detail.additional_kg || "0",
            total_kg: totalKg,
          };
        });
        setDetails(initialDetails);
        form.setValue("details", initialDetails);
      }

      // Inicializar cuotas
      if (defaultValues.installments && defaultValues.installments.length > 0) {
        const initialInstallments = defaultValues.installments.map(
          (inst: any) => ({
            installment_number: inst.installment_number,
            due_days: inst.due_days,
            amount: inst.amount,
          })
        );
        setInstallments(initialInstallments);
        form.setValue("installments", initialInstallments);
      }

      // Disparar validación después de setear valores en modo edición
      form.trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch para el tipo de pago
  const selectedPaymentType = form.watch("payment_type");

  // Watch para filtrado en cascada
  const selectedBranchId = form.watch("branch_id");
  const selectedWarehouseId = form.watch("warehouse_id");
  const selectedDocumentType = form.watch("document_type");

  // Efecto para filtrar warehouses cuando cambia branch
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

  // Efecto para filtrar productos cuando cambia warehouse
  useEffect(() => {
    if (selectedWarehouseId) {
      const filtered = products.filter((product) => {
        // Buscar si el producto tiene stock en el warehouse seleccionado
        const stockInWarehouse = product.stock_warehouse?.find(
          (stock) => stock.warehouse_id.toString() === selectedWarehouseId
        );
        // Solo incluir productos que tienen stock mayor a 0 en ese warehouse
        return stockInWarehouse && stockInWarehouse.stock > 0;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouseId, products]);

  // Efecto para obtener serie y número automático
  useEffect(() => {
    const fetchNextSeries = async () => {
      if (selectedBranchId && selectedDocumentType && mode === "create") {
        try {
          const response = await getNextSeries(
            Number(selectedBranchId),
            selectedDocumentType
          );
          setAutoSerie(response.serie);
          setAutoNumero(response.numero);
        } catch (error) {
          console.error("Error fetching next series:", error);
          setAutoSerie("");
          setAutoNumero("");
        }
      } else {
        setAutoSerie("");
        setAutoNumero("");
      }
    };
    fetchNextSeries();
  }, [selectedBranchId, selectedDocumentType, mode]);

  // Establecer fecha de emisión automáticamente al cargar el formulario
  useEffect(() => {
    // Inicializar montos de pago a 0
    if (!form.getValues("amount_cash")) {
      form.setValue("amount_cash", "0");
    }
    if (!form.getValues("amount_card")) {
      form.setValue("amount_card", "0");
    }
    if (!form.getValues("amount_yape")) {
      form.setValue("amount_yape", "0");
    }
    if (!form.getValues("amount_plin")) {
      form.setValue("amount_plin", "0");
    }
    if (!form.getValues("amount_deposit")) {
      form.setValue("amount_deposit", "0");
    }
    if (!form.getValues("amount_transfer")) {
      form.setValue("amount_transfer", "0");
    }
    if (!form.getValues("amount_other")) {
      form.setValue("amount_other", "0");
    }
  }, [form]);

  // Función de redondeo a 6 decimales
  const roundTo6Decimals = (value: number): number => {
    return Math.round(value * 1000000) / 1000000;
  };

  // Funciones para detalles
  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setEditingProductData(detail as DetailFormData);
    setEditingDetailIndex(index);
    setIsProductSheetOpen(true);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleAddProductClick = () => {
    setEditingProductData(undefined);
    setEditingDetailIndex(null);
    setIsProductSheetOpen(true);
  };

  const handleProductSubmit = (data: DetailFormData) => {
    if (editingDetailIndex !== null) {
      // Actualizar detalle existente
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = data;
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
      setEditingDetailIndex(null);
    } else {
      // Agregar nuevo detalle
      const updatedDetails = [...details, data];
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }
    setIsProductSheetOpen(false);
    setEditingProductData(undefined);
  };

  const calculateDetailsSubtotal = () => {
    const sum = details.reduce(
      (sum, detail) => sum + (detail.subtotal || 0),
      0
    );
    return roundTo6Decimals(sum);
  };

  const calculateDetailsIGV = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.igv || 0), 0);
    return roundTo6Decimals(sum);
  };

  const calculateDetailsTotal = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.total || 0), 0);
    return roundTo6Decimals(sum);
  };

  const calculateTotalWeight = () => {
    // Calcular el peso total sumando el total_kg de cada detalle
    const totalWeight = details.reduce((sum, detail) => {
      return sum + (detail.total_kg || 0);
    }, 0);
    return roundTo6Decimals(totalWeight);
  };

  // Funciones para cuotas
  const handleAddInstallment = () => {
    if (
      !currentInstallment.installment_number ||
      !currentInstallment.due_days ||
      !currentInstallment.amount
    ) {
      return;
    }

    const newAmount = parseFloat(currentInstallment.amount);
    const saleTotal = calculateDetailsTotal();

    // Calcular el total de cuotas (excluyendo la que se está editando si aplica)
    let currentInstallmentsTotal = installments.reduce((sum, inst, idx) => {
      if (editingInstallmentIndex !== null && idx === editingInstallmentIndex) {
        return sum;
      }
      return sum + parseFloat(inst.amount);
    }, 0);

    // Validar que no exceda el total de la venta
    if (currentInstallmentsTotal + newAmount > saleTotal) {
      errorToast(
        `El total de cuotas no puede exceder el total de la venta (${formatDecimalTrunc(
          saleTotal,
          6
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
      installment_number: "",
      due_days: "",
      amount: "",
    });
    installmentTempForm.setValue("temp_installment_number", "");
    installmentTempForm.setValue("temp_due_days", "");
    installmentTempForm.setValue("temp_amount", "");
  };

  const handleEditInstallment = (index: number) => {
    const inst = installments[index];
    setCurrentInstallment(inst);
    installmentTempForm.setValue(
      "temp_installment_number",
      inst.installment_number
    );
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
    return roundTo6Decimals(sum);
  };

  const installmentsMatchTotal = () => {
    if (installments.length === 0) return true;
    const saleTotal = calculateDetailsTotal();
    const installmentsTotal = calculateInstallmentsTotal();
    return Math.abs(saleTotal - installmentsTotal) < 0.000001;
  };

  // Funciones para montos de pago
  const calculatePaymentTotal = () => {
    const cash = parseFloat(form.watch("amount_cash") || "0");
    const card = parseFloat(form.watch("amount_card") || "0");
    const yape = parseFloat(form.watch("amount_yape") || "0");
    const plin = parseFloat(form.watch("amount_plin") || "0");
    const deposit = parseFloat(form.watch("amount_deposit") || "0");
    const transfer = parseFloat(form.watch("amount_transfer") || "0");
    const other = parseFloat(form.watch("amount_other") || "0");
    const sum = cash + card + yape + plin + deposit + transfer + other;
    return roundTo6Decimals(sum);
  };

  const paymentAmountsMatchTotal = () => {
    if (selectedPaymentType !== "CONTADO") return true;
    const saleTotal = calculateDetailsTotal();
    const paymentTotal = calculatePaymentTotal();
    return Math.abs(saleTotal - paymentTotal) < 0.000001;
  };

  const handleFormSubmit = (data: any) => {
    // Validar que si es al contado, los montos de pago deben coincidir con el total
    if (selectedPaymentType === "CONTADO" && !paymentAmountsMatchTotal()) {
      errorToast(
        `El total pagado (${formatNumber(
          calculatePaymentTotal()
        )}) debe ser igual al total de la venta (${formatNumber(
          calculateDetailsTotal()
        )})`
      );
      return;
    }

    // Validar que si es a crédito, debe tener cuotas
    if (selectedPaymentType === "CREDITO" && installments.length === 0) {
      errorToast("Para pagos a crédito, debe agregar al menos una cuota");
      return;
    }

    // Validar que las cuotas coincidan con el total si hay cuotas
    if (installments.length > 0 && !installmentsMatchTotal()) {
      errorToast(
        `El total de cuotas (${formatNumber(
          calculateInstallmentsTotal()
        )}) debe ser igual al total de la venta (${formatNumber(
          calculateDetailsTotal()
        )})`
      );
      return;
    }

    // Preparar cuotas según el tipo de pago
    let validInstallments: {
      installment_number: number;
      due_days: string;
      amount: string;
    }[];

    if (selectedPaymentType === "CONTADO") {
      // Para pagos al contado, las cuotas van vacías
      validInstallments = [];
    } else {
      // Para pagos a crédito, usar las cuotas ingresadas
      validInstallments = installments
        .filter(
          (inst) => inst.installment_number && inst.due_days && inst.amount
        )
        .map((inst) => ({
          installment_number: parseInt(inst.installment_number),
          due_days: inst.due_days,
          amount: inst.amount,
        }));
    }

    const totalWeight = calculateTotalWeight();

    onSubmit({
      ...data,
      details,
      installments: validInstallments,
      total_weight: totalWeight,
    });
  };

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
          cols={{ sm: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelect
              control={form.control}
              name="branch_id"
              label="Tienda"
              placeholder="Seleccione una tienda"
              options={
                branches?.map((branch) => ({
                  value: branch.id.toString(),
                  label: branch.name,
                  description: branch.address,
                })) || []
              }
              disabled={mode === "update"}
            />

            <div className="flex gap-2 items-end">
              <div className="truncate! flex-1">
                <FormSelect
                  control={form.control}
                  name="customer_id"
                  label="Cliente"
                  placeholder="Seleccione un cliente"
                  options={customers.map((customer) => ({
                    value: customer.id.toString(),
                    label:
                      customer.business_name ??
                      customer.names +
                        " " +
                        customer.father_surname +
                        " " +
                        customer.mother_surname,
                    description:
                      (customer.number_document ?? "-") +
                      " | " +
                      (customer.zone_name ?? "-"),
                  }))}
                  disabled={mode === "update"}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsClientDialogOpen(true)}
                title="Agregar nuevo cliente"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            <FormSelect
              control={form.control}
              name="vendedor_id"
              label="Vendedor"
              placeholder="Seleccionar vendedor (opcional)"
              options={[
                { value: "", label: "Sin vendedor" },
                ...(workers?.map((worker) => ({
                  value: worker.id.toString(),
                  label: `${worker.names} ${worker.father_surname}`,
                  description: worker.number_document ?? "-",
                })) || []),
              ]}
            />

            <FormSelect
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Seleccione un almacén"
              options={filteredWarehouses.map((warehouse) => ({
                value: warehouse.id.toString(),
                label: warehouse.name,
              }))}
              disabled={mode === "update" || !selectedBranchId}
            />

            <FormSelect
              control={form.control}
              name="document_type"
              label="Tipo de Documento"
              placeholder="Seleccione tipo"
              options={DOCUMENT_TYPES.map((dt) => ({
                value: dt.value,
                label: dt.label,
              }))}
            />

            {/* Auto-generated Serie */}
            {mode === "create" && autoSerie && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Serie (Automática)
                </label>
                <Input
                  value={autoSerie}
                  readOnly
                  className="bg-muted"
                  placeholder="Serie automática"
                />
              </div>
            )}

            {/* Auto-generated Numero */}
            {mode === "create" && autoNumero && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Número (Automático)
                </label>
                <Input
                  value={autoNumero}
                  readOnly
                  className="bg-muted"
                  placeholder="Número automático"
                />
              </div>
            )}

            <DatePickerFormField
              control={form.control}
              name="issue_date"
              label="Fecha de Emisión"
              placeholder="Seleccione fecha"
              dateFormat="dd/MM/yyyy"
              disabledRange={{
                after: new Date(),
              }}
            />

            <FormSelect
              control={form.control}
              name="payment_type"
              label="Tipo de Pago"
              placeholder="Seleccione tipo"
              options={PAYMENT_TYPES.map((pt) => ({
                value: pt.value,
                label: pt.label,
              }))}
            />

            <FormSelect
              control={form.control}
              name="currency"
              label="Moneda"
              placeholder="Seleccione moneda"
              options={CURRENCIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
            />

            <div className="md:col-span-2 lg:col-span-3">
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </GroupFormSection>

        {/* Detalles */}
        <GroupFormSection
          title="Detalles de la Venta"
          icon={ListChecks}
          cols={{ sm: 1 }}
        >
          <DataTable
            columns={createSaleDetailColumns({
              onEdit: handleEditDetail,
              onDelete: handleRemoveDetail,
            })}
            data={details}
            isVisibleColumnFilter={false}
          >
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleAddProductClick}
              disabled={!selectedWarehouseId || !form.watch("customer_id")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </DataTable>

          {/* Resumen de totales */}
          {details.length > 0 && (
            <div className="mt-4 space-y-2 p-4 bg-muted/30 rounded-lg border">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-bold text-blue-600">Peso Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatDecimalTrunc(calculateTotalWeight(), 2)} kg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold">
                  {formatNumber(calculateDetailsSubtotal())}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-orange-600">
                  IGV (18%):
                </span>
                <span className="font-bold text-orange-600">
                  {formatNumber(calculateDetailsIGV())}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {formatNumber(calculateDetailsTotal())}
                </span>
              </div>
            </div>
          )}
        </GroupFormSection>

        {/* Métodos de Pago - Solo mostrar si es al contado */}
        {mode === "create" && selectedPaymentType === "CONTADO" && (
          <GroupFormSection
            title="Métodos de Pago"
            icon={CreditCard}
            cols={{ sm: 1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="amount_cash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto en Efectivo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_card"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto con Tarjeta</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_yape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Yape</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_plin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Plin</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Depósito</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_transfer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Transferencia</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_other"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otro Método</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mostrar total de pagos vs total de venta */}
            {details.length > 0 && (
              <div className="mt-4 p-4 bg-sidebar rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total de la Venta:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatNumber(calculateDetailsTotal())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Pagado:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatNumber(calculatePaymentTotal())}
                  </span>
                </div>
                {!paymentAmountsMatchTotal() && (
                  <Badge
                    variant="amber"
                    size="lg"
                    className="w-full justify-center p-2"
                  >
                    ⚠️ El total pagado debe ser igual al total de la venta
                  </Badge>
                )}
              </div>
            )}
          </GroupFormSection>
        )}

        {/* Cuotas - Solo mostrar si es a crédito */}
        {selectedPaymentType === "CREDITO" && (
          <GroupFormSection
            title="Cuotas de Pago"
            icon={ListChecks}
            cols={{ sm: 1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-sidebar rounded-lg">
              <FormField
                control={installmentTempForm.control}
                name="temp_installment_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Cuota</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={installmentTempForm.control}
                name="temp_due_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Vencimiento</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
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
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="default"
                  size={"sm"}
                  onClick={handleAddInstallment}
                  disabled={
                    !currentInstallment.installment_number ||
                    !currentInstallment.due_days ||
                    !currentInstallment.amount
                  }
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
                          <TableCell>Cuota {inst.installment_number}</TableCell>
                          <TableCell className="text-right">
                            {inst.due_days} días
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatDecimalTrunc(parseFloat(inst.amount), 6)}
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
                          {formatDecimalTrunc(calculateInstallmentsTotal(), 6)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {!installmentsMatchTotal() && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                      ⚠️ El total de cuotas (
                      {formatNumber(calculateInstallmentsTotal())}) debe ser
                      igual al total de la venta (
                      {formatNumber(calculateDetailsTotal())})
                    </p>
                  </div>
                )}
              </>
            ) : (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CreditCard />
                  </EmptyMedia>
                  <EmptyTitle>No hay cuotas agregadas</EmptyTitle>
                  <EmptyDescription>
                    Agregue las cuotas de pago utilizando el formulario
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </GroupFormSection>
        )}

        {/* <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre>
        <Button onClick={() => form.trigger()}>Button</Button> */}

        {/* Botones */}
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (mode === "create" && details.length === 0) ||
              (mode === "create" &&
                selectedPaymentType === "CONTADO" &&
                !paymentAmountsMatchTotal()) ||
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
      <ClientDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onClientCreated={() => {
          onRefreshClients?.();
        }}
      />

      {/* Sheet para agregar/editar productos */}
      <SaleProductSheet
        open={isProductSheetOpen}
        onClose={() => {
          setIsProductSheetOpen(false);
          setEditingProductData(undefined);
          setEditingDetailIndex(null);
        }}
        products={filteredProducts}
        customerId={form.watch("customer_id") || ""}
        warehouseId={selectedWarehouseId || ""}
        onSubmit={handleProductSubmit}
        defaultValues={editingProductData}
        mode={editingDetailIndex !== null ? "update" : "create"}
      />
    </Form>
  );
};
