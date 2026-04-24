"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  saleSchemaCreate,
  saleSchemaUpdate,
  type SaleSchema,
} from "../lib/sale.schema";
import {
  Users2,
  CreditCard,
  ListChecks,
  Users,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { SaleResource } from "../lib/sale.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import { useProduct } from "@/pages/product/lib/product.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import { useClients } from "@/pages/client/lib/client.hook";
import { CLIENT } from "@/pages/client/lib/client.interface";
import { getPersonZones } from "@/pages/client/lib/personzone.actions";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import { formatDecimalTrunc, parseFormattedNumber } from "@/lib/utils";
import { formatNumber } from "@/lib/formatCurrency";
import { DOCUMENT_TYPES_SALES, PAYMENT_TYPES } from "../lib/sale.interface";
import { errorToast, warningToast } from "@/lib/core.function";
import { GroupFormSection } from "@/components/GroupFormSection";
import { ClientManagementModal } from "@/pages/client/components/ClientManagementModal";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { getNextSeries } from "../lib/sale.actions";
import { useDynamicPrice } from "../lib/dynamic-price.hook";
import {
  ExcelGrid,
  type ExcelGridColumn,
  type ProductOption,
} from "@/components/ExcelGrid";
import { FormInput } from "@/components/FormInput";

interface SaleFormProps {
  defaultValues: Partial<SaleSchema>;
  onSubmit: (data: any) => void;
  onVendedorChange?: (vendedorId: string) => void;
  mode?: "create" | "update";
  branches: BranchResource[];
  warehouses: WarehouseResource[];
  sale?: SaleResource;
}

interface CustomerAddress {
  id: number;
  zone_id: number;
  zone_name: string;
  address: string;
  is_primary: boolean;
}

interface DetailRow {
  index: number;
  product_id: string;
  product_code?: string;
  product_name?: string;
  product_weight?: string; // Peso por saco del producto (kg)
  product_price_per_kg?: string; // Precio por kg del producto
  quantity: string; // Cantidad total en decimal (ej: 1.02) - SE ENVÍA AL BACKEND
  quantity_sacks: string; // Cantidad de sacos ingresada por el usuario (ej: 1)
  quantity_kg: string; // Kg sueltos ingresados por el usuario (ej: 25)
  unit_price: string; // Precio unitario (por saco o por kg según el modo)
  subtotal: number;
  igv: number;
  total: number;
  total_kg?: number; // Peso total en kg (ej: 51)
  sale_mode?: "sacks" | "kg"; // Modo de venta: por sacos o por kg
}

interface InstallmentRow {
  installment_number: string;
  due_days: string;
  amount: string;
}

export const SaleForm = ({
  defaultValues,
  onSubmit,
  onVendedorChange,
  mode = "create",
  branches,
  warehouses,
  sale,
}: SaleFormProps) => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WarehouseResource[]
  >([]);

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

  // Estado para las direcciones del cliente seleccionado
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>(
    [],
  );

  // Referencia al zone_id actual para detectar cambio de zona al cambiar cliente
  const currentZoneIdRef = useRef<number | null>(null);

  const [isClientManagementOpen, setIsClientManagementOpen] = useState(false);
  const [externalCustomerOption, setExternalCustomerOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const pendingExternalPersonRef = useRef<PersonResource | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>(
    () => {
      if (mode === "update" && sale?.customer) {
        return (
          sale.customer.business_name ||
          `${sale.customer.names ?? ""} ${sale.customer.father_surname ?? ""} ${sale.customer.mother_surname ?? ""}`.trim()
        );
      }
      return "";
    },
  );

  const [copiedCustomer, setCopiedCustomer] = useState(false);
  const [selectedCustomerDocument, setSelectedCustomerDocument] = useState<
    string | null
  >(() => {
    if (mode === "update" && sale?.customer) {
      return sale.customer.number_document ?? null;
    }
    return null;
  });

  const { fetchDynamicPrice } = useDynamicPrice();
  const queryClient = useQueryClient();

  // Hook para obtener vendedores
  const { data: workers = [] } = useAllWorkers();

  // Estados para serie y número automático
  const [autoSerie, setAutoSerie] = useState<string>(
    mode === "update" && sale ? sale.serie : "",
  );
  const [autoNumero, setAutoNumero] = useState<string>(
    mode === "update" && sale ? sale.numero : "",
  );

  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);

  // Estados para cuotas
  const [installments, setInstallments] = useState<InstallmentRow[]>([]);

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? saleSchemaCreate : saleSchemaUpdate,
    ),
    defaultValues: {
      document_type: "FACTURA", // Por defecto Factura
      currency: "PEN", // Por defecto Soles
      payment_type: "CONTADO", // Por defecto al Contado
      discount_global: "0",
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
            warehouse.branch_id.toString() === defaultValues.branch_id,
        );
        setFilteredWarehouses(filtered);
      }

      // Inicializar detalles
      if (defaultValues.details && defaultValues.details.length > 0) {
        const initialDetails = defaultValues.details.map(
          (detail: any, index: number) => {
            // Determinar el modo de venta basado en los valores recibidos
            const qtySacks = parseFloat(detail.quantity_sacks || "0");
            const qtyKg = parseFloat(detail.quantity_kg || "0");
            const sale_mode: "sacks" | "kg" | undefined =
              qtySacks > 0 ? "sacks" : qtyKg > 0 ? "kg" : undefined;

            const unitPrice = parseFormattedNumber(detail.unit_price);
            const productWeight = parseFloat(detail.product_weight || "0");

            // Calcular totales según el modo de venta
            let subtotal = 0;
            let totalKg = 0;

            if (sale_mode === "sacks") {
              totalKg = roundTo6Decimals(productWeight * qtySacks);
              // En modo sacos, el precio unitario corresponde al saco.
              subtotal = roundTo6Decimals(qtySacks * unitPrice);
            } else if (sale_mode === "kg") {
              totalKg = qtyKg;
              subtotal = roundTo6Decimals(qtyKg * unitPrice);
            }

            // El subtotal es la multiplicación simple (precio ya incluye IGV)
            // El IGV se extrae en el resumen total, no por fila
            const total = subtotal;
            const igv = 0;

            return {
              index: index + 1,
              product_id: detail.product_id,
              product_code: detail.product_code || "",
              product_name: detail.product_name || "",
              product_weight: detail.product_weight || "0",
              product_price_per_kg: detail.product_price_per_kg || "0",
              quantity: detail.quantity,
              quantity_sacks: detail.quantity_sacks || "",
              quantity_kg: detail.quantity_kg || "",
              unit_price: detail.unit_price,
              subtotal,
              igv,
              total,
              total_kg: totalKg,
              sale_mode,
            };
          },
        );
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
          }),
        );
        setInstallments(initialInstallments);
        form.setValue("installments", initialInstallments);
      }

      // Cargar zonas del cliente en modo edición
      if (defaultValues.customer_id) {
        getPersonZones(Number(defaultValues.customer_id)).then((zones) => {
          if (zones && zones.length > 0) {
            const mapped = zones.map((z) => ({
              id: z.id,
              zone_id: z.zone_id,
              zone_name: z.zone.name,
              address: z.address,
              is_primary: z.is_primary,
            }));
            setCustomerAddresses(mapped);
            const primary = mapped.find((pz) => pz.is_primary);
            if (primary) {
              form.setValue("person_zone_id", primary.id.toString());
              currentZoneIdRef.current = primary.zone_id;
            } else {
              form.setValue("person_zone_id", mapped[0].id.toString());
              currentZoneIdRef.current = mapped[0].zone_id;
            }
          }
        });
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
  const selectedCustomerId = form.watch("customer_id");
  const selectedVendedorId = form.watch("vendedor_id");
  const selectedDiscountGlobal = form.watch("discount_global");
  const selectedCustomerPrimaryZone =
    customerAddresses.find((zone) => zone.is_primary)?.zone_name ??
    customerAddresses[0]?.zone_name ??
    "Sin zona";

  const mapCustomerZones = (zones: any[]): CustomerAddress[] => {
    return zones.map((z) => ({
      id: z.id,
      zone_id: z.zone_id,
      zone_name: z.zone_name ?? z.zone?.name ?? "Sin zona",
      address: z.address,
      is_primary: Boolean(z.is_primary),
    }));
  };

  const getCustomerZoneLabel = (customer: PersonResource): string => {
    const primaryZone = customer.person_zones?.find((zone) => zone.is_primary);
    return customer.zone_name ?? primaryZone?.zone_name ?? "Sin zona";
  };

  const getCurrencySymbol = () => "S/.";

  // Efecto para filtrar warehouses cuando cambia branch
  useEffect(() => {
    if (selectedBranchId) {
      const filtered = warehouses.filter(
        (warehouse) => warehouse.branch_id.toString() === selectedBranchId,
      );
      setFilteredWarehouses(filtered);

      // Si el warehouse seleccionado no está en la nueva lista filtrada, limpiar
      const currentWarehouseId = form.getValues("warehouse_id");

      if (currentWarehouseId) {
        const isValid = filtered.some(
          (warehouse) =>
            warehouse.id.toString() === currentWarehouseId.toString(),
        );
        if (!isValid) {
          form.setValue("warehouse_id", "");
        }
      }
    } else {
      setFilteredWarehouses([]);
      // form.setValue("warehouse_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, warehouses]);

  const handleCopyCustomerName = useCallback(() => {
    if (!selectedCustomerName) return;
    navigator.clipboard.writeText(selectedCustomerName).then(() => {
      setCopiedCustomer(true);
      setTimeout(() => setCopiedCustomer(false), 2000);
    });
  }, [selectedCustomerName]);

  // Actualizar direcciones al seleccionar un cliente en el FormSelectAsync
  const handleCustomerChange = async (
    _value: string,
    item?: PersonResource,
  ) => {
    const resolvedItem =
      item ??
      (pendingExternalPersonRef.current?.id.toString() === _value
        ? pendingExternalPersonRef.current
        : undefined);
    pendingExternalPersonRef.current = null;
    if (resolvedItem) {
      setSelectedCustomerName(
        resolvedItem.business_name ||
          `${resolvedItem.names ?? ""} ${resolvedItem.father_surname ?? ""} ${resolvedItem.mother_surname ?? ""}`.trim(),
      );
      setSelectedCustomerDocument(resolvedItem.number_document ?? null);
    }
    const personId = resolvedItem?.id ?? Number(_value);

    let zones: CustomerAddress[] = [];
    if (resolvedItem?.person_zones?.length) {
      zones = mapCustomerZones(resolvedItem.person_zones);
    } else if (personId) {
      try {
        const fetchedZones = await getPersonZones(personId);
        zones = mapCustomerZones(fetchedZones);
      } catch (error) {
        console.error("Error fetching customer zones:", error);
      }
    }

    if (zones.length > 0) {
      setCustomerAddresses(zones);
      const primary = zones.find((pz) => pz.is_primary);
      const selectedZone = primary || zones[0];
      form.setValue("person_zone_id", selectedZone.id.toString());

      // Limpiar vendedor solo si la zona cambia respecto a la anterior
      const newZoneId = selectedZone.zone_id;
      if (
        currentZoneIdRef.current !== null &&
        currentZoneIdRef.current !== newZoneId
      ) {
        form.setValue("vendedor_id", "");
        onVendedorChange?.("");
      }
      currentZoneIdRef.current = newZoneId;
    } else {
      setCustomerAddresses([]);
      form.setValue("person_zone_id", "");
      if (currentZoneIdRef.current !== null) {
        form.setValue("vendedor_id", "");
        onVendedorChange?.("");
      }
      currentZoneIdRef.current = null;
    }
  };

  useEffect(() => {
    if (!onVendedorChange) return;
    onVendedorChange(selectedVendedorId || "");
  }, [selectedVendedorId, onVendedorChange]);

  // Efecto para obtener serie y número automático
  useEffect(() => {
    const fetchNextSeries = async () => {
      if (selectedBranchId && selectedDocumentType && mode === "create") {
        try {
          const response = await getNextSeries(
            Number(selectedBranchId),
            selectedDocumentType,
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

  const buildCashInstallment = (): InstallmentRow => {
    const saleTotal = calculateDetailsTotal();
    return {
      installment_number: "1",
      due_days: "0",
      amount: saleTotal.toString(),
    };
  };

  // Mantener cuota única automática para pagos al contado (create/update)
  useEffect(() => {
    if (selectedPaymentType === "CONTADO") {
      const cashInstallment = buildCashInstallment();
      setInstallments([cashInstallment]);
      form.setValue("installments", [cashInstallment]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentType, details, selectedDiscountGlobal]);

  // Auto-agregar cuota inicial al cambiar a CREDITO
  useEffect(() => {
    if (selectedPaymentType === "CREDITO" && installments.length === 0) {
      const saleTotal = calculateDetailsTotal();
      const newInstallment: InstallmentRow = {
        installment_number: "1",
        due_days: "30",
        amount: saleTotal > 0 ? saleTotal.toString() : "0",
      };
      setInstallments([newInstallment]);
      form.setValue("installments", [newInstallment]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentType]);

  // Auto-actualizar monto de la única cuota cuando cambia el total de detalles
  useEffect(() => {
    if (installments.length === 1) {
      const saleTotal = calculateDetailsTotal();
      const updated: InstallmentRow[] = [
        { ...installments[0], amount: saleTotal.toString() },
      ];
      setInstallments(updated);
      form.setValue("installments", updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, selectedDiscountGlobal]);

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

  // Función de redondeo a 6 decimales
  const roundTo6Decimals = (value: number): number => {
    return Math.round(value * 1000000) / 1000000;
  };

  // Funciones para el ExcelGrid
  const handleAddRow = () => {
    const newDetail: DetailRow = {
      index: details.length + 1,
      product_id: "",
      product_code: "",
      product_name: "",
      product_weight: "0",
      product_price_per_kg: "0",
      quantity: "",
      quantity_sacks: "",
      quantity_kg: "",
      unit_price: "",
      subtotal: 0,
      igv: 0,
      total: 0,
      total_kg: 0,
      sale_mode: undefined,
    };
    setDetails((prev) => {
      const updatedDetails = [...prev, newDetail];
      form.setValue("details", updatedDetails);
      return updatedDetails;
    });
  };

  const handleRemoveRow = (index: number) => {
    const updatedDetails = details
      .filter((_, i) => i !== index)
      .map((detail, i) => ({ ...detail, index: i + 1 }));
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const handleRemoveEmptyDetailRows = useCallback(() => {
    const filtered = details.filter((detail) => !!detail.product_id);
    if (filtered.length === 0 || filtered.length === details.length) return;
    const reindexed = filtered.map((detail, i) => ({
      ...detail,
      index: i + 1,
    }));
    setDetails(reindexed);
    form.setValue("details", reindexed);
  }, [details, form]);

  const handleCellChange = async (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedDetails = [...details];
    const detail = { ...updatedDetails[index] };

    // Determinar el modo de venta cuando se ingresa una cantidad
    if (field === "quantity_sacks") {
      detail.quantity_sacks = value;
      if (value && parseFloat(value) > 0) {
        detail.sale_mode = "sacks";
        detail.quantity_kg = "0"; // Setear en 0 cuando se usa sacos
        detail.unit_price = ""; // Limpiar precio para que se recalcule
      } else if (!value || parseFloat(value) === 0) {
        // Si se borra o se pone 0, resetear modo
        detail.sale_mode = undefined;
        detail.unit_price = "";
      }
    } else if (field === "quantity_kg") {
      detail.quantity_kg = value;
      if (value && parseFloat(value) > 0) {
        detail.sale_mode = "kg";
        detail.quantity_sacks = "0"; // Setear en 0 cuando se usa kg
        detail.unit_price = ""; // Limpiar precio para que se recalcule
      } else if (!value || parseFloat(value) === 0) {
        // Si se borra o se pone 0, resetear modo
        detail.sale_mode = undefined;
        detail.unit_price = "";
      }
    } else {
      (detail as any)[field] = value;
    }

    updatedDetails[index] = detail;

    // Procesar cuando cambian las cantidades
    if (field === "quantity_sacks" || field === "quantity_kg") {
      if (detail.product_id) {
        const qtySacks = parseFloat(detail.quantity_sacks) || 0;
        const qtyKg = parseFloat(detail.quantity_kg) || 0;
        const productWeight = parseFloat(detail.product_weight || "0");
        const pricePerKg = parseFloat(detail.product_price_per_kg || "0");

        // Modo de venta por SACOS
        if (detail.sale_mode === "sacks" && qtySacks > 0) {
          // Calcular peso total en kg
          const totalWeightKg = roundTo6Decimals(productWeight * qtySacks);

          // Actualizar estado inmediatamente
          setDetails(updatedDetails);
          form.setValue("details", updatedDetails);

          // Llamar a la API para obtener precio por sacos
          const customerId = form.watch("customer_id");

          try {
            const result = await fetchDynamicPrice({
              product_id: detail.product_id,
              person_id: customerId || "",
              quantity_sacks: qtySacks,
              quantity_kg: 0,
            });

            if (result) {
              const unitPrice = parseFormattedNumber(result.pricing.unit_price);
              // El subtotal es la multiplicación simple (precio ya incluye IGV)
              const subtotal = parseFormattedNumber(result.pricing.subtotal);
              const total = subtotal;
              const igv = 0;

              const finalDetails = [...updatedDetails];
              finalDetails[index] = {
                ...finalDetails[index],
                quantity: qtySacks.toString(),
                unit_price: unitPrice.toString(),
                subtotal,
                igv,
                total,
                total_kg: totalWeightKg,
              };

              setDetails(finalDetails);
              form.setValue("details", finalDetails);
            } else {
              errorToast(
                "Error al obtener el precio. Por favor, ingrese el precio manualmente.",
              );
            }
          } catch (error: any) {
            console.error("Error fetching dynamic price:", error);
            const errorMessage =
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              "Error al obtener el precio. Por favor, ingrese el precio manualmente.";
            errorToast(errorMessage);
          }
        }
        // Modo de venta por KG
        else if (detail.sale_mode === "kg" && qtyKg > 0) {
          // El subtotal es la multiplicación simple (precio ya incluye IGV)
          const unitPrice = pricePerKg;
          const subtotal = roundTo6Decimals(qtyKg * unitPrice);
          const total = subtotal;
          const igv = 0;

          const finalDetails = [...updatedDetails];
          finalDetails[index] = {
            ...finalDetails[index],
            quantity: qtyKg.toString(),
            unit_price: unitPrice.toString(),
            subtotal,
            igv,
            total,
            total_kg: qtyKg,
          };

          setDetails(finalDetails);
          form.setValue("details", finalDetails);
        } else {
          // Si no hay cantidad válida, limpiar
          setDetails(updatedDetails);
          form.setValue("details", updatedDetails);
        }
      } else {
        // Si no hay producto, solo actualizar el estado
        setDetails(updatedDetails);
        form.setValue("details", updatedDetails);
      }
    } else if (field === "unit_price") {
      // Cuando se edita el precio manualmente, es una multiplicación simple
      // cantidad × precio = subtotal (sin importar si es por sacos o kg)
      const unitPrice = parseFloat(value) || 0;

      if (detail.sale_mode === "sacks") {
        const qtySacks = parseFloat(detail.quantity_sacks) || 0;
        const productWeight = parseFloat(detail.product_weight || "0");
        const totalWeightKg = roundTo6Decimals(productWeight * qtySacks);

        // El subtotal es la multiplicación simple (precio ya incluye IGV)
        const subtotal = roundTo6Decimals(qtySacks * unitPrice);
        const total = subtotal;
        const igv = 0;

        updatedDetails[index] = {
          ...updatedDetails[index],
          quantity: qtySacks.toString(),
          subtotal,
          igv,
          total,
          total_kg: totalWeightKg,
        };
      } else if (detail.sale_mode === "kg") {
        const qtyKg = parseFloat(detail.quantity_kg) || 0;

        // El subtotal es la multiplicación simple (precio ya incluye IGV)
        const subtotal = roundTo6Decimals(qtyKg * unitPrice);
        const total = subtotal;
        const igv = 0;

        updatedDetails[index] = {
          ...updatedDetails[index],
          quantity: qtyKg.toString(),
          subtotal,
          igv,
          total,
          total_kg: qtyKg,
        };
      }

      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    } else {
      // Para otros campos, solo actualizar el estado
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }
  };

  const handleProductSelect = useCallback(
    (index: number, product: ProductOption) => {
      setDetails((prev) => {
        const updatedDetails = [...prev];
        updatedDetails[index] = {
          ...updatedDetails[index],
          product_id: product.id,
          product_code: product.codigo,
          product_name: product.name,
          product_weight: product.weight || "0",
          product_price_per_kg: product.price_per_kg || "0",
          quantity_sacks: "",
          quantity_kg: "",
          unit_price: "",
          subtotal: 0,
          igv: 0,
          total: 0,
          total_kg: 0,
          sale_mode: undefined,
        };
        form.setValue("details", updatedDetails);
        return updatedDetails;
      });
    },
    [form],
  );

  // Configuración de columnas para ExcelGrid de Detalles
  const gridColumns: ExcelGridColumn<DetailRow>[] = [
    {
      id: "index",
      header: "#",
      type: "readonly",
      width: "10px",
      accessor: "index",
    },
    {
      id: "product_code",
      header: "Código",
      type: "product-code",
      width: "100px",
      accessor: "product_code",
    },
    {
      id: "product",
      header: "Descripción",
      type: "product-search",
      width: "400px",
      accessor: "product_name",
    },
    {
      id: "quantity_sacks",
      header: "Cantidad",
      type: "number",
      width: "100px",
      accessor: "quantity_sacks",
      // Siempre habilitado para permitir navegación con Tab
    },
    {
      id: "quantity_kg",
      header: "Cant. Kg",
      type: "number",
      width: "100px",
      accessor: "quantity_kg",
      // Siempre habilitado para permitir navegación con Tab
    },
    {
      id: "unit_price",
      header: "Precio",
      type: "number",
      width: "100px",
      accessor: "unit_price",
      // Siempre editable - el precio de la API/producto es solo referencial
    },
    {
      id: "subtotal",
      header: "Subtotal",
      type: "readonly",
      width: "100px",
      render: (row) => (
        <div className="h-full flex items-center justify-end px-2 py-1 text-sm font-semibold">
          {row.subtotal
            ? `${getCurrencySymbol()} ${formatNumber(row.subtotal)}`
            : "-"}
        </div>
      ),
    },
  ];

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
        price_per_kg: product.price_per_kg || "0",
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

  // Total bruto: suma de subtotales de detalle (precio incluye IGV)
  const calculateDetailsGrossTotal = () => {
    const sum = details.reduce(
      (sum, detail) => sum + (detail.subtotal || 0),
      0,
    );
    return roundTo6Decimals(sum);
  };

  // Total neto: total bruto menos descuento global
  const calculateDetailsTotal = () => {
    const grossTotal = calculateDetailsGrossTotal();
    const discount = parseFloat(String(selectedDiscountGlobal ?? "0")) || 0;
    const safeDiscount = Math.min(Math.max(discount, 0), grossTotal);
    return roundTo6Decimals(grossTotal - safeDiscount);
  };

  // El IGV se extrae del total (IGV incluido en precio)
  const calculateDetailsIGV = () => {
    const total = calculateDetailsTotal();
    return roundTo6Decimals((total / 1.18) * 0.18);
  };

  // El subtotal base es el total menos el IGV
  const calculateDetailsSubtotal = () => {
    const total = calculateDetailsTotal();
    const igv = calculateDetailsIGV();
    return roundTo6Decimals(total - igv);
  };

  const calculateTotalWeight = () => {
    // Calcular el peso total sumando el total_kg de cada detalle
    const totalWeight = details.reduce((sum, detail) => {
      return sum + (detail.total_kg || 0);
    }, 0);
    return roundTo6Decimals(totalWeight);
  };

  // Funciones para cuotas con ExcelGrid
  const handleAddInstallmentRow = () => {
    const saleTotal = calculateDetailsTotal();
    const currentTotal = calculateInstallmentsTotal();
    const remainingAmount = roundTo6Decimals(saleTotal - currentTotal);

    const newInstallment: InstallmentRow = {
      installment_number: (installments.length + 1).toString(),
      due_days: installments.length === 0 ? "0" : "",
      amount: remainingAmount > 0 ? remainingAmount.toString() : "0",
    };

    const updatedInstallments = [...installments, newInstallment];
    setInstallments(updatedInstallments);
    form.setValue("installments", updatedInstallments);
  };

  const handleInstallmentCellChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedInstallments = [...installments];
    updatedInstallments[index] = {
      ...updatedInstallments[index],
      [field]: value,
    };

    setInstallments(updatedInstallments);
    form.setValue("installments", updatedInstallments);
  };

  const handleRemoveInstallment = (index: number) => {
    const updatedInstallments = installments.filter((_, i) => i !== index);

    // Renumerar las cuotas
    const renumberedInstallments = updatedInstallments.map((inst, idx) => ({
      ...inst,
      installment_number: (idx + 1).toString(),
    }));

    setInstallments(renumberedInstallments);
    form.setValue("installments", renumberedInstallments);
  };

  // Función auxiliar para calcular la fecha de vencimiento
  const calculateDueDate = (days: string): string => {
    const issueDate = form.watch("issue_date");
    if (!issueDate || !days) return "-";

    const daysNum = parseInt(days);
    if (isNaN(daysNum)) return "-";

    const date = new Date(issueDate);
    date.setDate(date.getDate() + daysNum);

    // Formatear como dd-MM-yyyy
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Configuración de columnas para ExcelGrid de Cuotas
  const installmentColumns: ExcelGridColumn<InstallmentRow>[] = [
    {
      id: "installment_number",
      header: "N° Cuota",
      type: "readonly",
      width: "100px",
      render: (row) => (
        <div className="h-full flex items-center justify-center px-2 py-1 text-sm font-semibold bg-muted/50 text-muted-foreground">
          Cuota {row.installment_number}
        </div>
      ),
    },
    {
      id: "due_days",
      header: "Días",
      type: "number",
      width: "100px",
      accessor: "due_days",
    },
    {
      id: "amount",
      header: "Monto",
      type: "number",
      width: "150px",
      accessor: "amount",
    },
    {
      id: "due_date",
      header: "Fecha Venc.",
      type: "readonly",
      width: "120px",
      render: (row) => (
        <div className="h-full flex items-center justify-center px-2 py-1 text-sm bg-muted/50 text-muted-foreground">
          {calculateDueDate(row.due_days)}
        </div>
      ),
    },
  ];

  const calculateInstallmentsTotal = () => {
    const sum = installments.reduce(
      (sum, inst) => sum + (parseFloat(inst.amount) || 0),
      0,
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

    // Validar que haya al menos un producto
    if (details.length === 0 || details.every((d) => !d.product_id)) {
      errorToast("Debe agregar al menos un producto a la venta");
      return;
    }

    // Validar que si es a crédito, debe tener cuotas
    if (selectedPaymentType === "CREDITO" && installments.length === 0) {
      errorToast("Para pagos a crédito, debe agregar al menos una cuota");
      return;
    }

    // Validar que clientes sin documento no superen S/. 700
    if (!selectedCustomerDocument) {
      const total = calculateDetailsTotal();
      if (total > 700) {
        warningToast(
          `No se puede registrar una venta mayor a S/. 700.00 para clientes sin número de documento. Total actual: S/. ${formatNumber(total)}`,
        );
        return;
      }
    }

    // Validar que las cuotas coincidan con el total si hay cuotas
    if (installments.length > 0 && !installmentsMatchTotal()) {
      errorToast(
        `El total de cuotas (${currencySymbol} ${formatNumber(
          calculateInstallmentsTotal(),
        )}) debe ser igual al total de la venta (${currencySymbol} ${formatNumber(
          calculateDetailsTotal(),
        )})`,
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
      // Para pagos al contado, crear una cuota automática para hoy con el monto total
      const totalAmount = calculateDetailsTotal();
      validInstallments = [
        {
          installment_number: 1,
          due_days: "0", // 0 días = fecha de hoy
          amount: totalAmount.toString(),
        },
      ];
    } else {
      // Para pagos a crédito, usar las cuotas ingresadas
      validInstallments = installments
        .filter(
          (inst) => inst.installment_number && inst.due_days && inst.amount,
        )
        .map((inst) => ({
          installment_number: parseInt(inst.installment_number),
          due_days: inst.due_days,
          amount: inst.amount,
        }));
    }

    const totalWeight = calculateTotalWeight();

    // Preparar detalles para enviar al backend
    const validDetails = details.map((detail) => ({
      product_id: detail.product_id,
      quantity_sacks: detail.quantity_sacks || "", // Cantidad de sacos (vacío si se vende por kg)
      quantity_kg: detail.quantity_kg || "", // Cantidad de kg (vacío si se vende por sacos)
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
        id="sale-form"
        className="space-y-2 w-full"
      >
        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={Users2}
          cols={{ sm: 1, md: 3, lg: 4 }}
          bordered
          gap="gap-2"
        >
          <FormSelect
            control={form.control}
            name="branch_id"
            label="TIENDA"
            placeholder="Seleccione una tienda"
            options={
              branches?.map((branch) => ({
                value: branch.id.toString(),
                label: branch.name,
                description: branch.address,
              })) || []
            }
            disabled={mode === "update"}
            autoSelectSingle
            uppercase
          />

          <FormSelect
            control={form.control}
            name="document_type"
            label="TIPO DOCUMENTO"
            placeholder="Seleccione tipo"
            options={DOCUMENT_TYPES_SALES.map((dt) => ({
              value: dt.value,
              label: dt.label,
            }))}
            uppercase
          />

          <div className="hidden">
            <FormSelect
              control={form.control}
              name="person_zone_id"
              label="ZONA"
              placeholder="Seleccione dirección"
              options={customerAddresses.map((addr) => ({
                value: addr.id.toString(),
                label: addr.zone_name + (addr.is_primary ? " (Principal)" : ""),
                description: addr.address,
              }))}
              disabled={!selectedCustomerId || customerAddresses.length === 0}
              uppercase
            />
          </div>

          <div className="flex gap-2">
            <FormInput
              name="_serie_display"
              label="SERIE"
              value={autoSerie}
              onChange={(e) => setAutoSerie(e.target.value)}
              className="font-bold"
            />
            <FormInput
              name="_numero_display"
              label="NÚMERO"
              value={autoNumero}
              onChange={(e) => setAutoNumero(e.target.value)}
              className="font-bold"
            />
          </div>

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="FECHA EMISIÓN"
            placeholder="Seleccione fecha"
            dateFormat="dd-MM-yyyy"
            disabledRange={{
              after: new Date(),
            }}
          />

          <FormSelect
            control={form.control}
            name="warehouse_id"
            label="ALMACÉN"
            placeholder="Seleccione un almacén"
            options={filteredWarehouses.map((warehouse) => ({
              value: warehouse.id.toString(),
              label: warehouse.name,
            }))}
            disabled={mode === "update" || !selectedBranchId}
            autoSelectSingle
            uppercase
          />

          <div className="flex gap-2 items-end">
            <div className="truncate! flex-1">
              <FormSelectAsync
                control={form.control}
                name="customer_id"
                label="CLIENTE"
                placeholder="Seleccione un cliente"
                useQueryHook={useClients}
                mapOptionFn={(customer: PersonResource) => ({
                  value: customer.id.toString(),
                  label:
                    customer.business_name ||
                    [
                      customer.names,
                      customer.father_surname,
                      customer.mother_surname,
                    ]
                      .filter(Boolean)
                      .join(" "),
                  description:
                    getCustomerZoneLabel(customer) +
                    (customer.number_document
                      ? ` - ${customer.number_document}`
                      : ""),
                })}
                withValue={false}
                descriptionAsBadge
                onValueChange={handleCustomerChange}
                defaultOption={
                  mode === "update" && sale?.customer
                    ? {
                        value: sale.customer.id.toString(),
                        label:
                          sale.customer.business_name ||
                          `${sale.customer.names ?? ""} ${sale.customer.father_surname ?? ""} ${sale.customer.mother_surname ?? ""}`.trim(),
                        description: selectedCustomerPrimaryZone,
                      }
                    : undefined
                }
                disabled={mode === "update"}
                uppercase
                refetchOnOpen
                externalOption={externalCustomerOption}
              />
            </div>
            {selectedCustomerName && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyCustomerName}
                title="Copiar nombre del cliente"
              >
                {copiedCustomer ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              onClick={() => setIsClientManagementOpen(true)}
              title="Gestión de clientes"
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>

          <FormSelect
            control={form.control}
            name="vendedor_id"
            label="VENDEDOR"
            placeholder="Seleccionar vendedor"
            options={[
              ...(workers?.map((worker) => ({
                value: worker.id.toString(),
                label: `${worker.names} ${worker.father_surname}`,
                description: worker.number_document ?? "-",
              })) || []),
            ]}
            uppercase
          />

          <FormSelect
            control={form.control}
            name="payment_type"
            label="TIPO DE PAGO"
            placeholder="Seleccione tipo"
            options={PAYMENT_TYPES.map((pt) => ({
              value: pt.value,
              label: pt.label,
            }))}
            uppercase
          />
        </GroupFormSection>

        {/* Detalles */}
        <GroupFormSection
          title="Detalles de la Venta"
          icon={ListChecks}
          cols={{ sm: 1 }}
          bordered
        >
          <ExcelGrid
            columns={gridColumns}
            data={details}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onCellChange={handleCellChange}
            onProductSelect={handleProductSelect}
            onProductCodeTab={handleProductCodeTab}
            onRemoveEmptyRows={handleRemoveEmptyDetailRows}
            emptyMessage="Seleccione un almacén y cliente para comenzar."
            disabled={!selectedWarehouseId}
            skipColumnsOnEnter={["product"]}
          />
        </GroupFormSection>

        {/* Resumen */}
        <GroupFormSection
          title="Resumen"
          icon={FileText}
          cols={{ sm: 1, md: 2, lg: 6 }}
          bordered
        >
          {/* Peso Total */}
          <div className="flex gap-2 items-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Peso Total
            </div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatDecimalTrunc(calculateTotalWeight(), 2)} kg
            </div>
          </div>

          {/* Subtotal */}
          <div className="flex gap-2 items-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Subtotal
            </div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {getCurrencySymbol()} {formatNumber(calculateDetailsSubtotal())}
            </div>
          </div>

          {/* IGV */}
          <div className="flex gap-2 items-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              IGV (18%)
            </div>
            <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {getCurrencySymbol()} {formatNumber(calculateDetailsIGV())}
            </div>
          </div>

          <div className="col-span-2">
            <FormInput
              name="discount_global"
              control={form.control}
              label="DESCUENTO GLOBAL"
              placeholder="0"
              type="number"
              min={0}
              step="0.01"
              horizontalField
            />
          </div>

          {/* Total a Pagar */}
          <div className="flex gap-2 items-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Total a Pagar
            </div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {getCurrencySymbol()} {formatNumber(calculateDetailsTotal())}
            </div>
          </div>

          <div className="col-span-full">
            <FormInput
              name="observations"
              control={form.control}
              label="OBSERVACIONES"
              placeholder="Ingrese observaciones adicionales"
              uppercase
            />
          </div>
        </GroupFormSection>

        {/* Cuotas - Solo mostrar si es a crédito */}
        {selectedPaymentType === "CREDITO" && (
          <GroupFormSection
            title="Cuotas de Pago"
            icon={CreditCard}
            cols={{ sm: 1 }}
            bordered
          >
            <ExcelGrid
              columns={installmentColumns}
              data={installments}
              onAddRow={handleAddInstallmentRow}
              onRemoveRow={handleRemoveInstallment}
              onCellChange={handleInstallmentCellChange}
              emptyMessage="Agregue las cuotas de pago."
              disabled={details.length === 0}
              minHeight="0px"
            />

            {installments.length > 0 && (
              <div className="mt-4 space-y-2">
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
              </div>
            )}
          </GroupFormSection>
        )}
      </form>

      {/* Modal de gestión de clientes */}
      <ClientManagementModal
        open={isClientManagementOpen}
        onOpenChange={setIsClientManagementOpen}
        selectedClientId={form.watch("customer_id")}
        selectedClientName={selectedCustomerName}
        onClientChange={() => {
          queryClient.invalidateQueries({ queryKey: [CLIENT.QUERY_KEY] });
        }}
        onSelectClient={(id, name, person) => {
          setSelectedCustomerName(name);
          if (person) pendingExternalPersonRef.current = person;
          setExternalCustomerOption({ value: id.toString(), label: name });
        }}
      />
    </Form>
  );
};
