"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { Loader, Users2, UserPlus, DollarSign } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSwitch } from "@/components/FormSwitch";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { CompanyResource } from "@/pages/company/lib/company.interface";
import { useState, useEffect, useCallback, useRef } from "react";
import { useProduct } from "@/pages/product/lib/product.hook";
import { SupplierDialog } from "@/pages/supplier/components/SupplierDialog";

import { errorToast, warningToast } from "@/lib/core.function";
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
import {
  ExcelGrid,
  type ExcelGridColumn,
  type ProductOption,
} from "@/components/ExcelGrid";
import { formatNumber } from "@/lib/formatCurrency";

interface PurchaseFormProps {
  defaultValues: Partial<PurchaseSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  suppliers: PersonResource[];
  warehouses: WarehouseResource[];
  purchase?: PurchaseResource;
  companies?: CompanyResource[];
  branches: BranchResource[];
  onRefreshSuppliers?: () => void;
  // products prop eliminado: se busca por código vía useProduct (TanStack Query)
}

interface DetailRow {
  product_id: string;
  product_code?: string;
  product_name?: string;
  product_weight?: number; // Peso del producto en kg
  quantity: string; // Cantidad (sacos o kg según el modo)
  quantity_kg: string; // Siempre en kg (para cálculos internos)
  unit_price: string;
  tax: string;
  subtotal: number;
  total: number;
  is_by_sack: boolean; // true = compra por saco, false = compra por kg
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
  branches,
  onRefreshSuppliers,
}: PurchaseFormProps) => {
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
        ? { codigo: productCodeSearch.code, direction: "asc", sort: "codigo" }
        : undefined,
    );

  const productSelected =
    productSearchResult?.data &&
    productSearchResult.data.filter(
      (p) => p.codigo === productCodeSearch?.code,
    )[0];

  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WarehouseResource[]
  >([]);

  // Estado para el diálogo de proveedor
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [includeIgv, setIncludeIgv] = useState<boolean>(
    defaultValues.include_igv ?? false,
  );

  const IGV_RATE = 0.18;

  // Estados para cuotas
  const [installments, setInstallments] = useState<InstallmentRow[]>([]);

  // Estados para serie y número de documento
  const [documentSerie, setDocumentSerie] = useState<string>(() => {
    const dn = defaultValues.document_number || "";
    const idx = dn.indexOf("-");
    return idx >= 0 ? dn.slice(0, idx) : "";
  });
  const [documentNum, setDocumentNum] = useState<string>(() => {
    const dn = defaultValues.document_number || "";
    const idx = dn.indexOf("-");
    return idx >= 0 ? dn.slice(idx + 1) : "";
  });

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? purchaseSchemaCreate : purchaseSchemaUpdate,
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

  // Sincronizar serie + número al campo document_number del formulario
  const isFirstDocumentRender = useRef(true);
  useEffect(() => {
    if (isFirstDocumentRender.current) {
      isFirstDocumentRender.current = false;
      const combined =
        documentSerie || documentNum
          ? `${documentSerie}-${documentNum}`
          : "";
      form.setValue("document_number", combined, { shouldValidate: false });
      return;
    }
    const combined =
      documentSerie || documentNum
        ? `${documentSerie}-${documentNum}`
        : "";
    form.setValue("document_number", combined, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentSerie, documentNum]);

  const selectedBranchId = form.watch("branch_id");

  // Inicializar detalles y cuotas desde defaultValues (para modo edición)
  useEffect(() => {
    if (mode === "update" && defaultValues) {
      if (defaultValues.branch_id) {
        const filtered = warehouses.filter(
          (warehouse) =>
            warehouse.branch_id.toString() === defaultValues.branch_id,
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
        (warehouse) => warehouse.branch_id.toString() === selectedBranchId,
      );
      setFilteredWarehouses(filtered);

      // Si el warehouse seleccionado no está en la nueva lista filtrada, limpiar
      const currentWarehouseId = form.getValues("warehouse_id");
      let warehouseCleared = false;

      if (currentWarehouseId) {
        const isValid = filtered.some(
          (warehouse) => warehouse.id.toString() === currentWarehouseId,
        );
        if (!isValid) {
          form.setValue("warehouse_id", "");
          warehouseCleared = true;
        }
      }

      // Si solo hay un almacén, seleccionarlo automáticamente
      // Esto se ejecuta si: no hay almacén seleccionado, o el almacén fue limpiado
      if (
        filtered.length === 1 &&
        mode === "create" &&
        (!currentWarehouseId || warehouseCleared)
      ) {
        form.setValue("warehouse_id", filtered[0].id.toString());
      }
    } else {
      setFilteredWarehouses([]);
      form.setValue("warehouse_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, warehouses]);

  // Efecto para hacer focus en el primer campo cuando se monta el formulario
  useEffect(() => {
    // Esperar un tick para asegurar que el DOM esté completamente renderizado
    const timer = setTimeout(() => {
      // Buscar el primer botón del formulario (que es el trigger del FormSelect)
      const firstButton = document.querySelector(
        'form button[role="combobox"]',
      ) as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Watch para el tipo de pago y el switch de IGV
  const selectedPaymentType = form.watch("payment_type");
  const watchIncludeIgv = form.watch("include_igv");
  const watchDiscount = form.watch("discount_global");
  const watchFreight = form.watch("freight_cost");
  const watchLoading = form.watch("loading_cost");
  const watchCurrency = form.watch("currency");
  const currencySymbol = watchCurrency === "USD" ? "$ " : "S/. ";

  // Sincronizar el estado local includeIgv con el formulario
  useEffect(() => {
    if (watchIncludeIgv !== undefined && watchIncludeIgv !== includeIgv) {
      setIncludeIgv(watchIncludeIgv);
    }
  }, [watchIncludeIgv, includeIgv]);

  // Cuando cambia a CREDITO y no hay cuotas (create mode), agregar una por defecto
  useEffect(() => {
    if (
      selectedPaymentType === "CREDITO" &&
      installments.length === 0 &&
      mode === "create"
    ) {
      const total = calculatePurchaseTotal();
      const inst: InstallmentRow[] = [
        { due_days: "30", amount: total > 0 ? total.toFixed(2) : "0.00" },
      ];
      setInstallments(inst);
      form.setValue("installments", inst);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentType]);

  // Cuando solo hay 1 cuota, siempre sincronizar su monto con el total de la compra
  useEffect(() => {
    if (installments.length === 1 && selectedPaymentType === "CREDITO") {
      const total = calculatePurchaseTotal();
      if (total >= 0) {
        const updated: InstallmentRow[] = [
          { ...installments[0], amount: total.toFixed(2) },
        ];
        setInstallments(updated);
        form.setValue("installments", updated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, watchDiscount, watchFreight, watchLoading]);

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
      const mappedDetails = (defaultValues.details as any[]).map((detail) => {
        // En modo edición, el backend envía product_code y product_name en el detalle
        const productWeight = 0; // El peso no viene del API; se actualiza al seleccionar producto nuevo
        const quantityKg = parseFloat(detail.quantity_kg) || 0;
        const quantitySacks = parseFloat(detail.quantity_sacks) || 0;
        const unitPrice = parseFloat(detail.unit_price);

        const isBySack = quantitySacks > 0;
        const quantity = isBySack ? quantitySacks : quantityKg;

        let subtotal = 0;
        let tax = 0;
        let total = 0;

        if (quantity > 0 && unitPrice > 0) {
          if (includeIgv) {
            const totalIncl = quantity * unitPrice;
            subtotal = totalIncl / (1 + IGV_RATE);
            tax = totalIncl - subtotal;
            total = totalIncl;
          } else {
            subtotal = quantity * unitPrice;
            tax = subtotal * IGV_RATE;
            total = subtotal + tax;
          }
        }

        return {
          product_id: detail.product_id,
          product_code: detail.product_code || "",
          product_name: detail.product_name || "",
          product_weight: productWeight,
          quantity: quantity > 0 ? quantity.toString() : "",
          quantity_kg: quantityKg > 0 ? quantityKg.toString() : "",
          unit_price: detail.unit_price,
          tax: tax.toFixed(2),
          subtotal,
          total,
          is_by_sack: isBySack,
        };
      });
      setDetails(mappedDetails);
      form.setValue("details", mappedDetails);
    }

    if (defaultValues.installments && defaultValues.installments.length > 0) {
      const mappedInstallments = (defaultValues.installments as any[]).map(
        (inst) => ({
          due_days: String(inst.due_days),
          amount: String(inst.amount),
        }),
      );
      setInstallments(mappedInstallments);
      form.setValue("installments", mappedInstallments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funciones para ExcelGrid
  const handleAddRow = () => {
    const newDetail: DetailRow = {
      product_id: "",
      product_code: "",
      product_name: "",
      product_weight: 0,
      quantity: "",
      quantity_kg: "",
      unit_price: "",
      tax: "",
      subtotal: 0,
      total: 0,
      is_by_sack: true, // Por defecto compra por saco
    };
    setDetails((prev) => {
      const updatedDetails = [...prev, newDetail];
      form.setValue("details", updatedDetails);
      return updatedDetails;
    });
  };

  const handleRemoveRow = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleCellChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };

    const detail = updatedDetails[index];

    // Si cambia la cantidad, calcular los kg según el modo
    if (field === "quantity") {
      const quantity = parseFloat(value) || 0;
      const productWeight = detail.product_weight || 0;

      if (detail.is_by_sack) {
        // Modo SACO: calcular kg = sacos × peso
        const calculatedKg = quantity * productWeight;
        updatedDetails[index].quantity_kg =
          calculatedKg > 0 ? calculatedKg.toFixed(2) : "";
      } else {
        // Modo KG: la cantidad ya está en kg
        updatedDetails[index].quantity_kg = value;
      }
    }

    // Recalcular totales cuando cambian quantity o precio
    if (field === "quantity" || field === "unit_price") {
      const quantity = parseFloat(updatedDetails[index].quantity) || 0;
      const unitPrice = parseFloat(updatedDetails[index].unit_price) || 0;
      let subtotal = 0;
      let tax = 0;
      let total = 0;

      // El precio siempre se multiplica por la cantidad ingresada (sacos o kg según el modo)
      if (quantity > 0 && unitPrice > 0) {
        if (includeIgv) {
          // includeIgv=true: El precio YA incluye IGV, lo descomponemos
          const totalIncl = quantity * unitPrice;
          subtotal = totalIncl / (1 + IGV_RATE);
          tax = totalIncl - subtotal;
          total = totalIncl;
        } else {
          // includeIgv=false: El precio NO incluye IGV, se lo agregamos
          subtotal = quantity * unitPrice;
          tax = subtotal * IGV_RATE;
          total = subtotal + tax;
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

  const handleProductSelect = useCallback(
    (index: number, product: ProductOption) => {
      const productWeight = product.weight ? parseFloat(product.weight) : 0;

      setDetails((prev) => {
        const updatedDetails = [...prev];
        updatedDetails[index] = {
          ...updatedDetails[index],
          product_id: product.id,
          product_code: product.codigo,
          product_name: product.name,
          product_weight: productWeight,
        };
        form.setValue("details", updatedDetails);
        return updatedDetails;
      });
    },
    [form],
  );

  // Búsqueda async de producto por código al presionar Tab
  // Cuando useProduct retorna resultado, auto-seleccionar primer producto y avanzar celda
  useEffect(() => {
    if (!productCodeSearch || isSearchingProduct) return;
    const callbacks = productCodeCallbacksRef.current;
    if (!callbacks) return;

    if (productSelected) {
      const product = productSelected;
      handleProductSelect(productCodeSearch.rowIndex, {
        id: product.id.toString(),
        codigo: product.codigo,
        name: product.name,
        weight: product.weight,
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

  // Nueva función para cambiar el modo de compra (saco/kg)
  const handleTogglePurchaseMode = (index: number, checked: boolean) => {
    const updatedDetails = [...details];
    const isBySack = checked;

    // Cambiar el modo
    updatedDetails[index].is_by_sack = isBySack;

    const quantityKg = parseFloat(updatedDetails[index].quantity_kg) || 0;
    const productWeight = updatedDetails[index].product_weight || 0;

    if (isBySack) {
      // Cambió a modo SACO: calcular sacos desde kg
      if (quantityKg > 0 && productWeight > 0) {
        const calculatedSacks = quantityKg / productWeight;
        updatedDetails[index].quantity = calculatedSacks.toFixed(2);
      } else {
        updatedDetails[index].quantity = "";
      }
    } else {
      // Cambió a modo KG: la cantidad es directamente kg
      updatedDetails[index].quantity =
        quantityKg > 0 ? quantityKg.toFixed(2) : "";
    }

    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const calculateDetailsTotal = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.total || 0), 0);
    return sum;
  };

  // Calcula el total REAL de la compra (detalles - descuento)
  const calculatePurchaseTotal = () => {
    const detailsTotal = calculateDetailsTotal();
    const discount = form.getValues("discount_global") || 0;
    return detailsTotal - discount;
  };

  const calculateSubtotalTotal = () => {
    const sum = details.reduce(
      (sum, detail) => sum + (detail.subtotal || 0),
      0,
    );
    return sum;
  };

  const calculateTaxTotal = () => {
    const sum = details.reduce(
      (sum, detail) =>
        sum + (isNaN(parseFloat(detail.tax)) ? 0 : parseFloat(detail.tax)),
      0,
    );
    return sum;
  };

  // Recalcular detalles cuando cambie el modo de interpretación de precios (incluye IGV o no)
  useEffect(() => {
    if (!details || details.length === 0) return;

    const recalculated = details.map((d) => {
      // Usar la cantidad según el modo (sacos o kg)
      const q = parseFloat(d.quantity || "0");
      const up = parseFloat(d.unit_price || "0");
      let subtotal = 0;
      let tax = 0;
      let total = 0;

      if (includeIgv) {
        // includeIgv=true: El precio YA incluye IGV, lo descomponemos
        const totalIncl = q * up;
        subtotal = totalIncl / (1 + IGV_RATE);
        tax = totalIncl - subtotal;
        total = totalIncl;
      } else {
        // includeIgv=false: El precio NO incluye IGV, se lo agregamos
        subtotal = q * up;
        tax = subtotal * IGV_RATE;
        total = subtotal + tax;
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
      id: "purchase_mode",
      header: "Modo",
      type: "switch",
      width: "120px",
      accessor: "is_by_sack",
      onSwitchChange: handleTogglePurchaseMode,
      getLabel: (row) => (row.is_by_sack ? "SACO" : "KG"),
    },
    {
      id: "quantity",
      header: "Cantidad",
      type: "number",
      width: "120px",
      accessor: "quantity",
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

  // Sin lista estática de productos: la búsqueda es async por código (handleProductCodeTab)
  const productOptions: ProductOption[] = [];

  // Funciones para cuotas (ExcelGrid)
  const handleInstallmentCellChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
    form.setValue("installments", updated);
  };

  const handleAddInstallmentRow = () => {
    const updated = [...installments, { due_days: "30", amount: "" }];
    setInstallments(updated);
    form.setValue("installments", updated);
  };

  const handleRemoveInstallment = (index: number) => {
    const updated = installments.filter((_, i) => i !== index);
    setInstallments(updated);
    form.setValue("installments", updated);
  };

  const calculateInstallmentsTotal = () => {
    const sum = installments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0,
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
        `El total de cuotas (${calculateInstallmentsTotal()}) debe ser igual al total de la compra (${calculatePurchaseTotal()})`,
      );
      return;
    }

    // Preparar cuotas según el tipo de pago
    let validInstallments: { due_days: string; amount: number }[] | undefined;

    if (selectedPaymentType === "CONTADO") {
      // Cuando es al contado, enviar una sola cuota con el monto total
      const purchaseTotal = calculatePurchaseTotal();
      validInstallments = [
        {
          due_days: "1",
          amount: purchaseTotal,
        },
      ];
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
      quantity_kg: d.is_by_sack ? 0 : parseFloat(d.quantity_kg),
      quantity_sacks: d.is_by_sack
        ? d.quantity === ""
          ? 0
          : parseFloat(d.quantity)
        : 0,
      unit_price: parseFloat(d.unit_price),
      tax: parseFloat(d.tax),
    }));

    const submitData: any = {
      ...data,
      details: formattedDetails,
      installments: validInstallments, // Siempre enviar installments (sea contado o crédito)
    };

    onSubmit(submitData);
  };

  const selectedWarehouseId = form.watch("warehouse_id");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit, (errors) => {
          const getFirstError = (
            obj: any,
            path = "",
          ): { field: string; message: string } | null => {
            for (const key in obj) {
              const val = obj[key];
              const currentPath = path ? `${path}.${key}` : key;
              if (val?.message)
                return { field: currentPath, message: val.message };
              if (typeof val === "object") {
                const nested = getFirstError(val, currentPath);
                if (nested) return nested;
              }
            }
            return null;
          };
          const first = getFirstError(errors);
          warningToast(
            first ? `Campo: ${first.field}` : "Formulario inválido",
            first ? first.message : "Hay campos inválidos en el formulario",
          );
        })}
        className="space-y-6 w-full"
      >
        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={Users2}
          gap="gap-2"
          cols={{ sm: 1, md: 2, lg: 4, xl: 5 }}
        >
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

          <div className="flex flex-col gap-0.5">
            <label className="flex justify-start items-center text-xs md:text-sm mb-0.5 leading-none h-fit font-bold uppercase text-muted-foreground">
              Número de Documento
              <span className="text-destructive ml-0.5">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              <FormInput
                name="document_serie"
                value={documentSerie}
                onChange={(e) =>
                  setDocumentSerie(e.target.value.toUpperCase())
                }
                placeholder="Serie"
                uppercase
                maxLength={4}
                className="w-20"
              />
              <span className="text-muted-foreground font-medium">-</span>
              <FormInput
                name="document_num"
                value={documentNum}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setDocumentNum(val);
                }}
                onBlur={() => {
                  if (documentNum) {
                    setDocumentNum(documentNum.padStart(8, "0"));
                  }
                }}
                placeholder="00000000"
                maxLength={8}
                className="flex-1"
              />
            </div>
            {form.formState.errors.document_number && (
              <p className="text-xs font-medium text-destructive mt-1">
                {form.formState.errors.document_number.message as string}
              </p>
            )}
          </div>

          <FormInput
            control={form.control}
            name="reference_number"
            label="Número de Referencia"
            placeholder="Número de referencia (opcional)"
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
            onProductCodeTab={handleProductCodeTab}
            emptyMessage="Agregue productos a la compra"
            disabled={!selectedWarehouseId}
          />
        </GroupFormSection>

        {/* Cuotas + Totales + Resumen — grid 3 cols: izq 2 col (cuotas+inputs), der 1 col (resumen) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
          {/* Columna izquierda (2 cols) */}
          <div className="xl:col-span-2 space-y-4">
            {selectedPaymentType === "CREDITO" && (
              <GroupFormSection
                title="Cuotas de Pago"
                icon={Users2}
                cols={{ sm: 1 }}
              >
                <ExcelGrid
                  columns={[
                    {
                      id: "due_days",
                      header: "Días",
                      type: "number",
                      accessor: "due_days",
                      width: "140px",
                    },
                    {
                      id: "amount",
                      header: "Monto",
                      type: installments.length === 1 ? "readonly" : "number",
                      accessor: "amount",
                      width: "180px",
                      render:
                        installments.length === 1
                          ? (row) => (
                              <div className="h-full flex items-center justify-end px-2 py-1 text-sm font-semibold text-muted-foreground">
                                {currencySymbol}
                                {formatNumber(parseFloat(row.amount) || 0)}
                              </div>
                            )
                          : undefined,
                    },
                  ]}
                  data={installments}
                  onAddRow={handleAddInstallmentRow}
                  onRemoveRow={handleRemoveInstallment}
                  onCellChange={handleInstallmentCellChange}
                  emptyMessage="No hay cuotas"
                />
                {installments.length > 1 && (
                  <>
                    <div className="flex justify-between items-center px-2 py-1 font-bold text-sm">
                      <span>TOTAL CUOTAS:</span>
                      <span className="text-blue-600 text-base">
                        {currencySymbol}
                        {formatNumber(calculateInstallmentsTotal())}
                      </span>
                    </div>
                    {!installmentsMatchTotal() && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                          ⚠️ El total de cuotas (
                          {formatNumber(calculateInstallmentsTotal())}) debe ser
                          igual al total de la compra (
                          {formatNumber(calculatePurchaseTotal())}).
                        </p>
                      </div>
                    )}
                  </>
                )}
              </GroupFormSection>
            )}

            {/* Totales y Observaciones */}
            <GroupFormSection
              title="Totales y Observaciones"
              icon={Users2}
              gap="gap-2"
              cols={{ sm: 1, md: 2, lg: 3 }}
            >
              <FormSwitch
                control={form.control}
                name="include_cost_account"
                label="Incluir Cuenta de Costos"
                text="Incluir en la contabilidad"
                autoHeight
              />

              <FormSwitch
                control={form.control}
                name="include_igv"
                label="Precios incluyen IGV (18%)"
                text="Actívalo si los precios ingresados ya incluyen IGV"
                autoHeight
              />

              <FormInput
                control={form.control}
                name="discount_global"
                label="Descuento Global"
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
              />

              <FormInput
                control={form.control}
                name="freight_cost"
                label="Costo de Flete"
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
              />

              <FormInput
                control={form.control}
                name="loading_cost"
                label="Costo de Estiba"
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
              />

              <FormInput
                control={form.control}
                name="observations"
                label="Observaciones"
                placeholder="Observaciones adicionales (opcional)"
              />
            </GroupFormSection>
          </div>

          {/* Columna derecha — Resumen Financiero (siempre visible) */}
          <div className="xl:col-span-1">
            <GroupFormSection
              title="Resumen Financiero"
              icon={DollarSign}
              cols={{ sm: 1 }}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-semibold">
                    {currencySymbol}
                    {formatNumber(calculateSubtotalTotal())}
                  </span>
                </div>

                {Number(watchDiscount) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Descuento Global
                    </span>
                    <span className="font-semibold text-destructive">
                      -{currencySymbol}
                      {formatNumber(Number(watchDiscount))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    IGV (18%){watchIncludeIgv ? " incl." : ""}
                  </span>
                  <span className="font-semibold text-orange-600">
                    {currencySymbol}
                    {formatNumber(calculateTaxTotal())}
                  </span>
                </div>

                {Number(watchFreight) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Flete
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {currencySymbol}
                      {formatNumber(Number(watchFreight))}
                    </span>
                  </div>
                )}

                {Number(watchLoading) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Estiba
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {currencySymbol}
                      {formatNumber(Number(watchLoading))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-base font-bold">TOTAL</span>
                  <span className="text-xl font-bold text-primary">
                    {currencySymbol}
                    {formatNumber(calculatePurchaseTotal())}
                  </span>
                </div>

                {selectedPaymentType === "CREDITO" &&
                  installments.length > 0 && (
                    <div className="pt-3 border-t space-y-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Cuotas ({installments.length})
                      </p>
                      {installments.map((inst, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-muted-foreground">
                            Cuota {i + 1} · {inst.due_days}d
                          </span>
                          <span className="font-semibold">
                            {currencySymbol}
                            {formatNumber(parseFloat(inst.amount) || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </GroupFormSection>
          </div>
        </div>

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
