"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
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
import { Loader, Truck, Search, Plus, Eye, EyeOff, Package, ShoppingCart } from "lucide-react";
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
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import type { VehicleResource } from "@/pages/vehicle/lib/vehicle.interface";
import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { getSalesByRange } from "@/pages/sale/lib/sale.actions";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import { toast } from "sonner";
import { useDrivers } from "@/pages/driver/lib/driver.hook";
import { useAllCarriers } from "@/pages/carrier/lib/carrier.hook";
import { successToast } from "@/lib/core.function";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useUbigeosFrom, useUbigeosTo } from "../lib/ubigeo.hook";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProduct } from "@/pages/product/lib/product.hook";
import {
  ExcelGrid,
  type ExcelGridColumn,
  type ProductOption,
} from "@/components/ExcelGrid";

interface GuideFormProps {
  defaultValues: Partial<GuideSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  branches: BranchResource[];
  warehouses: WarehouseResource[];
  customers: PersonResource[];
  motives: GuideMotiveResource[];
  vehicles: VehicleResource[];
  guide?: GuideResource;
}

export const GuideForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  branches,
  warehouses,
  customers,
  motives,
  vehicles,
}: GuideFormProps) => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WarehouseResource[]
  >([]);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Estados para búsqueda de ventas por rango
  const [salesByRange, setSalesByRange] = useState<SaleResource[]>([]);
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const [isSearchingSales, setIsSearchingSales] = useState(false);
  const [searchParams, setSearchParams] = useState({
    document_type: "BOLETA",
    person_zone_id: "",
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
  >([{ product_id: "", product_code: "", product_name: "", description: "", quantity_sacks: "", quantity_kg: "", unit_code: "KGM" }]);

  // Búsqueda async de producto por código (al dar Tab en la grilla)
  const [productCodeSearch, setProductCodeSearch] = useState<{
    rowIndex: number;
    code: string;
  } | null>(null);
  const productCodeCallbacksRef = useRef<{
    advance: () => void;
    setError: (msg: string) => void;
  } | null>(null);

  const { data: productSearchResult, isFetching: isSearchingProduct } = useProduct(
    productCodeSearch ? { codigo: productCodeSearch.code, direction: "asc" } : undefined
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
        toast.success("Transportista encontrado en el sistema");
        return;
      }

      // Si no existe, buscar en SUNAT
      const result = await searchRUC({ search: documentNumber });
      if (result && isValidData(result.message) && result.data) {
        form.setValue("carrier_name", result.data.business_name || "");
        toast.success("Datos obtenidos de SUNAT");
      } else {
        toast.warning("No se encontró información del RUC");
      }
    } catch (error) {
      console.error("Error searching carrier document:", error);
      toast.error("Error al buscar el documento");
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
      toast.error("Complete todos los campos de búsqueda");
      return;
    }

    setIsSearchingSales(true);
    try {
      const response = await getSalesByRange(searchParams);

      if (response.data.length === 0) {
        toast.warning("No se encontraron ventas en el rango especificado");
        setSalesByRange([]);
        return;
      }

      setSalesByRange(response.data);
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
      //   toast.warning(
      //     `Hay números faltantes en el rango: ${response.meta.numeros_faltantes?.join(
      //       ", "
      //     )}`
      //   );
      // }
    } catch (error) {
      console.error("Error searching sales by range:", error);
      toast.error("Error al buscar ventas");
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
      return [...prev, saleId];
    });
  };

  // Función para seleccionar todas las ventas
  const handleSelectAllSales = () => {
    if (selectedSales.length === salesByRange.length) {
      setSelectedSales([]);
    } else {
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
    form.setValue("carrier_document_type", "RUC");
  }, [form]);

  // Helpers para manejar filas de productos personalizados
  const handleAddDetail = () => {
    setCustomDetails((prev) => [
      ...prev,
      { product_id: "", product_code: "", product_name: "", description: "", quantity_sacks: "", quantity_kg: "", unit_code: "KGM" },
    ]);
  };

  const handleRemoveDetail = (index: number) => {
    setCustomDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetailChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setCustomDetails((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleProductSelect = useCallback((index: number, product: ProductOption) => {
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
  }, []);

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
    } else if (productSearchResult !== undefined) {
      callbacks.setError(
        `No se encontró ningún producto con código "${productCodeSearch.code}"`
      );
    }

    productCodeCallbacksRef.current = null;
    setProductCodeSearch(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearchResult, isSearchingProduct]);

  const handleProductCodeTab = useCallback(
    (rowIndex: number, code: string, advance: () => void, setError: (msg: string) => void) => {
      if (!code.trim()) {
        advance();
        return;
      }
      productCodeCallbacksRef.current = { advance, setError };
      setProductCodeSearch({ rowIndex, code });
    },
    []
  );

  // Auto-calcular totales cuando cambian los productos personalizados
  useEffect(() => {
    if (!useCustomDetails) return;
    const totalWeight = customDetails.reduce(
      (sum, d) => sum + (parseFloat(d.quantity_kg) || 0),
      0,
    );
    const totalPackages = customDetails.reduce(
      (sum, d) => sum + (parseFloat(d.quantity_sacks) || 0),
      0,
    );
    form.setValue("total_weight", totalWeight as any);
    form.setValue("total_packages", totalPackages as any);
  }, [customDetails, useCustomDetails, form]);

  // Calcular peso total y total de bultos automáticamente cuando cambian las ventas seleccionadas
  useEffect(() => {
    if (useCustomDetails) return;
    if (selectedSales.length > 0 && salesByRange.length > 0) {
      const selectedSalesData = salesByRange.filter((sale) =>
        selectedSales.includes(sale.id),
      );

      // Calcular peso total (usa el total_weight que retorna el backend)
      const totalWeight = selectedSalesData.reduce((sum, sale) => {
        const weight =
          typeof sale.total_weight === "string"
            ? parseFloat(sale.total_weight)
            : sale.total_weight;
        return sum + (weight || 0);
      }, 0);

      // Calcular total de bultos (suma de quantity_sacks de todos los detalles)
      const totalPackages = selectedSalesData.reduce((sum, sale) => {
        const sacks = sale.details?.reduce(
          (detailSum, detail) => detailSum + (detail.quantity_sacks || 0),
          0,
        );
        return sum + (sacks || 0);
      }, 0);

      form.setValue("total_weight", totalWeight as any);
      form.setValue("total_packages", totalPackages as any);
    } else if (selectedSales.length === 0) {
      form.setValue("total_weight", 0 as any);
      form.setValue("total_packages", 0 as any);
    }
  }, [selectedSales, salesByRange, form]);

  const handleFormSubmit = (data: any) => {
    if (!useCustomDetails && selectedSales.length === 0) {
      toast.error("Debe seleccionar al menos una venta");
      return;
    }

    if (useCustomDetails) {
      const validDetails = customDetails.filter((d) => d.product_id);
      if (validDetails.length === 0) {
        toast.error("Debe agregar al menos un producto");
        return;
      }
    }

    const base = {
      use_custom_details: useCustomDetails,
      branch_id: parseInt(data.branch_id),
      warehouse_id: parseInt(data.warehouse_id),
      customer_id: parseInt(data.customer_id),
      issue_date: data.issue_date,
      transfer_date: data.transfer_date,
      modality: data.modality,
      motive_id: parseInt(data.motive_id),
      sale_document_number: useCustomDetails
        ? data.sale_document_number || null
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
      total_weight: data.total_weight,
      total_packages: data.total_packages,
      observations: data.observations || null,
    };

    const payload = useCustomDetails
      ? {
          ...base,
          details: customDetails
            .filter((d) => d.product_id)
            .map((d) => ({
              product_id: parseInt(d.product_id),
              description: d.description,
              quantity_sacks: parseFloat(d.quantity_sacks) || 0,
              quantity_kg: parseFloat(d.quantity_kg) || 0,
              unit_code: d.unit_code,
            })),
        }
      : {
          ...base,
          sale_ids: selectedSales,
        };

    console.log("✅ Payload final siendo enviado:", payload);
    onSubmit(payload);
  };

  // Sin lista estática: la búsqueda es async por código (handleProductCodeTab)
  const productOptions: ProductOption[] = [];

  const gridColumns: ExcelGridColumn<typeof customDetails[0]>[] = [
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
      width: "250px",
      accessor: "product_name",
    },
    {
      id: "description",
      header: "Descripción",
      type: "text",
      width: "200px",
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
          options={UNIT_MEASUREMENTS.map((um) => ({ value: um.value, label: um.label }))}
          value={row.unit_code}
          onChange={(value) => handleDetailChange(index, "unit_code", value)}
          placeholder="Unidad"
          className="w-full"
        />
      ),
    },
  ];

  const customerValue = form.watch("customer_id");

  // Obtener las direcciones del cliente seleccionado
  const selectedCustomerAddresses = useMemo(() => {
    if (!customerValue) return [];
    const customer = customers.find((c) => c.id.toString() === customerValue);
    return customer?.person_zones || [];
  }, [customerValue, customers]);

  // Setear automáticamente la primera person_zone cuando se selecciona un cliente y solo hay una
  useEffect(() => {
    if (customerValue && selectedCustomerAddresses.length === 1) {
      setSearchParams((prev) => ({
        ...prev,
        person_zone_id: selectedCustomerAddresses[0].id.toString(),
      }));
    } else if (!customerValue) {
      setSearchParams((prev) => ({
        ...prev,
        person_zone_id: "",
      }));
    }
  }, [customerValue, selectedCustomerAddresses]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Información de la Guía */}
        <GroupFormSection
          title="Información de la Guía"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 4, xl: 6 }}
          className="col-span-full"
          headerExtra={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFields((v) => !v)}
            >
              {showAdvancedFields ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showAdvancedFields
                ? "Ocultar campos adicionales"
                : "Mostrar campos adicionales"}
            </Button>
          }
        >
          {showAdvancedFields && (
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
          )}

          {showAdvancedFields && (
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
          )}

          <FormSelect
            control={form.control}
            name="customer_id"
            label="Cliente"
            placeholder="Seleccione un cliente"
            options={customers.map((customer) => ({
              value: customer.id.toString(),
              label:
                customer.business_name ??
                `${customer.names} ${customer.father_surname} ${customer.mother_surname}`.trim(),
              description: customer.number_document ?? "-",
            }))}
            withValue
          />

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

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="Fecha de Emisión"
            placeholder="Seleccione fecha"
          />

          <DatePickerFormField
            control={form.control}
            name="transfer_date"
            label="Fecha de Traslado"
            placeholder="Seleccione fecha"
          />

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

          <FormField
            control={form.control}
            name="origin_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Origen</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Av. Principal 123"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelectAsync
            control={form.control}
            name="ubigeo_destination_id"
            label="Ubigeo de Destino"
            placeholder="Buscar ubigeo..."
            useQueryHook={useUbigeosTo}
            mapOptionFn={(item: UbigeoResource) => ({
              value: item.id.toString(),
              label: item.name,
              description: item.cadena,
            })}
          />

          <FormField
            control={form.control}
            name="destination_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Destino</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Av. Secundaria 456"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Observaciones </FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Observaciones adicionales"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-full my-1" />

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
            <FormField
              control={form.control}
              name="carrier_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre del Transportista
                    {modalityValue === "PUBLICO" ? "" : " "}
                  </FormLabel>
                  <FormControl>
                    <Input
                      variant="default"
                      placeholder="Ej: Transportes SAC"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="total_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Total (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    variant="default"
                    placeholder="0.00"
                    {...field}
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehículo</FormLabel>
                <FormControl>
                  <SearchableSelect
                    className="md:w-full"
                    buttonSize="default"
                    options={vehicles.map((vehicle) => ({
                      value: vehicle.id.toString(),
                      label: `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`,
                      description: vehicle.vehicle_type || "",
                    }))}
                    value={field.value ?? ""}
                    onChange={(value) => {
                      field.onChange(value);
                      const vehicle = vehicles.find(
                        (v) => v.id.toString() === value,
                      );
                      if (vehicle?.mtc) {
                        form.setValue("carrier_mtc_number", vehicle.mtc);
                      }
                    }}
                    placeholder="Seleccionar vehículo..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campos adicionales (ocultos por defecto) */}
          {showAdvancedFields && (
            <>
              {/* Selector de Conductor */}
              <div className="md:col-span-2">
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

              <FormField
                control={form.control}
                name="driver_document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Número de Documento del Conductor
                      {modalityValue === "PUBLICO" ? "" : " "}
                    </FormLabel>
                    <FormControl>
                      <Input
                        variant="default"
                        placeholder="Ej: 12345678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driver_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre Completo del Conductor
                      {modalityValue === "PUBLICO" ? "" : " "}
                    </FormLabel>
                    <FormControl>
                      <Input
                        variant="default"
                        placeholder="Ej: Juan Pérez García"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driver_license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Licencia de Conducir
                      {modalityValue === "PUBLICO" ? "" : " "}
                    </FormLabel>
                    <FormControl>
                      <Input
                        variant="default"
                        placeholder="Ej: Q12345678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carrier_mtc_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Número MTC{modalityValue === "PUBLICO" ? "" : " "}
                    </FormLabel>
                    <FormControl>
                      <Input
                        variant="default"
                        placeholder="Ej: MTC-123456"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

              <FormField
                control={form.control}
                name="total_packages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Bultos (sacos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        variant="default"
                        placeholder="0"
                        {...field}
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </GroupFormSection>

        {/* Switch: Por Ventas / Por Productos */}
        <div className="col-span-full flex items-center gap-3 p-4 bg-sidebar rounded-lg border">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="detail-mode" className="text-sm font-medium">
            Por Ventas
          </Label>
          <Switch
            id="detail-mode"
            checked={useCustomDetails}
            onCheckedChange={(checked) => {
              setUseCustomDetails(checked);
              form.setValue("total_weight", 0 as any);
              form.setValue("total_packages", 0 as any);
            }}
          />
          <Label htmlFor="detail-mode" className="text-sm font-medium">
            Por Productos
          </Label>
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Detalle por Ventas */}
        {!useCustomDetails && (
          <GroupFormSection
            className="col-span-full"
            title="Búsqueda de Ventas por Rango"
            icon={Search}
            cols={{ sm: 1 }}
          >
            <div className="space-y-4">
              {/* Filtros de búsqueda */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-sidebar rounded-lg">
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

                <div className="space-y-2">
                  <SearchableSelect
                    buttonSize="default"
                    label="Dirección del Cliente"
                    placeholder="Seleccione una dirección"
                    disabled={
                      !customerValue || selectedCustomerAddresses.length === 0
                    }
                    value={searchParams.person_zone_id}
                    onChange={(value) => {
                      setSearchParams((prev) => ({
                        ...prev,
                        person_zone_id: value,
                      }));
                    }}
                    options={selectedCustomerAddresses.map((address) => ({
                      value: address.id.toString(),
                      label: `${address.address}${address.is_primary ? " (Principal)" : ""}`,
                      description: address.zone_name,
                    }))}
                    withValue={false}
                    className="md:w-full"
                  />
                  {customerValue && selectedCustomerAddresses.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      El cliente no tiene direcciones registradas
                    </p>
                  )}
                </div>

                <FormInput
                  name="serie"
                  label="Serie"
                  placeholder="Ej: F001"
                  value={searchParams.serie}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, serie: e.target.value })
                  }
                />

                <FormInput
                  name="numero_inicio"
                  label="Número Inicio"
                  type="number"
                  placeholder="Ej: 1"
                  value={searchParams.numero_inicio}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      numero_inicio: e.target.value,
                    })
                  }
                />

                <FormInput
                  name="numero_fin"
                  label="Número Fin"
                  placeholder="Ej: 100"
                  type="number"
                  value={searchParams.numero_fin}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      numero_fin: e.target.value,
                    })
                  }
                />

                <div className="md:col-span-full flex justify-end">
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleSearchSalesByRange}
                    disabled={isSearchingSales}
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
                </div>
              </div>

              {/* Lista de ventas encontradas */}
              {salesByRange.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 bg-sidebar border-b flex justify-between items-center">
                    <h3 className="font-semibold">
                      Ventas encontradas ({salesByRange.length})
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllSales}
                    >
                      {selectedSales.length === salesByRange.length
                        ? "Deseleccionar Todas"
                        : "Seleccionar Todas"}
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                        <TableHead>Documento</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Peso (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesByRange.map((sale) => (
                        <TableRow
                          key={sale.id}
                          className={`cursor-pointer hover:bg-muted/30 ${
                            selectedSales.includes(sale.id) ? "bg-muted/50" : ""
                          }`}
                          onClick={() => handleToggleSale(sale.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedSales.includes(sale.id)}
                              onCheckedChange={() => handleToggleSale(sale.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {sale.full_document_number}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {sale.document_type}
                              </div>
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
                          <TableCell className="text-right">
                            {sale.total_weight}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Resumen de ventas seleccionadas */}
              {selectedSales.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {selectedSales.length} venta(s) seleccionada(s) para la guía
                  </p>
                </div>
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
          </GroupFormSection>
        )}

        {/* Detalle por Productos */}
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
                onProductCodeTab={handleProductCodeTab}
                emptyMessage="Agregue productos al detalle"
              />

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
          </GroupFormSection>
        )}

        {/* Botones */}
        <div className="flex gap-4 w-full justify-end col-span-full">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            size="sm"
            type="submit"
            disabled={
              isSubmitting ||
              (!useCustomDetails && selectedSales.length === 0) ||
              (useCustomDetails && customDetails.every((d) => !d.product_id))
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
