"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useDynamicPrice } from "../lib/dynamic-price.hook";
import {
  ExcelGrid,
  type ExcelGridColumn,
  type ProductOption,
} from "@/components/ExcelGrid";
import { FormInput } from "@/components/FormInput";
import { Badge } from "@/components/ui/badge";

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
  product_code?: string;
  product_name?: string;
  quantity: string; // Cantidad total en decimal (ej: 1.02) - SE ENVÍA AL BACKEND
  quantity_sacks: string; // Cantidad de sacos ingresada por el usuario (ej: 1)
  quantity_kg: string; // Kg adicionales ingresados por el usuario (ej: 1)
  unit_price: string; // Precio unitario
  subtotal: number;
  igv: number;
  total: number;
  total_kg?: number; // Peso total en kg (ej: 51)
  price_from_api?: boolean; // Indica si el precio viene de la API (bloquea edición)
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

  const { fetchDynamicPrice } = useDynamicPrice();

  // Hook para obtener vendedores
  const { data: workers = [] } = useAllWorkers();

  // Estados para serie y número automático
  const [autoSerie, setAutoSerie] = useState<string>("");
  const [autoNumero, setAutoNumero] = useState<string>("");

  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);

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
            product_code: product?.codigo,
            product_name: product?.name,
            quantity: detail.quantity, // Cantidad total en decimal
            quantity_sacks: detail.quantity_sacks || detail.quantity, // Sacos (si no existe, usar quantity)
            quantity_kg: detail.quantity_kg || "0", // Kg adicionales
            unit_price: detail.unit_price,
            subtotal,
            igv,
            total,
            total_kg: totalKg,
            price_from_api: false, // En modo edición, permitir editar precios
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

  // Función de redondeo a 6 decimales
  const roundTo6Decimals = (value: number): number => {
    return Math.round(value * 1000000) / 1000000;
  };

  // Funciones para el ExcelGrid
  const handleAddRow = () => {
    const newDetail: DetailRow = {
      product_id: "",
      product_code: "",
      product_name: "",
      quantity: "",
      quantity_sacks: "",
      quantity_kg: "0",
      unit_price: "",
      subtotal: 0,
      igv: 0,
      total: 0,
      total_kg: 0,
      price_from_api: false,
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

  const handleCellChange = async (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedDetails = [...details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };

    // Recalcular totales cuando cambian cantidad o kg adicionales
    if (field === "quantity_sacks" || field === "quantity_kg") {
      const detail = updatedDetails[index];
      const product = filteredProducts.find(
        (p) => p.id.toString() === detail.product_id
      );

      if (product && detail.product_id) {
        const qty = parseFloat(detail.quantity_sacks) || 0;
        const addKg = parseFloat(detail.quantity_kg) || 0;
        const productWeight = parseFloat(product.weight || "0");

        // Calcular peso total en kg (sacos × peso_por_saco + kg_adicionales)
        const totalWeightKg =
          productWeight > 0
            ? roundTo6Decimals(productWeight * qty + addKg)
            : addKg;

        // El campo quantity representa solo la cantidad de sacos
        // Los kg adicionales se manejan por separado en quantity_kg
        const quantitySacksDecimal = qty;

        // Actualizar estado inmediatamente
        setDetails(updatedDetails);
        form.setValue("details", updatedDetails);

        // Verificar si hay cantidad para procesar
        if (qty > 0 || addKg > 0) {
          // SIEMPRE llamar a la API cuando cambian las cantidades
          const customerId = form.watch("customer_id");

          try {
            const result = await fetchDynamicPrice({
              product_id: detail.product_id,
              person_id: customerId || "",
              quantity_sacks: qty,
              quantity_kg: addKg,
            });

            if (result) {
              const unitPrice = parseFloat(result.pricing.unit_price);
              const subtotal = parseFloat(result.pricing.subtotal);
              const igv = roundTo6Decimals(subtotal * 0.18);
              const total = roundTo6Decimals(subtotal + igv);

              const finalDetails = [...updatedDetails];
              finalDetails[index] = {
                ...finalDetails[index],
                quantity: quantitySacksDecimal.toString(),
                unit_price: unitPrice.toString(),
                subtotal,
                igv,
                total,
                total_kg: totalWeightKg,
                price_from_api: true,
              };

              setDetails(finalDetails);
              form.setValue("details", finalDetails);
            } else {
              // Si la API no retorna resultado, resetear quantity_sacks a 0 y mantener quantity_kg
              const clearedDetails = [...updatedDetails];
              clearedDetails[index] = {
                ...clearedDetails[index],
                quantity: "0", // Resetear quantity_sacks a 0
                quantity_sacks: "0", // Resetear quantity_sacks a 0
                unit_price: "",
                subtotal: 0,
                igv: 0,
                total: 0,
                total_kg: addKg, // Solo los kg adicionales
                price_from_api: false,
              };

              setDetails(clearedDetails);
              form.setValue("details", clearedDetails);

              errorToast(
                "Error al obtener el precio dinámico. Por favor, ingrese el precio manualmente."
              );
            }
          } catch (error: any) {
            console.error("Error fetching dynamic price:", error);

            // Si la API falla, resetear quantity_sacks a 0 y mantener quantity_kg
            const clearedDetails = [...updatedDetails];
            clearedDetails[index] = {
              ...clearedDetails[index],
              quantity: "0", // Resetear quantity_sacks a 0
              quantity_sacks: "0", // Resetear quantity_sacks a 0
              unit_price: "",
              subtotal: 0,
              igv: 0,
              total: 0,
              total_kg: addKg, // Solo los kg adicionales
              price_from_api: false,
            };

            setDetails(clearedDetails);
            form.setValue("details", clearedDetails);

            const errorMessage =
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              "Error al obtener el precio dinámico. Por favor, ingrese el precio manualmente.";
            errorToast(errorMessage);
          }
        }
      } else {
        // Si no hay producto, solo actualizar el estado
        setDetails(updatedDetails);
        form.setValue("details", updatedDetails);
      }
    } else if (field === "unit_price") {
      // Cuando cambia el precio unitario manualmente, recalcular totales
      // El precio ingresado es por KILOGRAMO
      // Si estoy editando precio = la API falló, solo permito editar quantity_kg y unit_price
      const detail = updatedDetails[index];
      const unitPrice = parseFloat(value) || 0;
      const qtySacks = parseFloat(detail.quantity_sacks) || 0;
      const addKg = parseFloat(detail.quantity_kg) || 0;

      // Obtener el peso del producto
      const product = filteredProducts.find(
        (p) => p.id.toString() === detail.product_id
      );
      const productWeight = product?.weight ? parseFloat(product.weight) : 0;

      // Calcular peso total en kg (sacos × peso_por_saco + kg_adicionales)
      const totalWeightKg =
        productWeight > 0
          ? roundTo6Decimals(productWeight * qtySacks + addKg)
          : addKg;

      // El campo quantity representa solo la cantidad de sacos
      const quantityDecimal = qtySacks;

      // Calcular totales basados en peso_total_kg × precio_por_kg
      const subtotal =
        totalWeightKg > 0 && unitPrice > 0
          ? roundTo6Decimals(totalWeightKg * unitPrice)
          : 0;
      const igv = subtotal > 0 ? roundTo6Decimals(subtotal * 0.18) : 0;
      const total = subtotal > 0 ? roundTo6Decimals(subtotal + igv) : 0;

      updatedDetails[index] = {
        ...updatedDetails[index],
        quantity: quantityDecimal.toString(),
        // NO resetear quantity_kg - mantener el valor actual
        subtotal,
        igv,
        total,
        total_kg: totalWeightKg,
        price_from_api: false, // El precio fue ingresado manualmente
      };

      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    } else {
      // Para otros campos, solo actualizar el estado
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }
  };

  const handleProductSelect = async (index: number, product: ProductOption) => {
    const selectedProduct = filteredProducts.find(
      (p) => p.id.toString() === product.id
    );
    if (!selectedProduct) return;

    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      product_id: product.id,
      product_code: product.codigo,
      product_name: product.name,
      quantity_sacks: "",
      quantity_kg: "0",
      unit_price: "",
      subtotal: 0,
      igv: 0,
      total: 0,
      total_kg: 0,
      price_from_api: false,
    };

    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
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
      header: "Descripción",
      type: "product-search",
      width: "300px",
      accessor: "product_name",
    },
    {
      id: "quantity_sacks",
      header: "Cantidad",
      type: "number",
      width: "100px",
      accessor: "quantity_sacks",
    },
    {
      id: "quantity_kg",
      header: "Kg Adic.",
      type: "number",
      width: "100px",
      accessor: "quantity_kg",
    },
    {
      id: "unit_price",
      header: "Precio",
      type: "number",
      width: "120px",
      accessor: "unit_price",
      disabled: (row) => row.price_from_api === true, // Deshabilitar si viene de la API
    },
    {
      id: "subtotal",
      header: "Subtotal",
      type: "readonly",
      width: "120px",
      render: (row) => (
        <div className="h-full flex items-center justify-end px-2 py-1 text-sm font-semibold">
          {row.subtotal
            ? `${getCurrencySymbol()} ${formatNumber(row.subtotal)}`
            : "-"}
        </div>
      ),
    },
  ];

  // Preparar opciones de productos para el grid
  const productOptions: ProductOption[] = filteredProducts.map((product) => ({
    id: product.id.toString(),
    codigo: product.codigo,
    name: product.name,
  }));

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

  const handleFormSubmit = (data: any) => {
    const currencySymbol = getCurrencySymbol();

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
          cols={{ sm: 1, md: 3, lg: 5 }}
          headerExtra={
            mode === "create" &&
            autoSerie &&
            autoNumero && (
              <Badge variant="default" className="px-3 py-1" size="default">
                {autoSerie} - {autoNumero}
              </Badge>
            )
          }
        >
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
            name="payment_type"
            label="Tipo de Pago"
            placeholder="Seleccione tipo"
            options={PAYMENT_TYPES.map((pt) => ({
              value: pt.value,
              label: pt.label,
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
            name="currency"
            label="Moneda"
            placeholder="Seleccione moneda"
            options={CURRENCIES.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
          />

          <div className="lg:col-span-2">
            <FormInput
              name="observations"
              control={form.control}
              label="Observaciones"
              placeholder="Ingrese observaciones adicionales"
            />
          </div>
        </GroupFormSection>

        {/* Detalles, Cuotas y Resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Columna Izquierda: Detalles y Cuotas */}
          <div className="space-y-6">
            {/* Detalles */}
            <GroupFormSection
              title="Detalles de la Venta"
              icon={ListChecks}
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
                emptyMessage="Seleccione un almacén y cliente para comenzar."
                disabled={!selectedWarehouseId || !form.watch("customer_id")}
              />
            </GroupFormSection>

            {/* Cuotas - Solo mostrar si es a crédito */}
            {selectedPaymentType === "CREDITO" && (
              <GroupFormSection
                title="Cuotas de Pago"
                icon={CreditCard}
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
                      {editingInstallmentIndex !== null
                        ? "Actualizar"
                        : "Agregar"}
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
                            <TableHead className="text-center">
                              Acciones
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {installments.map((inst, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                Cuota {inst.installment_number}
                              </TableCell>
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
                                    onClick={() =>
                                      handleRemoveInstallment(index)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-right font-bold"
                            >
                              TOTAL CUOTAS:
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg text-blue-600">
                              {getCurrencySymbol()}{" "}
                              {formatDecimalTrunc(
                                calculateInstallmentsTotal(),
                                6
                              )}
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
          </div>

          {/* Columna Derecha: Resumen Sticky */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <GroupFormSection
              title="Resumen"
              icon={CreditCard}
              cols={{ sm: 1 }}
            >
              <div className="space-y-3">
                {/* Peso Total */}
                <div className="flex flex-col gap-1 pb-3 border-b">
                  <span className="text-xs uppercase font-medium text-muted-foreground">
                    Peso Total
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatDecimalTrunc(calculateTotalWeight(), 2)} kg
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-semibold">
                    {getCurrencySymbol()}{" "}
                    {formatNumber(calculateDetailsSubtotal())}
                  </span>
                </div>

                {/* IGV */}
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    IGV (18%)
                  </span>
                  <span className="font-semibold text-orange-600">
                    {getCurrencySymbol()} {formatNumber(calculateDetailsIGV())}
                  </span>
                </div>

                {/* Total */}
                <div className="flex flex-col gap-1 pt-3 border-t-2">
                  <span className="text-xs uppercase font-medium text-muted-foreground">
                    Total a Pagar
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {getCurrencySymbol()}{" "}
                    {formatNumber(calculateDetailsTotal())}
                  </span>
                </div>

                {/* Resumen de Cuotas si es a crédito */}
                {selectedPaymentType === "CREDITO" &&
                  installments.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-medium text-muted-foreground">
                          Cuotas
                        </span>
                        <Badge variant="secondary" size="sm">
                          {installments.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Total Cuotas
                        </span>
                        <span
                          className={`font-semibold ${
                            installmentsMatchTotal()
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {getCurrencySymbol()}{" "}
                          {formatNumber(calculateInstallmentsTotal())}
                        </span>
                      </div>
                      {!installmentsMatchTotal() && (
                        <div className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950 p-2 rounded">
                          ⚠️ No coincide con el total
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </GroupFormSection>
          </div>
        </div>

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
