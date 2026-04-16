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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader,
  Truck,
  Search,
  Plus,
  Settings2,
  Eye,
  EyeOff,
  Package,
  ShoppingCart,
  Save,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { DRIVER } from "@/pages/driver/lib/driver.interface";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import { SearchableSelect } from "@/components/SearchableSelect";
import { FormInput } from "@/components/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import { guideSchema, type GuideSchema } from "../lib/guide.schema";
import type { UbigeoResource } from "../lib/ubigeo.interface";
import { searchRUC, isValidData } from "@/lib/document-search.service";
import {
  MODALITIES,
  UNIT_MEASUREMENTS,
  type GuideResource,
  type GuideMotiveResource,
} from "../lib/guide.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import type { VehicleResource } from "@/pages/vehicle/lib/vehicle.interface";
import { useVehiclesSearch } from "@/pages/vehicle/lib/vehicle.hook";
import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { getSalesByRange } from "@/pages/sale/lib/sale.actions";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import { useDrivers } from "@/pages/driver/lib/driver.hook";
import { useAllCarriers } from "@/pages/carrier/lib/carrier.hook";
import { errorToast, successToast, warningToast } from "@/lib/core.function";
import { promiseToast } from "@/lib/core.function";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useUbigeosFrom } from "../lib/ubigeo.hook";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProduct } from "@/pages/product/lib/product.hook";
import { useProductStore } from "@/pages/product/lib/product.store";
import { getProduct } from "@/pages/product/lib/product.actions";
import {
  ExcelGrid,
  type ExcelGridColumn,
  type ProductOption,
} from "@/components/ExcelGrid";
import { useClients } from "@/pages/client/lib/client.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { FormTextArea } from "@/components/FormTextArea";
import { Alert } from "@/components/ui/alert";
import { usePersonZones } from "@/pages/client/lib/personzone.hook";
import type { PersonZoneResource } from "@/pages/client/lib/personzone.interface";
import ClientAddressesSheet from "@/pages/client/components/ClientAddressesSheet";
import { getUbigeos } from "../lib/ubigeo.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import { SUPPLIER_ROLE_CODE } from "@/pages/supplier/lib/supplier.interface";

interface GuideFormProps {
  defaultValues: Partial<GuideSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  branches: BranchResource[];
  warehouses: WarehouseResource[];
  motives: GuideMotiveResource[];

  guide?: GuideResource;
}

