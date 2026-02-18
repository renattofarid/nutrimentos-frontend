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
import { Loader, Truck, MapPin, Search, Plus } from "lucide-react";
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
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import type { VehicleResource } from "@/pages/vehicle/lib/vehicle.interface";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getSalesByRange } from "@/pages/sale/lib/sale.actions";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import { toast } from "sonner";
import { useAllDrivers } from "@/pages/driver/lib/driver.hook";
import { useAllCarriers } from "@/pages/carrier/lib/carrier.hook";
import { successToast } from "@/lib/core.function";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useUbigeosFrom, useUbigeosTo } from "../lib/ubigeo.hook";

interface GuideFormProps {
  defaultValues: Partial<GuideSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  branches: BranchResource[];
  warehouses: WarehouseResource[];
  products: ProductResource[];
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

  // Cargar conductores y transportistas
  const { data: drivers, refetch: refetchDrivers } = useAllDrivers();
  const { data: carriers, refetch: refetchCarriers } = useAllCarriers();

  useEffect(() => {
    refetchDrivers();
    refetchCarriers();
  }, []);

  // Estado para búsqueda de transportista
  const [isSearchingCarrier, setIsSearchingCarrier] = useState(false);

  // Estado para conductor seleccionado
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

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

      // Si solo hay un almacén, seleccionarlo automáticamente
      if (filtered.length === 1) {
        form.setValue("warehouse_id", filtered[0].id.toString());
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
    form.setValue("motive_id", "1");
    form.setValue("carrier_document_type", "RUC");
  }, [form]);

  // Calcular peso total y total de bultos automáticamente cuando cambian las ventas seleccionadas
  useEffect(() => {
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
    // Validar que se hayan seleccionado ventas
    if (selectedSales.length === 0) {
      toast.error("Debe seleccionar al menos una venta");
      return;
    }

    // Crear payload con los campos parseados correctamente
    // NOTA: carrier_id y driver_id NO se envían al backend, solo se usan
    // para llenar automáticamente los campos del formulario cuando se
    // encuentra un transportista o conductor registrado en el sistema
    const payload = {
      branch_id: parseInt(data.branch_id),
      warehouse_id: parseInt(data.warehouse_id),
      sale_ids: selectedSales,
      customer_id: parseInt(data.customer_id),
      issue_date: data.issue_date,
      transfer_date: data.transfer_date,
      modality: data.modality,
      motive_id: parseInt(data.motive_id),
      sale_document_number: "-",
      carrier_document_type: "RUC",
      carrier_document_number: data.carrier_document_number,
      carrier_name: data.carrier_name,
      carrier_ruc: data.carrier_document_number,
      carrier_mtc_number: data.carrier_mtc_number,
      vehicle_id: data.vehicle_id ? parseInt(data.vehicle_id) : null,
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
      observations: data.observations || "",
    };

    console.log("✅ Payload final siendo enviado:", payload);
    onSubmit(payload);
  };

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
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
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
                <FormLabel>Observaciones (Opcional)</FormLabel>
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
        </GroupFormSection>

        {/* Información del Transporte, Direcciones y Carga */}
        <GroupFormSection
          title="Información del Transporte, Direcciones y Carga"
          icon={MapPin}
          cols={{ sm: 1, md: 2, lg: 3 }}
        >
          <FormField
            control={form.control}
            name="carrier_document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  RUC del Transportista
                  {modalityValue === "PUBLICO" ? "" : " (Opcional)"}
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
                          setTimeout(() => handleSearchCarrierDocument(), 100);
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

          <FormField
            control={form.control}
            name="carrier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre del Transportista
                  {modalityValue === "PUBLICO" ? "" : " (Opcional)"}
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

          <FormField
            control={form.control}
            name="carrier_mtc_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Número MTC{modalityValue === "PUBLICO" ? "" : " (Opcional)"}
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

          {/* Selector de Conductor */}
          <FormItem className="md:col-span-2">
            <FormLabel>
              Buscar Conductor {modalityValue === "PUBLICO" ? "" : "(Opcional)"}
            </FormLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableSelect
                  className="md:w-full"
                  buttonSize="default"
                  options={
                    drivers?.map((driver) => ({
                      value: driver.id.toString(),
                      label:
                        driver.business_name ||
                        `${driver.names} ${driver.father_surname} ${driver.mother_surname}`.trim(),
                      description: driver.number_document || "",
                    })) || []
                  }
                  value={selectedDriverId}
                  onChange={(value) => {
                    setSelectedDriverId(value);
                    const selectedDriver = drivers?.find(
                      (d) => d.id.toString() === value,
                    );
                    if (selectedDriver) {
                      const docType =
                        selectedDriver.document_type_name ||
                        (selectedDriver.number_document?.length === 8
                          ? "DNI"
                          : "CE");
                      form.setValue("driver_document_type", docType);
                      form.setValue(
                        "driver_document_number",
                        selectedDriver.number_document || "",
                      );
                      const fullName =
                        selectedDriver.business_name ||
                        `${selectedDriver.names} ${selectedDriver.father_surname} ${selectedDriver.mother_surname}`.trim();
                      form.setValue("driver_name", fullName);
                      // Si el conductor tiene licencia, también la llenamos
                      // (actualmente el modelo no tiene este campo, se debe agregar manualmente)
                    }
                  }}
                  placeholder="Buscar conductor..."
                />
              </div>
              <Button type="button" variant="outline" size="icon" asChild>
                <Link to={DRIVER.ROUTE_ADD} target="_blank">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FormItem>

          <FormSelect
            control={form.control}
            name="driver_document_type"
            label={`Tipo de Documento del Conductor${modalityValue === "PUBLICO" ? "" : " (Opcional)"}`}
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
                  {modalityValue === "PUBLICO" ? "" : " (Opcional)"}
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
                  {modalityValue === "PUBLICO" ? "" : " (Opcional)"}
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
                  {modalityValue === "PUBLICO" ? "" : " (Opcional)"}
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
            name="vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Vehículo{modalityValue === "PUBLICO" ? "" : " (Opcional)"}
                </FormLabel>
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
                    onChange={field.onChange}
                    placeholder="Seleccionar vehículo..."
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
        </GroupFormSection>

        {/* Búsqueda de Ventas por Rango */}
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

            {
              /* Descripcion de los mensajes de errores del form */
              form.formState.errors &&
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
                )
            }
          </div>
        </GroupFormSection>

        {/* Botones */}
        <div className="flex gap-4 w-full justify-end col-span-full">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            size="sm"
            type="submit"
            disabled={isSubmitting || selectedSales.length === 0}
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
