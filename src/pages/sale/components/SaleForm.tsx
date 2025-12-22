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
import { createSaleDetailColumns } from "./sale-details-columns";
import { useDynamicPrice } from "../lib/dynamic-price.hook";
import { Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";

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
  quantity: string; // Cantidad total en decimal (ej: 1.02) - SE ENVÍA AL BACKEND
  quantity_sacks: string; // Cantidad de sacos ingresada por el usuario (ej: 1)
  quantity_kg: string; // Kg adicionales ingresados por el usuario (ej: 1)
  unit_price: string;
  subtotal: number;
  igv: number;
  total: number;
  total_kg?: number; // Peso total en kg (ej: 51)
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

  // Estados para formulario inline de productos
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [additionalKg, setAdditionalKg] = useState<string>("0");
  const [manualPrice, setManualPrice] = useState<string>("");
  const [manualKg, setManualKg] = useState<string>("");
  const [useManualPrice, setUseManualPrice] = useState(false);

  const {
    fetchDynamicPrice,
    isLoading: isPriceLoading,
    error: priceError,
  } = useDynamicPrice();
  const [priceData, setPriceData] = useState<any>(null);

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
          const productWeight = product?.weight
            ? parseFloat(product.weight)
            : 0;
          const additionalKg = parseFloat(detail.quantity_kg || "0");
          const totalKg = roundTo6Decimals(
            productWeight * quantity + additionalKg
          );

          return {
            product_id: detail.product_id,
            product_name: product?.name,
            quantity: detail.quantity, // Cantidad total en decimal
            quantity_sacks: detail.quantity_sacks || detail.quantity, // Sacos (si no existe, usar quantity)
            quantity_kg: detail.quantity_kg || "0", // Kg adicionales
            unit_price: detail.unit_price,
            subtotal,
            igv,
            total,
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
  const selectedCurrency = form.watch("currency");

  // Función para obtener el símbolo de moneda
  const getCurrencySymbol = () => {
    const currency = CURRENCIES.find((c) => c.value === selectedCurrency);
    if (!currency) return "";
    if (selectedCurrency === "PEN") return "S/.";
    if (selectedCurrency === "USD") return "$";
    if (selectedCurrency === "EUR") return "€";
    return "";
  };

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
          setAutoNumero(response.next_formatted);
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

  // Efecto para obtener precio dinámico
  useEffect(() => {
    const fetchPrice = async () => {
      const customerId = form.watch("customer_id");

      if (!selectedProductId || !quantity || !customerId || useManualPrice) {
        setPriceData(null);
        return;
      }

      const qty = parseFloat(quantity) || 0;
      const addKg = parseFloat(additionalKg || "0");

      if (qty === 0 && addKg === 0) {
        setPriceData(null);
        return;
      }

      const selectedProduct = filteredProducts.find(
        (p) => p.id.toString() === selectedProductId
      );
      if (!selectedProduct) return;

      let quantitySacksDecimal = qty;
      const productWeight = selectedProduct?.weight
        ? parseFloat(selectedProduct.weight)
        : 0;

      if (productWeight > 0 && addKg > 0) {
        const additionalSacks = addKg / productWeight;
        quantitySacksDecimal = qty + additionalSacks;
      }

      const result = await fetchDynamicPrice({
        product_id: selectedProductId,
        person_id: customerId,
        quantity_sacks: quantitySacksDecimal,
        quantity_kg: 0,
      });

      if (result) {
        setPriceData(result);
      }
    };

    fetchPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProductId,
    quantity,
    additionalKg,
    form.watch("customer_id"),
    useManualPrice,
  ]);

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

  // Función de redondeo a 2 decimales para pagos
  const roundTo2Decimals = (value: number): number => {
    return Math.round(value * 100) / 100;
  };

  // Funciones para detalles
  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setSelectedProductId(detail.product_id);
    setQuantity(detail.quantity_sacks);
    setAdditionalKg(detail.quantity_kg);
    setEditingDetailIndex(index);
    // Hacer scroll al formulario
    document
      .getElementById("product-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleClearProductForm = () => {
    setSelectedProductId("");
    setQuantity("");
    setAdditionalKg("0");
    setManualPrice("");
    setManualKg("");
    setUseManualPrice(false);
    setPriceData(null);
    setEditingDetailIndex(null);
  };

  const handleAddProduct = () => {
    if (!selectedProductId || (!useManualPrice && !priceData)) return;
    if (useManualPrice && (!manualPrice || parseFloat(manualPrice) <= 0))
      return;
    if (useManualPrice && (!manualKg || parseFloat(manualKg) <= 0)) return;

    const selectedProduct = filteredProducts.find(
      (p) => p.id.toString() === selectedProductId
    );
    if (!selectedProduct) return;

    // Calcular la cantidad decimal
    let quantitySacksDecimal: number;
    let totalWeightKg: number;
    let unitPrice: number;
    let subtotal: number;

    if (useManualPrice) {
      totalWeightKg = parseFloat(manualKg || "0");
      quantitySacksDecimal = 0;
      unitPrice = parseFloat(manualPrice || "0");
      subtotal = roundTo6Decimals(totalWeightKg * unitPrice);
    } else {
      const qty = parseFloat(quantity) || 0;
      const addKg = parseFloat(additionalKg || "0");
      const productWeight = selectedProduct?.weight
        ? parseFloat(selectedProduct.weight)
        : 0;

      quantitySacksDecimal = qty;
      if (productWeight > 0 && addKg > 0) {
        const additionalSacks = addKg / productWeight;
        quantitySacksDecimal = qty + additionalSacks;
      }

      totalWeightKg =
        productWeight > 0 ? roundTo6Decimals(productWeight * qty + addKg) : 0;

      unitPrice = parseFloat(priceData.pricing.unit_price);
      subtotal = parseFloat(priceData.pricing.subtotal);
    }

    const igv = roundTo6Decimals(subtotal * 0.18);
    const total = roundTo6Decimals(subtotal + igv);

    const newDetail: DetailRow = {
      product_id: selectedProductId,
      product_name: selectedProduct?.name,
      quantity: useManualPrice
        ? totalWeightKg.toString()
        : quantitySacksDecimal.toString(),
      quantity_sacks: useManualPrice ? "0" : quantity,
      quantity_kg: useManualPrice ? manualKg || "0" : additionalKg || "0",
      unit_price: unitPrice.toString(),
      subtotal,
      igv,
      total,
      total_kg: totalWeightKg,
    };

    if (editingDetailIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = newDetail;
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    } else {
      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }

    handleClearProductForm();
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
    return roundTo2Decimals(sum);
  };

  const paymentAmountsMatchTotal = () => {
    if (selectedPaymentType !== "CONTADO") return true;
    const saleTotal = calculateDetailsTotal();
    const paymentTotal = calculatePaymentTotal();
    // Redondear ambos a 2 decimales para comparación
    const saleTotalRounded = roundTo2Decimals(saleTotal);
    const paymentTotalRounded = roundTo2Decimals(paymentTotal);
    return Math.abs(saleTotalRounded - paymentTotalRounded) < 0.01;
  };

  const handleFormSubmit = (data: any) => {
    const currencySymbol = getCurrencySymbol();

    // Validar que si es al contado, los montos de pago deben coincidir con el total
    if (selectedPaymentType === "CONTADO" && !paymentAmountsMatchTotal()) {
      errorToast(
        `El total pagado (${currencySymbol} ${formatNumber(
          calculatePaymentTotal()
        )}) debe ser igual al total de la venta (${currencySymbol} ${formatNumber(
          roundTo2Decimals(calculateDetailsTotal())
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
        `El total de cuotas (${currencySymbol} ${formatNumber(
          calculateInstallmentsTotal()
        )}) debe ser igual al total de la venta (${currencySymbol} ${formatNumber(
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

    // Preparar detalles para enviar al backend con quantity_sacks y quantity_kg
    const validDetails = details.map((detail) => ({
      product_id: detail.product_id,
      quantity_sacks: detail.quantity_sacks, // Cantidad de sacos
      quantity_kg: detail.quantity_kg, // Kg adicionales
      unit_price: detail.unit_price,
    }));

    onSubmit({
      ...data,
      details: validDetails,
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
          {/* Serie y Número Automático */}
          {mode === "create" && (autoSerie || autoNumero) && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {autoSerie && (
                <span className="text-xl font-semibold text-blue-600">
                  {autoSerie}
                </span>
              )}
              {autoSerie && autoNumero && (
                <span className="text-xl text-muted-foreground">-</span>
              )}
              {autoNumero && (
                <span className="text-xl font-semibold text-blue-600">
                  {autoNumero}
                </span>
              )}
            </div>
          )}

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
          {/* Formulario Inline para Agregar Productos */}
          <div
            id="product-form"
            className="space-y-4 p-4 bg-muted/30 rounded-lg border"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Selector de Producto - Ocupa más espacio */}
              <div className="md:col-span-4">
                <label className="text-sm font-medium mb-2 block">
                  Producto
                </label>
                <SearchableSelect
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  options={filteredProducts.map((product) => {
                    const stockInWarehouse = product.stock_warehouse?.find(
                      (stock) =>
                        stock.warehouse_id.toString() === selectedWarehouseId
                    );
                    return {
                      value: product.id.toString(),
                      label: `${product.codigo} - ${product.name}`,
                      description: `Stock: ${stockInWarehouse?.stock ?? 0}`,
                    };
                  })}
                  placeholder="Seleccione producto..."
                  buttonSize="default"
                  className="md:w-full!"
                />
              </div>

              {!useManualPrice ? (
                <>
                  {/* Cantidad Sacos */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      disabled={!selectedProductId}
                    />
                  </div>

                  {/* Kg Adicionales */}
                  {filteredProducts.find(
                    (p) => p.id.toString() === selectedProductId
                  )?.is_kg === 1 && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">
                        Kg Adicionales
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        value={additionalKg}
                        onChange={(e) => setAdditionalKg(e.target.value)}
                        disabled={!selectedProductId}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Cantidad en Kg (Manual) */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">
                      Cantidad (Kg)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                      value={manualKg}
                      onChange={(e) => setManualKg(e.target.value)}
                    />
                  </div>

                  {/* Precio por Kg (Manual) */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">
                      Precio por Kg
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Botones de Acción */}
              <div
                className={`md:col-span-${
                  useManualPrice
                    ? "4"
                    : filteredProducts.find(
                        (p) => p.id.toString() === selectedProductId
                      )?.is_kg === 1
                    ? "4"
                    : "6"
                } flex items-end gap-2`}
              >
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleAddProduct}
                  disabled={
                    !selectedProductId ||
                    (!useManualPrice && !priceData && !isPriceLoading) ||
                    (useManualPrice &&
                      (!manualPrice ||
                        parseFloat(manualPrice) <= 0 ||
                        !manualKg ||
                        parseFloat(manualKg) <= 0))
                  }
                  className="flex-1"
                >
                  {editingDetailIndex !== null ? (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Actualizar
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </>
                  )}
                </Button>
                {details.length > 0 && editingDetailIndex === null && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveDetail(details.length - 1)}
                    title="Eliminar el último producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {editingDetailIndex !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearProductForm}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseManualPrice(!useManualPrice)}
                  title={
                    useManualPrice
                      ? "Usar precio automático"
                      : "Usar precio manual"
                  }
                >
                  {useManualPrice ? "Auto" : "Manual"}
                </Button>
              </div>
            </div>

            {/* Información del Precio Dinámico */}
            {!useManualPrice && selectedProductId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isPriceLoading && (
                  <div className="md:col-span-3 flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Calculando precio...
                    </span>
                  </div>
                )}

                {priceError && !isPriceLoading && (
                  <div className="md:col-span-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      Error: {priceError}
                    </p>
                  </div>
                )}

                {priceData && !isPriceLoading && (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Categoría Cliente
                      </p>
                      <Badge variant="secondary">
                        {priceData.client_category.name}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Rango de Peso
                      </p>
                      <Badge variant="secondary">
                        {priceData.weight_range.formatted_range}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Peso Total
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        {priceData.quantities.total_weight_kg} kg
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Precio Unitario
                      </p>
                      <p className="text-sm font-bold">
                        {priceData.pricing.currency}{" "}
                        {priceData.pricing.unit_price}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Subtotal</p>
                      <p className="text-lg font-bold text-primary">
                        {priceData.pricing.currency}{" "}
                        {parseFloat(priceData.pricing.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tabla de Detalles */}
          <DataTable
            columns={createSaleDetailColumns({
              onEdit: handleEditDetail,
              onDelete: handleRemoveDetail,
            })}
            data={details}
            isVisibleColumnFilter={false}
          />

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
                  {getCurrencySymbol()}{" "}
                  {formatNumber(calculateDetailsSubtotal())}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-orange-600">
                  IGV (18%):
                </span>
                <span className="font-bold text-orange-600">
                  {getCurrencySymbol()} {formatNumber(calculateDetailsIGV())}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {getCurrencySymbol()} {formatNumber(calculateDetailsTotal())}
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
                        step="0.0001"
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
                        step="0.0001"
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
                        step="0.0001"
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
                        step="0.0001"
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
                        step="0.0001"
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
                        step="0.0001"
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
                        step="0.0001"
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
                    {getCurrencySymbol()}{" "}
                    {formatNumber(roundTo2Decimals(calculateDetailsTotal()))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Pagado:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {getCurrencySymbol()}{" "}
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
                        step="0.0001"
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
                          {getCurrencySymbol()}{" "}
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
                      ⚠️ El total de cuotas ({getCurrencySymbol()}{" "}
                      {formatNumber(calculateInstallmentsTotal())}) debe ser
                      igual al total de la venta ({getCurrencySymbol()}{" "}
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

        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}
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
    </Form>
  );
};