export const GuideForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  branches,
  warehouses,
  motives,
}: GuideFormProps) => {
  const { user } = useAuthStore();
  const { createProduct } = useProductStore();
  const { data: companies } = useAllCompanies();
  const { data: units } = useAllUnits();
  const { data: productTypes } = useAllProductTypes();
  const { data: suppliers } = useAllPersons({
    role_names: [SUPPLIER_ROLE_CODE],
  });

  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WarehouseResource[]
  >([]);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Estados para búsqueda de ventas por rango
  const [salesByRange, setSalesByRange] = useState<SaleResource[]>([]);
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const [expandedSales, setExpandedSales] = useState<number[]>([]);
  const [isSearchingSales, setIsSearchingSales] = useState(false);
  const [searchParams, setSearchParams] = useState({
    document_type: "BOLETA",
    serie: "",
    numero_inicio: "",
    numero_fin: "",
  });

  // Cargar transportistas
  const { data: carriers, refetch: refetchCarriers } = useAllCarriers();

  useEffect(() => {
    refetchCarriers();
  }, []);

  // Estado para modo de detalle: false = por ventas, true = por productos
  const [useCustomDetails, setUseCustomDetails] = useState(false);

  // Detalle de productos (modo "por productos")
  const [customDetails, setCustomDetails] = useState<
    {
      product_id: string;
      product_code: string;
      product_name: string;
      description: string;
      quantity_sacks: string;
      quantity_kg: string;
      unit_code: string;
    }[]
  >([
    {
      product_id: "",
      product_code: "",
      product_name: "",
      description: "",
      quantity_sacks: "",
      quantity_kg: "",
      unit_code: "KGM",
    },
  ]);

  // Búsqueda async de producto por código (al dar Tab en la grilla)
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

  // Estado para búsqueda de transportista
  const [isSearchingCarrier, setIsSearchingCarrier] = useState(false);

  const form = useForm({
    resolver: zodResolver(guideSchema) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const selectedBranchId = form.watch("branch_id");
  const modalityValue = form.watch("modality");

  // Setear automáticamente la primera tienda si solo hay una
  useEffect(() => {
    if (branches.length === 1 && !selectedBranchId) {
      form.setValue("branch_id", branches[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  // Filtrar warehouses por branch
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
          (warehouse) => warehouse.id.toString() === currentWarehouseId,
        );
        if (!isValid) {
          form.setValue("warehouse_id", "");
        }
      }

      // Si solo hay un almacén, seleccionarlo automáticamente y pre-rellenar dirección origen
      if (filtered.length === 1) {
        form.setValue("warehouse_id", filtered[0].id.toString());
        if (filtered[0].address) {
          form.setValue("origin_address", filtered[0].address);
        }
      }
    } else {
      setFilteredWarehouses([]);
      form.setValue("warehouse_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, warehouses]);

  // Función para buscar transportista por RUC
  const handleSearchCarrierDocument = async () => {
    const documentNumber = form.getValues("carrier_document_number");

    if (!documentNumber || documentNumber.length !== 11) {
      return;
    }

    setIsSearchingCarrier(true);

    try {
      // Primero buscar en la lista de transportistas existentes
      const existingCarrier = carriers?.find(
        (c) => c.number_document === documentNumber,
      );

      if (existingCarrier) {
        form.setValue(
          "carrier_name",
          existingCarrier.business_name ||
            `${existingCarrier.names} ${existingCarrier.father_surname}`.trim(),
        );
        successToast("Transportista encontrado en el sistema");
        return;
      }

      // Si no existe, buscar en SUNAT
      const result = await searchRUC({ search: documentNumber });
      if (result && isValidData(result.message) && result.data) {
        form.setValue("carrier_name", result.data.business_name || "");
        successToast("Datos obtenidos de SUNAT");
      } else {
        warningToast("No se encontró información del RUC");
      }
    } catch (error) {
      console.error("Error searching carrier document:", error);
      errorToast("Error al buscar el documento");
    } finally {
      setIsSearchingCarrier(false);
    }
  };

  // Comportamiento al cambiar modalidad
  useEffect(() => {
    if (modalityValue === "PUBLICO") {
      const currentRuc = form.getValues("carrier_document_number");
      if (!currentRuc || currentRuc.length !== 11) {
        form.setValue("carrier_document_number", "20480386460");
        setTimeout(() => handleSearchCarrierDocument(), 100);
      }
    } else if (modalityValue === "PRIVADO") {
      form.setValue("carrier_document_number", "");
      form.setValue("carrier_name", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalityValue]);

  // Función para buscar ventas por rango
  const handleSearchSalesByRange = async () => {
    if (
      !searchParams.serie ||
      !searchParams.numero_inicio ||
      !searchParams.numero_fin
    ) {
      errorToast("Complete todos los campos de búsqueda");
      return;
    }

    setIsSearchingSales(true);
    try {
      const response = await getSalesByRange(searchParams);

      if (response.data.length === 0) {
        warningToast("No se encontraron ventas en el rango especificado");
        setSalesByRange([]);
        return;
      }

      setSalesByRange(response.data);
      setSelectedSales(response.data.map((sale) => sale.id));

      successToast(
        `Se encontraron ${response.data.length} ventas`,
        response?.meta?.numeros_encontrados &&
          response?.meta?.numeros_encontrados?.length > 0
          ? `Números encontrados: ${response.meta.numeros_encontrados.join(
              ", ",
            )}`
          : undefined,
      );

      // if (response.meta.tiene_faltantes) {
      //   warningToast(
      //     `Hay números faltantes en el rango: ${response.meta.numeros_faltantes?.join(
      //       ", "
      //     )}`
      //   );
      // }
    } catch (error) {
      console.error("Error searching sales by range:", error);
      errorToast("Error al buscar ventas");
      setSalesByRange([]);
    } finally {
      setIsSearchingSales(false);
    }
  };

  // Función para seleccionar/deseleccionar venta
  const handleToggleSale = (saleId: number) => {
    setSelectedSales((prev) => {
      if (prev.includes(saleId)) {
        return prev.filter((id) => id !== saleId);
      }

      const saleToAdd = salesByRange.find((sale) => sale.id === saleId);
      if (!saleToAdd) return prev;

      return [...prev, saleId];
    });
  };

  // Función para seleccionar todas las ventas
  const handleSelectAllSales = () => {
    if (selectedSales.length === salesByRange.length) {
      setSelectedSales([]);
    } else {
      if (salesByRange.length === 0) {
        setSelectedSales([]);
        return;
      }

      setSelectedSales(salesByRange.map((sale) => sale.id));
    }
  };

  // Establecer fechas, motivo y tipo de documento transportista por defecto
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    form.setValue("issue_date", formattedDate);
    form.setValue("transfer_date", formattedDate);
    form.setValue("motive_id", "3");
    // En modo por ventas (default), el cliente siempre es "Clientes Varios" (id=30)
    form.setValue("customer_id", "30");
    if (form.getValues("modality") !== "PRIVADO") {
      form.setValue("carrier_document_type", "RUC");
    }
  }, [form]);

  // Helpers para manejar filas de productos personalizados
  const handleAddDetail = () => {
    setCustomDetails((prev) => [
      ...prev,
      {
        product_id: "",
        product_code: "",
        product_name: "",
        description: "",
        quantity_sacks: "",
        quantity_kg: "",
        unit_code: "KGM",
      },
    ]);
  };

  const handleRemoveDetail = (index: number) => {
    setCustomDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, field: string, value: string) => {
    setCustomDetails((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleProductSelect = useCallback(
    (index: number, product: ProductOption) => {
      setCustomDetails((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          product_id: product.id,
          product_code: product.codigo,
          product_name: product.name,
          description: product.name,
        };
        return updated;
      });
    },
    [],
  );

  const createMissingProductForRow = useCallback(
    async (rowIndex: number, code: string) => {
      const row = customDetails[rowIndex];
      const normalizedCode = code.trim();
      const normalizedUnitCode = row?.unit_code?.trim().toUpperCase();

      if (!row || !normalizedCode) {
        throw new Error("No se pudo determinar el producto a crear");
      }

      const companyId = user?.company_id ?? companies?.[0]?.id;
      const productTypeId = productTypes?.[0]?.id;
      const supplierId = suppliers?.[0]?.id;
      const matchedUnit =
        units?.find(
          (unit) => unit.code.trim().toUpperCase() === normalizedUnitCode,
        ) ?? units?.[0];

      if (!companyId || !productTypeId || !supplierId || !matchedUnit?.id) {
        throw new Error(
          "Faltan catálogos base para crear el producto automáticamente",
        );
      }

      const productName =
        row.product_name?.trim() || row.description?.trim() || normalizedCode;

      const creationPromise = (async () => {
        await createProduct({
          codigo: normalizedCode,
          name: productName,
          company_id: companyId.toString(),
          product_type_id: productTypeId.toString(),
          unit_id: matchedUnit.id.toString(),
          is_taxed: false,
          supplier_id: supplierId.toString(),
          weight: "0",
          is_kg: normalizedUnitCode === "KGM",
          price_per_kg: "0",
          price: "0",
        });

        const response = await getProduct({
          params: {
            codigo: normalizedCode,
            direction: "asc",
            sort: "codigo",
          },
        });

        const exactProduct = response.data.find(
          (product) => product.codigo.trim().toUpperCase() === normalizedCode,
        );

        if (!exactProduct) {
          throw new Error("No se pudo recuperar el producto recién creado");
        }

        return exactProduct;
      })();

      promiseToast(creationPromise, {
        loading: `Creando producto ${normalizedCode}...`,
        success: "Producto creado automáticamente",
        error: (error) =>
          error instanceof Error
            ? error.message
            : "No se pudo crear el producto automáticamente",
      });

      return creationPromise;
    },
    [
      companies,
      createProduct,
      customDetails,
      productTypes,
      suppliers,
      units,
      user?.company_id,
    ],
  );

  const buildAutoProductCode = useCallback(
    (name: string, rowIndex: number) => {
      const base = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "")
        .slice(0, 16);

      const suffix = `${Date.now()}`.slice(-6);
      return `AUTO${base || "PROD"}${rowIndex + 1}${suffix}`.slice(0, 50);
    },
    [],
  );

  const resolveDetailProduct = useCallback(
    async (
      row: (typeof customDetails)[0],
      rowIndex: number,
      cache: Map<string, string>,
    ) => {
      if (row.product_id) {
        return row.product_id;
      }

      const productName = row.description?.trim() || row.product_name?.trim();
      if (!productName) {
        throw new Error(
          `La fila ${rowIndex + 1} no tiene producto ni descripción para crear automáticamente`,
        );
      }

      const normalizedCode =
        row.product_code?.trim() || buildAutoProductCode(productName, rowIndex);
      const cacheKey = normalizedCode.toUpperCase();

      const cachedProductId = cache.get(cacheKey);
      if (cachedProductId) {
        return cachedProductId;
      }

      const existingResponse = await getProduct({
        params: {
          codigo: normalizedCode,
          direction: "asc",
          sort: "codigo",
        },
      });

      const existingProduct = existingResponse.data.find(
        (product) => product.codigo.trim().toUpperCase() === cacheKey,
      );

      if (existingProduct) {
        const existingId = existingProduct.id.toString();
        cache.set(cacheKey, existingId);
        return existingId;
      }

      const createdProduct = await createMissingProductForRow(
        rowIndex,
        normalizedCode,
      );

      const createdId = createdProduct.id.toString();
      cache.set(cacheKey, createdId);
      return createdId;
    },
    [buildAutoProductCode, createMissingProductForRow],
  );

  const findProductByCode = useCallback(
    async (rowIndex: number, code: string) => {
      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode) return null;

      const response = await getProduct({
        params: {
          codigo: normalizedCode,
          direction: "asc",
          sort: "codigo",
        },
      });

      const found = response.data.find(
        (product) => product.codigo.trim().toUpperCase() === normalizedCode,
      );

      if (!found) return null;

      handleProductSelect(rowIndex, {
        id: found.id.toString(),
        codigo: found.codigo,
        name: found.name,
        weight: found.weight,
      });

      return found;
    },
    [handleProductSelect],
  );

  // Cuando useProduct retorna resultado, auto-seleccionar primer producto y avanzar celda
  useEffect(() => {
    if (!productCodeSearch || isSearchingProduct) return;
    const callbacks = productCodeCallbacksRef.current;
    if (!callbacks) return;

    if (productSearchResult?.data && productSearchResult.data.length > 0) {
      const p = productSearchResult.data[0];
      handleProductSelect(productCodeSearch.rowIndex, {
        id: p.id.toString(),
        codigo: p.codigo,
        name: p.name,
        weight: p.weight,
      });
      callbacks.advance();
      productCodeCallbacksRef.current = null;
      setProductCodeSearch(null);
    } else if (productSearchResult !== undefined) {
      void (async () => {
        try {
          const createdProduct = await createMissingProductForRow(
            productCodeSearch.rowIndex,
            productCodeSearch.code,
          );

          handleProductSelect(productCodeSearch.rowIndex, {
            id: createdProduct.id.toString(),
            codigo: createdProduct.codigo,
            name: createdProduct.name,
            weight: createdProduct.weight,
          });
          callbacks.advance();
        } catch (error) {
          callbacks.setError(
            error instanceof Error
              ? error.message
              : "No se pudo crear el producto automáticamente",
          );
          errorToast(
            error instanceof Error
              ? error.message
              : "No se pudo crear el producto automáticamente",
          );
        } finally {
          productCodeCallbacksRef.current = null;
          setProductCodeSearch(null);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createMissingProductForRow,
    handleProductSelect,
    isSearchingProduct,
    productCodeSearch,
    productSearchResult,
  ]);

  const handleProductGridTab = useCallback(
    (
      rowIndex: number,
      value: string,
      advance: () => void,
      setError: (msg: string) => void,
      columnId?: string,
    ) => {
      const row = customDetails[rowIndex];
      if (!row) {
        setError("No se pudo obtener la fila del detalle");
        return;
      }

      if (columnId === "product_code") {
        const code = value.trim();

        if (!code) {
          advance();
          return;
        }

        setCustomDetails((prev) =>
          prev.map((item, index) =>
            index === rowIndex ? { ...item, product_code: code } : item,
          ),
        );

        void (async () => {
          try {
            await findProductByCode(rowIndex, code);
            advance();
          } catch {
            setError("No se pudo buscar el producto por código");
          }
        })();

        return;
      }

      if (row.product_id) {
        advance();
        return;
      }

      const trimmedDescription = value.trim();
      if (!trimmedDescription) {
        setError("Ingrese la descripción del producto");
        return;
      }

      const resolvedCode =
        row.product_code.trim() ||
        buildAutoProductCode(trimmedDescription, rowIndex);

      setCustomDetails((prev) =>
        prev.map((item, index) =>
          index === rowIndex
            ? {
                ...item,
                product_code: item.product_code || resolvedCode,
                description: trimmedDescription,
                product_name: item.product_name || trimmedDescription,
              }
            : item,
        ),
      );

      productCodeCallbacksRef.current = { advance, setError };
      setProductCodeSearch({ rowIndex, code: resolvedCode });
    },
    [buildAutoProductCode, customDetails, findProductByCode],
  );

  // Auto-calcular totales cuando cambian los productos personalizados
  useEffect(() => {
    if (!useCustomDetails) return;
    const totalPackages = customDetails.filter(
      (d) => d.product_id || d.description || d.quantity_sacks || d.quantity_kg,
    ).length;
    form.setValue("total_packages", totalPackages as any);
  }, [customDetails, useCustomDetails, form]);

  // Calcular total de bultos automáticamente cuando cambian las ventas seleccionadas
  useEffect(() => {
    if (useCustomDetails) return;
    if (selectedSales.length > 0 && salesByRange.length > 0) {
      const selectedSalesData = salesByRange.filter((sale) =>
        selectedSales.includes(sale.id),
      );

      // Calcular total de bultos (suma de quantity_sacks de todos los detalles)
      const totalPackages = selectedSalesData.reduce((sum, sale) => {
        const sacks = sale.details?.reduce(
          (detailSum, detail) => detailSum + (detail.quantity_sacks || 0),
          0,
        );
        return sum + (sacks || 0);
      }, 0);

      form.setValue("total_packages", totalPackages as any);
    } else if (selectedSales.length === 0) {
      form.setValue("total_packages", 0 as any);
    }
  }, [selectedSales, salesByRange, form]);

  // En modo por ventas, el cliente es siempre "Clientes Varios" (id=30).
  // No se sincroniza desde las ventas seleccionadas.
  useEffect(() => {
    if (!useCustomDetails) return;
    // En modo por productos, limpiar si no hay cliente seleccionado
  }, [useCustomDetails]);

  const handleFormSubmit = async (data: any) => {
    if (!useCustomDetails && selectedSales.length === 0) {
      errorToast("Debe seleccionar al menos una venta");
      return;
    }

    if (!selectedPersonZoneId) {
      errorToast(
        "Debe seleccionar una dirección del cliente para completar el destino",
      );
      return;
    }

    if (useCustomDetails) {
      const validDetails = customDetails.filter(
        (d) =>
          d.product_id || d.description || d.quantity_sacks || d.quantity_kg,
      );
      if (validDetails.length === 0) {
        errorToast("Debe agregar al menos un producto");
        return;
      }
    }

    // En modo por ventas el cliente siempre es "Clientes Varios" (id=30)
    const customerId = !useCustomDetails ? 30 : parseInt(data.customer_id);

    if (useCustomDetails && Number.isNaN(customerId)) {
      errorToast("No se pudo determinar el cliente de la guía");
      return;
    }

    const saleDocumentNumber =
      typeof data.sale_document_number === "string"
        ? data.sale_document_number.trim()
        : "";

    const base = {
      use_custom_details: useCustomDetails,
      branch_id: parseInt(data.branch_id),
      warehouse_id: parseInt(data.warehouse_id),
      customer_id: customerId,
      issue_date: data.issue_date,
      transfer_date: data.transfer_date,
      modality: data.modality,
      motive_id: parseInt(data.motive_id),
      sale_document_number:
        useCustomDetails && saleDocumentNumber && saleDocumentNumber !== "-"
          ? saleDocumentNumber
          : null,
      carrier_document_type: data.carrier_document_type || null,
      carrier_document_number: data.carrier_document_number || null,
      carrier_name: data.carrier_name || null,
      carrier_ruc: data.carrier_document_number || null,
      carrier_mtc_number: data.carrier_mtc_number || null,
      vehicle_id: data.vehicle_id ? parseInt(data.vehicle_id) : null,
      vehicle_plate: null,
      driver_document_type: data.driver_document_type || null,
      driver_document_number: data.driver_document_number || null,
      driver_name: data.driver_name || null,
      driver_license: data.driver_license || null,
      origin_address: data.origin_address,
      ubigeo_origin_id: parseInt(data.ubigeo_origin_id),
      destination_address: data.destination_address,
      ubigeo_destination_id: parseInt(data.ubigeo_destination_id),
      unit_measurement: data.unit_measurement,
      total_packages: data.total_packages,
      observations: data.observations || null,
    };

    let payload: any;

    if (useCustomDetails) {
      const detailsToProcess = customDetails.filter(
        (d) =>
          d.product_id || d.description || d.quantity_sacks || d.quantity_kg,
      );

      const resolvePromise = (async () => {
        const createdProductsCache = new Map<string, string>();

        const resolved = await Promise.all(
          detailsToProcess.map(async (detail, index) => {
            const resolvedProductId = await resolveDetailProduct(
              detail,
              index,
              createdProductsCache,
            );

            return {
              product_id: parseInt(resolvedProductId),
              description:
                detail.description || detail.product_name || null,
              quantity_sacks: parseFloat(detail.quantity_sacks) || 0,
              quantity_kg: parseFloat(detail.quantity_kg) || 0,
              unit_code: detail.unit_code,
            };
          }),
        );

        return resolved;
      })();

      promiseToast(resolvePromise, {
        loading: "Resolviendo productos del detalle...",
        success: "Productos listos para registrar la guía",
        error: (error) =>
          error instanceof Error
            ? error.message
            : "No se pudieron resolver los productos del detalle",
      });

      let resolvedDetails: Array<{
        product_id: number;
        description: string | null;
        quantity_sacks: number;
        quantity_kg: number;
        unit_code: string;
      }> = [];

      try {
        resolvedDetails = await resolvePromise;
      } catch {
        return;
      }

      payload = {
        ...base,
        details: resolvedDetails,
      };
    } else {
      payload = {
        ...base,
        sale_ids: selectedSales,
      };
    }

    console.log("[GuideForm] raw form data:", data);
    console.log("[GuideForm] payload:", payload);
    onSubmit(payload);
  };

  // Sin lista estática: la búsqueda es async por código (handleProductCodeTab)
  const productOptions: ProductOption[] = [];

  const gridColumns: ExcelGridColumn<(typeof customDetails)[0]>[] = [
    {
      id: "product_code",
      header: "Código",
      type: "product-code",
      width: "120px",
      accessor: "product_code",
    },
    {
      id: "description",
      header: "Descripción",
      type: "product-code",
      width: "250px",
      accessor: "description",
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
      header: "Peso (kg)",
      type: "number",
      width: "120px",
      accessor: "quantity_kg",
    },
    {
      id: "unit_code",
      header: "Unidad",
      type: "readonly",
      width: "150px",
      render: (row, index) => (
        <SearchableSelect
          buttonSize="default"
          options={UNIT_MEASUREMENTS.map((um) => ({
            value: um.value,
            label: um.label,
          }))}
          value={row.unit_code}
          onChange={(value) => handleDetailChange(index, "unit_code", value)}
          placeholder="Unidad"
          className="w-full"
        />
      ),
    },
  ];

  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleResource | null>(null);

  const customerValue = form.watch("customer_id");
  const selectedCustomerId = customerValue ? Number(customerValue) : null;

  const {
    data: personZones,
    isLoading: isLoadingPersonZones,
    fetch: fetchPersonZones,
    refetch: refetchPersonZones,
  } = usePersonZones(selectedCustomerId);

  // Cliente auto-detectado desde la búsqueda por rango
  const [detectedCustomerName, setDetectedCustomerName] = useState<
    string | null
  >(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [customerAddresses, setCustomerAddresses] = useState<
    PersonZoneResource[]
  >([]);
  const [selectedPersonZoneId, setSelectedPersonZoneId] = useState("");
  const [isAddressManagerOpen, setIsAddressManagerOpen] = useState(false);
  const ubigeoAutofillRequestRef = useRef(0);
  const autoAppliedCustomerRef = useRef<string | null>(null);

  const autofillDestinationByAddress = useCallback(
    async (address: PersonZoneResource) => {
      form.setValue("destination_address", address.address, {
        shouldDirty: true,
        shouldValidate: true,
      });

      const requestId = ++ubigeoAutofillRequestRef.current;
      try {
        const response = await getUbigeos({
          params: {
            per_page: 2000,
          },
        });

        if (requestId !== ubigeoAutofillRequestRef.current) return;

        const normalizedZone = address.zone.name.trim().toLowerCase();
        const normalizedZoneCode = address.zone.code.trim().toLowerCase();
        const matchedUbigeo =
          response.data.find(
            (ubigeo) =>
              ubigeo.ubigeo_code.trim().toLowerCase() === normalizedZoneCode,
          ) ||
          response.data.find(
            (ubigeo) => ubigeo.name.trim().toLowerCase() === normalizedZone,
          );

        if (matchedUbigeo) {
          form.setValue("ubigeo_destination_id", matchedUbigeo.id.toString(), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      } catch {
        // Si no se puede resolver ubigeo automático, la dirección queda editable manualmente.
      }
    },
    [form],
  );

  const handleSelectPersonZone = useCallback(
    async (zoneId: string) => {
      setSelectedPersonZoneId(zoneId);
      if (!zoneId) return;

      const selectedZone = customerAddresses.find(
        (address) => address.id.toString() === zoneId,
      );

      if (!selectedZone) return;

      await autofillDestinationByAddress(selectedZone);
    },
    [customerAddresses, autofillDestinationByAddress],
  );

  // Cargar direcciones del cliente cuando cambia la selección
  useEffect(() => {
    if (!customerValue || !selectedCustomerId) {
      setCustomerAddresses([]);
      setSelectedPersonZoneId("");
      autoAppliedCustomerRef.current = null;
      return;
    }

    fetchPersonZones();
  }, [customerValue, selectedCustomerId, fetchPersonZones]);

  // Sincronizar selector y autocompletar dirección por defecto
  useEffect(() => {
    if (!customerValue) return;

    const addresses = personZones || [];
    setCustomerAddresses(addresses);

    if (addresses.length === 0) {
      setSelectedPersonZoneId("");
      return;
    }

    const hasCurrentSelection = addresses.some(
      (address) => address.id.toString() === selectedPersonZoneId,
    );
    const primary = addresses.find((address) => address.is_primary);
    const fallback = primary || addresses[0];
    const nextZoneId = hasCurrentSelection
      ? selectedPersonZoneId
      : fallback.id.toString();

    if (nextZoneId !== selectedPersonZoneId) {
      setSelectedPersonZoneId(nextZoneId);
    }


    if (
      !hasCurrentSelection ||
      autoAppliedCustomerRef.current !== customerValue ||
      !form.getValues("destination_address")
    ) {
      autoAppliedCustomerRef.current = customerValue;
      const selectedAddress = addresses.find(
        (address) => address.id.toString() === nextZoneId,
      );
      if (selectedAddress) {
        void autofillDestinationByAddress(selectedAddress);
      }
    }
  }, [
    personZones,
    selectedPersonZoneId,
    customerValue,
    form,
    autofillDestinationByAddress,
  ]);

  const handleCustomerChange = (_value: string, customer?: PersonResource) => {
    if (!customer) {
      setSelectedCustomerName("");
      return;
    }

    setSelectedCustomerName(
      customer.business_name ||
        `${customer.names ?? ""} ${customer.father_surname ?? ""} ${customer.mother_surname ?? ""}`.trim(),
    );
  };

  return (
    <>
      <Form {...form}>
        <form
          id="guide-form"
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Botones */}
          <div className="flex gap-2 col-span-full border-b pb-2">
            <Button
              size="sm"
              type="submit"
              variant="outline"
              colorIcon="emerald"
              disabled={
                isSubmitting ||
                (!useCustomDetails && selectedSales.length === 0) ||
                (useCustomDetails &&
                  customDetails.every(
                    (d) =>
                      !d.product_id &&
                      !d.description &&
                      !d.quantity_sacks &&
                      !d.quantity_kg,
                  ))
              }
            >
              {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X /> Cancelar
            </Button>
          </div>

          <div className="lg:col-span-1 space-y-4">
            {/* Información de la Guía */}
            <GroupFormSection
              title="Información de la Guía"
              icon={Truck}
              cols={{ sm: 1 }}
              className="col-span-full"
              headerExtra={
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setShowAdvancedFields((v) => !v)}
                >
                  {showAdvancedFields ? <EyeOff /> : <Eye />}
                  {showAdvancedFields
                    ? "Ocultar campos adicionales"
                    : "Mostrar campos adicionales"}
                </Button>
              }
            >
              <div className={showAdvancedFields ? "" : "hidden"}>
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
              </div>

              <div className={showAdvancedFields ? "" : "hidden"}>
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
              </div>

              {useCustomDetails ? (
                <FormSelectAsync
                  control={form.control}
                  name="customer_id"
                  label="Cliente"
                  placeholder="Buscar cliente..."
                  useQueryHook={useClients}
                  mapOptionFn={(customer: PersonResource) => ({
                    value: customer.id.toString(),
                    label:
                      customer.business_name ||
                      `${customer.names} ${customer.father_surname} ${customer.mother_surname}`.trim(),
                    description: customer.number_document || "",
                  })}
                  onValueChange={handleCustomerChange}
                />
              ) : (
                <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Cliente: </span>
                  Clientes Varios
                </div>
              )}

              {customerValue && (
                <div className="space-y-2 w-full">
                  <div className="w-full flex gap-1 items-end">
                    <SearchableSelect
                      label="Dirección del Cliente"
                      buttonSize="default"
                      options={customerAddresses.map((address) => ({
                        value: address.id.toString(),
                        label: address.address,
                        description: `${address.zone.name}${address.is_primary ? " - Principal" : ""}`,
                      }))}
                      value={selectedPersonZoneId}
                      onChange={(value) => {
                        void handleSelectPersonZone(value);
                      }}
                      placeholder={
                        isLoadingPersonZones
                          ? "Cargando direcciones..."
                          : "Seleccione una dirección"
                      }
                      disabled={
                        isLoadingPersonZones || customerAddresses.length === 0
                      }
                      className="w-full!"
                      classNameDiv="w-full!"
                      classNameLabel="w-full!"
                    />

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setIsAddressManagerOpen(true)}
                        disabled={!selectedCustomerId}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {customerAddresses.length === 0 && !isLoadingPersonZones && (
                    <p className="text-xs text-muted-foreground">
                      Este cliente no tiene direcciones configuradas. Use
                      "Gestionar" para registrar una dirección.
                    </p>
                  )}
                </div>
              )}

              <FormSelect
                control={form.control}
                name="motive_id"
                label="Motivo de Traslado"
                placeholder="Seleccione un motivo"
                options={motives
                  .sort((a, b) => a.id - b.id)
                  .map((motive) => ({
                    value: motive.id.toString(),
                    label: motive.name,
                    description: "CÓDIGO: " + motive.code,
                  }))}
              />

              <div className="hidden">
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
              </div>

              <div className="hidden">
                <DatePickerFormField
                  control={form.control}
                  name="issue_date"
                  label="Fecha de Emisión"
                  placeholder="Seleccione fecha"
                />
              </div>

              <div className="hidden">
                <DatePickerFormField
                  control={form.control}
                  name="transfer_date"
                  label="Fecha de Traslado"
                  placeholder="Seleccione fecha"
                />
              </div>

              <div className="hidden">
                <FormSelectAsync
                  control={form.control}
                  name="ubigeo_origin_id"
                  label="Ubigeo de Origen"
                  placeholder="Buscar ubigeo..."
                  useQueryHook={useUbigeosFrom}
                  additionalParams={{
                    per_page: 1300,
                  }}
                  mapOptionFn={(item: UbigeoResource) => ({
                    value: item.id.toString(),
                    label: item.name,
                    description: item.cadena,
                  })}
                  preloadItemId={defaultValues.ubigeo_origin_id}
                />
              </div>

              <div className="hidden">
                <FormInput
                  control={form.control}
                  name="origin_address"
                  label="Dirección de Origen"
                  placeholder="Ej: Av. Principal 123"
                />
              </div>

              <div className="hidden">
                <FormSelectAsync
                  control={form.control}
                  name="ubigeo_destination_id"
                  label="Ubigeo de Destino"
                  placeholder="Buscar ubigeo..."
                  useQueryHook={useUbigeosFrom}
                  mapOptionFn={(item: UbigeoResource) => ({
                    value: item.id.toString(),
                    label: item.name,
                    description: item.cadena,
                  })}
                />
              </div>

              <div className="hidden">
                <FormTextArea
                  control={form.control}
                  name="destination_address"
                  label="Dirección de Destino"
                  placeholder="Ej: Av. Secundaria 456"
                />
              </div>

              <div className="col-span-full hidden">
                <FormInput
                  control={form.control}
                  name="observations"
                  label="Observaciones"
                  placeholder="Observaciones adicionales"
                />
              </div>

              {showAdvancedFields && (
                <Separator className="col-span-full my-1" />
              )}

              {modalityValue !== "PRIVADO" && (
                <FormField
                  control={form.control}
                  name="carrier_document_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        RUC del Transportista
                        {modalityValue === "PUBLICO" ? "" : " "}
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            variant="default"
                            placeholder="Ingrese 11 dígitos"
                            {...field}
                            maxLength={11}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              field.onChange(value);

                              // Auto-search cuando se completa el RUC
                              if (value.length === 11) {
                                setTimeout(
                                  () => handleSearchCarrierDocument(),
                                  100,
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleSearchCarrierDocument}
                          disabled={
                            isSearchingCarrier ||
                            !field.value ||
                            field.value.length !== 11
                          }
                        >
                          {isSearchingCarrier ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {modalityValue !== "PRIVADO" && (
                <FormInput
                  control={form.control}
                  name="carrier_name"
                  label="Nombre del Transportista"
                  placeholder="Ej: Transportes SAC"
                />
              )}

              <div className="space-y-2">
                <FormSelectAsync
                  name="vehicle_id"
                  label="Placa del Vehículo"
                  control={form.control}
                  placeholder="Buscar placa..."
                  useQueryHook={useVehiclesSearch}
                  mapOptionFn={(vehicle: VehicleResource) => ({
                    value: vehicle.id.toString(),
                    label: vehicle.plate,
                    description: `${vehicle.brand} ${vehicle.model}${vehicle.owner ? ` — ${vehicle.owner.full_name}` : ""}`,
                  })}
                  onValueChange={(_value, vehicle) => {
                    if (vehicle) {
                      setSelectedVehicle(vehicle);
                      if (vehicle.mtc) {
                        form.setValue("carrier_mtc_number", vehicle.mtc);
                      }
                      if (vehicle.owner) {
                        const docNum = vehicle.owner.number_document || "";
                        const docType = docNum.length === 8 ? "DNI" : "CE";
                        form.setValue("driver_document_type", docType);
                        form.setValue("driver_document_number", docNum);
                        form.setValue("driver_name", vehicle.owner.full_name);
                      }
                    } else {
                      setSelectedVehicle(null);
                    }
                  }}
                />
                {selectedVehicle?.owner && (
                  <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Chofer:{" "}
                    </span>
                    {selectedVehicle.owner.full_name}
                    <span className="ml-2 text-xs">
                      (DNI:{" "}
                      {selectedVehicle.owner.number_document ?? "sin documento"}
                      )
                    </span>
                  </div>
                )}
              </div>

              {/* Campos adicionales (ocultos por defecto) */}
              <div className={showAdvancedFields ? "contents" : "hidden"}>
                {/* Selector de Conductor */}
                <div>
                  <FormSelectAsync
                    name="driver_id"
                    label="Conductor"
                    control={form.control}
                    placeholder="Buscar conductor..."
                    useQueryHook={useDrivers}
                    mapOptionFn={(driver) => ({
                      value: driver.id.toString(),
                      label:
                        driver.business_name ||
                        `${driver.names} ${driver.father_surname} ${driver.mother_surname}`.trim(),
                      description: driver.number_document || "",
                    })}
                    onValueChange={(_value, driver) => {
                      if (driver) {
                        const docType =
                          driver.document_type_name ||
                          (driver.number_document?.length === 8 ? "DNI" : "CE");
                        form.setValue("driver_document_type", docType);
                        form.setValue(
                          "driver_document_number",
                          driver.number_document || "",
                        );
                        const fullName =
                          driver.business_name ||
                          `${driver.names} ${driver.father_surname} ${driver.mother_surname}`.trim();
                        form.setValue("driver_name", fullName);
                      }
                    }}
                    preloadItemId={"37"}
                  >
                    <Button type="button" variant="outline" size="icon" asChild>
                      <Link to={DRIVER.ROUTE_ADD} target="_blank">
                        <Plus className="h-4 w-4" />
                      </Link>
                    </Button>
                  </FormSelectAsync>
                </div>

                <FormSelect
                  control={form.control}
                  name="driver_document_type"
                  label={`Tipo de Documento del Conductor${modalityValue === "PUBLICO" ? "" : " "}`}
                  placeholder="Seleccione tipo"
                  options={[
                    { value: "DNI", label: "DNI" },
                    { value: "CE", label: "Carnet de Extranjería" },
                    { value: "PASAPORTE", label: "Pasaporte" },
                  ]}
                />

                <FormInput
                  control={form.control}
                  name="driver_document_number"
                  label="Número de Documento del Conductor"
                  placeholder="Ej: 12345678"
                />

                <FormInput
                  control={form.control}
                  name="driver_name"
                  label="Nombre Completo del Conductor"
                  placeholder="Ej: Juan Pérez García"
                />

                <FormInput
                  control={form.control}
                  name="driver_license"
                  label="Licencia de Conducir"
                  placeholder="Ej: Q12345678"
                />

                <FormInput
                  control={form.control}
                  name="carrier_mtc_number"
                  label="Número MTC"
                  placeholder="Ej: MTC-123456"
                />

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

                <FormInput
                  control={form.control}
                  name="total_packages"
                  label="Total de Bultos (sacos)"
                  type="number"
                  placeholder="0"
                  className="bg-muted"
                />
              </div>
            </GroupFormSection>

            {/* Switch: Por Ventas / Por Productos */}
            <div className="flex items-center gap-3 p-4 bg-sidebar rounded-lg border">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="detail-mode" className="text-sm font-medium">
                Por Ventas
              </Label>
              <Switch
                id="detail-mode"
                checked={useCustomDetails}
                onCheckedChange={(checked) => {
                  setUseCustomDetails(checked);
                  form.setValue("total_packages", 0 as any);
                  // Por ventas → Clientes Varios (id=30); por productos → selección manual
                  form.setValue("customer_id", checked ? "" : "30");
                  setDetectedCustomerName(null);
                }}
              />
              <Label htmlFor="detail-mode" className="text-sm font-medium">
                Por Productos
              </Label>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Filtros por ventas abajo y en horizontal */}
            {!useCustomDetails && (
              <GroupFormSection
                title="Formulario de Ventas"
                icon={Search}
                cols={{ sm: 1 }}
                className="col-span-full"
                bordered
              >
                <SearchableSelect
                  buttonSize="default"
                  label="Tipo de Documento"
                  options={[
                    { value: "FACTURA", label: "FACTURA" },
                    { value: "BOLETA", label: "BOLETA" },
                  ]}
                  value={searchParams.document_type}
                  onChange={(value) =>
                    setSearchParams({ ...searchParams, document_type: value })
                  }
                  placeholder="Seleccione tipo"
                  className="md:w-full"
                />

                <FormInput
                  name="serie"
                  label="Serie"
                  placeholder="Ej: F001"
                  value={searchParams.serie}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, serie: e.target.value })
                  }
                />

                <div className="space-y-2">
                  <label className="flex uppercase font-bold justify-start items-center text-xs md:text-sm leading-none h-fit text-muted-foreground">
                    Rango de Números
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Número inicio"
                      value={searchParams.numero_inicio}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          numero_inicio: e.target.value,
                        })
                      }
                      className="h-7 md:h-8 text-xs md:text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Número fin"
                      value={searchParams.numero_fin}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          numero_fin: e.target.value,
                        })
                      }
                      className="h-7 md:h-8 text-xs md:text-sm"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleSearchSalesByRange}
                  disabled={isSearchingSales}
                  className="shrink-0 w-full md:w-auto"
                >
                  {isSearchingSales ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Ventas
                    </>
                  )}
                </Button>
              </GroupFormSection>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Alert variant="info">
              {selectedSales.length} venta(s) seleccionada(s) para la guía
            </Alert>

            {!useCustomDetails && salesByRange.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            salesByRange.length > 0 &&
                            selectedSales.length === salesByRange.length
                          }
                          onCheckedChange={handleSelectAllSales}
                          className="cursor-pointer"
                        />
                      </TableHead>
                      <TableHead>Documento ({salesByRange.length})</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByRange.map((sale) => {
                      const isExpanded = expandedSales.includes(sale.id);
                      return (
                        <>
                          <TableRow
                            key={sale.id}
                            className={`cursor-pointer hover:bg-muted/30 ${
                              selectedSales.includes(sale.id)
                                ? "bg-muted/50"
                                : ""
                            }`}
                            onClick={() => handleToggleSale(sale.id)}
                          >
                            <TableCell
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedSales((prev) =>
                                  isExpanded
                                    ? prev.filter((id) => id !== sale.id)
                                    : [...prev, sale.id],
                                );
                              }}
                              className="text-muted-foreground"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedSales.includes(sale.id)}
                                onCheckedChange={() =>
                                  handleToggleSale(sale.id)
                                }
                                className="cursor-pointer"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {sale.full_document_number}
                              </div>
                            </TableCell>
                            <TableCell>
                              {sale.customer.business_name ||
                                `${sale.customer.names} ${sale.customer.father_surname}`}
                            </TableCell>
                            <TableCell>
                              {new Date(sale.issue_date).toLocaleDateString(
                                "es-PE",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                },
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {sale.currency} {sale.total_amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          {isExpanded && sale.details.length > 0 && (
                            <TableRow key={`${sale.id}-details`}>
                              <TableCell colSpan={6} className="p-0 bg-muted/20">
                                <div className="px-8 py-2">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-muted-foreground border-b">
                                        <th className="text-left py-1 font-medium">Producto</th>
                                        <th className="text-right py-1 font-medium">Sacos</th>
                                        <th className="text-right py-1 font-medium">Kg</th>
                                        <th className="text-right py-1 font-medium">P. Unit.</th>
                                        <th className="text-right py-1 font-medium">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {sale.details.map((detail) => (
                                        <tr key={detail.id} className="border-b last:border-0">
                                          <td className="py-1">
                                            <span className="font-medium">{detail.product.codigo}</span>
                                            {" — "}
                                            {detail.product.name}
                                          </td>
                                          <td className="text-right py-1">{detail.quantity_sacks}</td>
                                          <td className="text-right py-1">{detail.quantity_kg}</td>
                                          <td className="text-right py-1">{detail.unit_price.toFixed(2)}</td>
                                          <td className="text-right py-1">{detail.subtotal.toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {useCustomDetails && (
              <GroupFormSection
                className="col-span-full"
                title="Detalle de Productos"
                icon={Package}
                cols={{ sm: 1 }}
                headerExtra={
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="sale_document_number"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 mb-0">
                          <FormLabel className="whitespace-nowrap text-sm">
                            N° Documento de Venta
                          </FormLabel>
                          <FormControl>
                            <Input
                              variant="default"
                              placeholder="Ej: F001-00000123"
                              className="w-44"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                }
              >
                <div className="space-y-3">
                  <ExcelGrid
                    columns={gridColumns}
                    data={customDetails}
                    onAddRow={handleAddDetail}
                    onRemoveRow={handleRemoveDetail}
                    onCellChange={handleDetailChange}
                    productOptions={productOptions}
                    onProductSelect={handleProductSelect}
                    onProductCodeTab={handleProductGridTab}
                    emptyMessage="Agregue productos al detalle"
                  />
                </div>
              </GroupFormSection>
            )}

            {form.formState.errors &&
              Object.keys(form.formState.errors).length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <ul className="list-disc list-inside text-sm text-red-900 dark:text-red-100">
                    {Object.entries(form.formState.errors).map(
                      ([fieldName, error]) => (
                        <li key={fieldName}>{error?.message as string}</li>
                      ),
                    )}
                  </ul>
                </div>
              )}
          </div>
        </form>
      </Form>

      {selectedCustomerId !== null && (
        <ClientAddressesSheet
          open={isAddressManagerOpen}
          onOpenChange={(open) => {
            setIsAddressManagerOpen(open);
            if (!open) {
              void refetchPersonZones();
            }
          }}
          personId={selectedCustomerId}
          personName={detectedCustomerName || selectedCustomerName || "Cliente"}
        />
      )}
    </>
  );
};
