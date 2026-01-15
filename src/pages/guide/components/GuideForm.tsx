"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader, Truck, MapPin, Search } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { SelectSearchForm } from "@/components/SelectSearchForm";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { GroupFormSection } from "@/components/GroupFormSection";
import { SearchableSelect } from "@/components/SearchableSelect";
import { FormInput } from "@/components/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import { guideSchema, type GuideSchema } from "../lib/guide.schema";
import { searchUbigeos } from "../lib/ubigeo.actions";
import type { UbigeoResource } from "../lib/ubigeo.interface";
import {
  searchRUC,
  searchDNI,
  isValidData,
} from "@/lib/document-search.service";
import {
  MODALITIES,
  CARRIER_DOCUMENT_TYPES,
  DRIVER_DOCUMENT_TYPES,
  UNIT_MEASUREMENTS,
  type GuideResource,
  type GuideMotiveResource,
} from "../lib/guide.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getSalesByRange } from "@/pages/sale/lib/sale.actions";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import { toast } from "sonner";

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
}: GuideFormProps) => {
  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WarehouseResource[]
  >([]);

  // Estado local para ubigeos de origen
  const [originUbigeos, setOriginUbigeos] = useState<UbigeoResource[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);

  // Estado local para ubigeos de destino
  const [destinationUbigeos, setDestinationUbigeos] = useState<
    UbigeoResource[]
  >([]);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);

  // Estados para búsqueda de ventas por rango
  const [salesByRange, setSalesByRange] = useState<SaleResource[]>([]);
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const [isSearchingSales, setIsSearchingSales] = useState(false);
  const [searchParams, setSearchParams] = useState({
    document_type: "FACTURA",
    serie: "",
    numero_inicio: "",
    numero_fin: "",
  });

  const formatUbigeoLabel = (ubigeo: UbigeoResource): string => {
    const parts = ubigeo.cadena.split("-");
    if (parts.length >= 4) {
      return `${parts[1]} > ${parts[2]} > ${parts[3]}`;
    }
    return ubigeo.cadena;
  };

  // Función para buscar ubigeos de origen
  const handleSearchOriginUbigeos = useCallback(async (cadena?: string) => {
    setIsSearchingOrigin(true);
    try {
      const response = await searchUbigeos(cadena, 15);
      setOriginUbigeos(response.data);
    } catch (error) {
      console.error("Error searching origin ubigeos:", error);
      setOriginUbigeos([]);
    } finally {
      setIsSearchingOrigin(false);
    }
  }, []);

  // Función para buscar ubigeos de destino
  const handleSearchDestinationUbigeos = useCallback(
    async (cadena?: string) => {
      setIsSearchingDestination(true);
      try {
        const response = await searchUbigeos(cadena, 15);
        setDestinationUbigeos(response.data);
      } catch (error) {
        console.error("Error searching destination ubigeos:", error);
        setDestinationUbigeos([]);
      } finally {
        setIsSearchingDestination(false);
      }
    },
    []
  );

  const form = useForm({
    resolver: zodResolver(guideSchema) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const selectedBranchId = form.watch("branch_id");
  const carrierRuc = form.watch("carrier_ruc");
  const carrierDocumentType = form.watch("carrier_document_type");

  // Sincronizar carrier_ruc con carrier_document_number cuando el tipo es RUC
  useEffect(() => {
    if (carrierDocumentType === "RUC" && carrierRuc) {
      form.setValue("carrier_document_number", carrierRuc);
    }
  }, [carrierRuc, carrierDocumentType, form]);

  // Filtrar warehouses por branch
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

  // Función para buscar RUC del transportista
  const handleSearchCarrierRUC = async () => {
    const ruc = form.getValues("carrier_ruc");
    if (!ruc || ruc.length !== 11) {
      return;
    }

    try {
      const result = await searchRUC({ search: ruc });
      if (result && isValidData(result.message) && result.data) {
        form.setValue("carrier_name", result.data.business_name || "");
        form.setValue(
          "carrier_document_number",
          result.data.number_document || ""
        );
        form.setValue("carrier_document_type", "RUC");
      }
    } catch (error) {
      console.error("Error searching RUC:", error);
    }
  };

  // Función para buscar DNI del conductor
  const handleSearchDriverDNI = async () => {
    const dni = form.getValues("driver_document_number");
    if (!dni || dni.length !== 8) {
      return;
    }

    try {
      const result = await searchDNI({ search: dni });
      if (result && isValidData(result.message) && result.data) {
        const fullName = `${result.data.names} ${result.data.father_surname} ${result.data.mother_surname}`;
        form.setValue("driver_name", fullName.trim());
        form.setValue("driver_document_type", "DNI");
      }
    } catch (error) {
      console.error("Error searching DNI:", error);
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
      toast.success(`Se encontraron ${response.data.length} ventas`);

      if (response.meta.tiene_faltantes) {
        toast.warning(
          `Hay números faltantes en el rango: ${response.meta.numeros_faltantes?.join(
            ", "
          )}`
        );
      }
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

  // Establecer fechas automáticamente
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    form.setValue("issue_date", formattedDate);
    form.setValue("transfer_date", formattedDate);
  }, [form]);

  const handleFormSubmit = (data: any) => {
    // Validar que se hayan seleccionado ventas
    if (selectedSales.length === 0) {
      toast.error("Debe seleccionar al menos una venta");
      return;
    }

    // Crear payload con los campos parseados correctamente
    const payload = {
      branch_id: parseInt(data.branch_id),
      warehouse_id: parseInt(data.warehouse_id),
      sale_ids: selectedSales,
      customer_id: parseInt(data.customer_id),
      issue_date: data.issue_date,
      transfer_date: data.transfer_date,
      modality: data.modality,
      motive_id: parseInt(data.motive_id),
      sale_document_number: data.sale_document_number,
      carrier_document_type: data.carrier_document_type,
      carrier_document_number: data.carrier_document_number,
      carrier_name: data.carrier_name,
      carrier_ruc: data.carrier_ruc,
      carrier_mtc_number: data.carrier_mtc_number,
      vehicle_plate: data.vehicle_plate || null,
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6 w-full"
      >
        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
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
            }))}
          />

          <FormSelect
            control={form.control}
            name="motive_id"
            label="Motivo de Traslado"
            placeholder="Seleccione un motivo"
            options={motives.map((motive) => ({
              value: motive.id.toString(),
              label: motive.name,
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

          <FormField
            control={form.control}
            name="sale_document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento de Venta</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: F001-00123"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Búsqueda de Ventas por Rango */}
        <GroupFormSection
          title="Búsqueda de Ventas por Rango"
          icon={Search}
          cols={{ sm: 1 }}
        >
          <div className="space-y-4">
            {/* Filtros de búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-sidebar rounded-lg">
              <SearchableSelect
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

              <div className="md:col-span-4 flex justify-end">
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
                        <TableCell>{sale.issue_date}</TableCell>
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
          </div>
        </GroupFormSection>

        {/* Información del Transportista */}
        <GroupFormSection
          title="Información del Transportista"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        >
          <FormSelect
            control={form.control}
            name="carrier_document_type"
            label="Tipo de Documento"
            placeholder="Seleccione"
            options={CARRIER_DOCUMENT_TYPES.map((dt) => ({
              value: dt.value,
              label: dt.label,
            }))}
          />

          <FormField
            control={form.control}
            name="carrier_document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: 20123456789"
                    {...field}
                    disabled={carrierDocumentType === "RUC"}
                  />
                </FormControl>
                {carrierDocumentType === "RUC" && (
                  <p className="text-xs text-muted-foreground">
                    Se sincroniza automáticamente con el RUC
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carrier_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Transportista</FormLabel>
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
            name="carrier_ruc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC del Transportista</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      variant="default"
                      placeholder="Ej: 20123456789"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSearchCarrierRUC}
                    disabled={!field.value || field.value.length !== 11}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carrier_mtc_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número MTC</FormLabel>
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

          <FormField
            control={form.control}
            name="vehicle_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa del Vehículo (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: ABC-123"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Información del Conductor */}
        <GroupFormSection
          title="Información del Conductor (Opcional)"
          icon={Truck}
          cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        >
          <FormSelect
            control={form.control}
            name="driver_document_type"
            label="Tipo de Documento"
            placeholder="Seleccione"
            options={DRIVER_DOCUMENT_TYPES.map((dt) => ({
              value: dt.value,
              label: dt.label,
            }))}
          />

          <FormField
            control={form.control}
            name="driver_document_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      variant="default"
                      placeholder="Ej: 12345678"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSearchDriverDNI}
                    disabled={!field.value || field.value.length !== 8}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="driver_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Conductor</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Juan Pérez"
                    {...field}
                    value={field.value ?? ""}
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
                <FormLabel>Licencia de Conducir</FormLabel>
                <FormControl>
                  <Input
                    variant="default"
                    placeholder="Ej: Q12345678"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Direcciones */}
        <GroupFormSection
          title="Direcciones de Origen y Destino"
          icon={MapPin}
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="origin_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Origen</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ej: Av. Principal 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectSearchForm<UbigeoResource>
            name="ubigeo_origin_id"
            label="Ubigeo de Origen"
            placeholder="Buscar ubigeo..."
            control={form.control}
            searchPlaceholder="Buscar por nombre o código..."
            emptyMessage="No se encontraron ubigeos"
            minSearchLength={2}
            debounceMs={300}
            items={originUbigeos}
            isSearching={isSearchingOrigin}
            onSearch={handleSearchOriginUbigeos}
            getItemId={(ubigeo) => ubigeo.id}
            formatLabel={formatUbigeoLabel}
            formatDescription={(ubigeo) => ubigeo.ubigeo_code}
          />

          <FormField
            control={form.control}
            name="destination_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Destino</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ej: Av. Secundaria 456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectSearchForm<UbigeoResource>
            name="ubigeo_destination_id"
            label="Ubigeo de Destino"
            placeholder="Buscar ubigeo..."
            control={form.control}
            searchPlaceholder="Buscar por nombre o código..."
            emptyMessage="No se encontraron ubigeos"
            minSearchLength={2}
            debounceMs={300}
            items={destinationUbigeos}
            isSearching={isSearchingDestination}
            onSearch={handleSearchDestinationUbigeos}
            getItemId={(ubigeo) => ubigeo.id}
            formatLabel={formatUbigeoLabel}
            formatDescription={(ubigeo) => ubigeo.ubigeo_code}
          />
        </GroupFormSection>

        {/* Información de Carga */}
        <GroupFormSection
          title="Información de Carga"
          icon={Truck}
          cols={{ sm: 1, md: 3 }}
        >
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
                <FormLabel>Peso Total</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    variant="default"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                <FormLabel>Total de Bultos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    variant="default"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Observaciones */}
        <div className="bg-sidebar p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Observaciones (Opcional)</h3>
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 w-full justify-end">
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
