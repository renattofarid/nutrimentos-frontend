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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deliverySheetSchemaCreate,
  type DeliverySheetSchema,
} from "../lib/deliverysheet.schema";
import { Loader, Search } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DELIVERY_SHEET_TYPES } from "../lib/deliverysheet.interface";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import type { AvailableSale } from "../lib/deliverysheet.interface";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Zone {
  id: number;
  code: string;
  name: string;
}

interface Driver {
  id: number;
  full_name: string;
  document_number: string | null;
}

interface Customer {
  id: number;
  full_name: string;
  document_number: string | null;
}

interface DeliverySheetFormProps {
  defaultValues: Partial<DeliverySheetSchema>;
  onSubmit: (data: DeliverySheetSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  branches: BranchResource[];
  zones: Zone[];
  drivers: Driver[];
  customers: Customer[];
  availableSales: AvailableSale[];
  onSearchSales: (params: {
    payment_type: string;
    zone_id?: number;
    date_from?: string;
    date_to?: string;
  }) => void;
  isLoadingAvailableSales: boolean;
}

export const DeliverySheetForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  branches,
  zones,
  drivers,
  customers,
  availableSales,
  onSearchSales,
  isLoadingAvailableSales,
}: DeliverySheetFormProps) => {
  const [selectedSaleIds, setSelectedSaleIds] = useState<number[]>(
    defaultValues.sale_ids || []
  );
  const [searchParams, setSearchParams] = useState({
    payment_type: "",
    zone_id: "",
    date_from: "",
    date_to: "",
  });

  const form = useForm<DeliverySheetSchema>({
    resolver: zodResolver(deliverySheetSchemaCreate),
    defaultValues: {
      branch_id: defaultValues.branch_id || "",
      zone_id: defaultValues.zone_id || "",
      driver_id: defaultValues.driver_id || "",
      customer_id: defaultValues.customer_id || "",
      type: defaultValues.type || "",
      issue_date: defaultValues.issue_date || new Date().toISOString().split("T")[0],
      delivery_date: defaultValues.delivery_date || "",
      sale_ids: defaultValues.sale_ids || [],
      observations: defaultValues.observations || "",
    },
  });

  const typeValue = form.watch("type");
  const zoneValue = form.watch("zone_id");

  const handleSearchSales = () => {
    if (!searchParams.payment_type) {
      return;
    }

    onSearchSales({
      payment_type: searchParams.payment_type,
      zone_id: searchParams.zone_id ? Number(searchParams.zone_id) : undefined,
      date_from: searchParams.date_from || undefined,
      date_to: searchParams.date_to || undefined,
    });
  };

  const handleToggleSale = (saleId: number) => {
    setSelectedSaleIds((prev) => {
      if (prev.includes(saleId)) {
        return prev.filter((id) => id !== saleId);
      }
      return [...prev, saleId];
    });
  };

  const handleToggleAll = () => {
    if (selectedSaleIds.length === availableSales.length) {
      setSelectedSaleIds([]);
    } else {
      setSelectedSaleIds(availableSales.map((sale) => sale.id));
    }
  };

  useEffect(() => {
    form.setValue("sale_ids", selectedSaleIds);
  }, [selectedSaleIds, form]);

  useEffect(() => {
    if (typeValue) {
      setSearchParams((prev) => ({ ...prev, payment_type: typeValue }));
    }
  }, [typeValue]);

  useEffect(() => {
    if (zoneValue) {
      setSearchParams((prev) => ({ ...prev, zone_id: zoneValue }));
    }
  }, [zoneValue]);

  const totalAmount = selectedSaleIds.reduce((sum, saleId) => {
    const sale = availableSales.find((s) => s.id === saleId);
    return sum + (sale ? parseFloat(sale.total_amount) : 0);
  }, 0);

  const handleFormSubmit = (data: DeliverySheetSchema) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <GroupFormSection
          title="Información General"
          description="Datos principales de la planilla de reparto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="branch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sucursal</FormLabel>
                  <FormControl>
                    <FormSelect
                      placeholder="Seleccione una sucursal"
                      items={branches.map((branch) => ({
                        value: branch.id.toString(),
                        label: branch.name,
                      }))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pago</FormLabel>
                  <FormControl>
                    <FormSelect
                      placeholder="Seleccione un tipo"
                      items={DELIVERY_SHEET_TYPES.map((type) => ({
                        value: type.value,
                        label: type.label,
                      }))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zone_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona</FormLabel>
                  <FormControl>
                    <FormSelect
                      placeholder="Seleccione una zona"
                      items={zones.map((zone) => ({
                        value: zone.id.toString(),
                        label: `${zone.name} (${zone.code})`,
                      }))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conductor</FormLabel>
                  <FormControl>
                    <FormSelect
                      placeholder="Seleccione un conductor"
                      items={drivers.map((driver) => ({
                        value: driver.id.toString(),
                        label: driver.full_name,
                      }))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente Cobrador</FormLabel>
                  <FormControl>
                    <FormSelect
                      placeholder="Seleccione un cliente"
                      items={customers.map((customer) => ({
                        value: customer.id.toString(),
                        label: customer.full_name,
                      }))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issue_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Emisión</FormLabel>
                  <FormControl>
                    <DatePickerFormField {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Entrega</FormLabel>
                  <FormControl>
                    <DatePickerFormField {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones adicionales..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        <GroupFormSection
          title="Buscar Ventas Disponibles"
          description="Busque ventas disponibles para agregar a la planilla"
        >
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Búsqueda</CardTitle>
              <CardDescription>
                Seleccione los criterios para buscar ventas disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Fecha Desde</label>
                  <input
                    type="date"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    value={searchParams.date_from}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        date_from: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha Hasta</label>
                  <input
                    type="date"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    value={searchParams.date_to}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        date_to: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSearchSales}
                disabled={!typeValue || isLoadingAvailableSales}
              >
                {isLoadingAvailableSales ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Buscar Ventas
              </Button>
            </CardContent>
          </Card>
        </GroupFormSection>

        {availableSales.length > 0 && (
          <GroupFormSection
            title="Ventas Disponibles"
            description={`Seleccione las ventas a incluir en la planilla (${selectedSaleIds.length} seleccionadas)`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleToggleAll}
                >
                  {selectedSaleIds.length === availableSales.length
                    ? "Deseleccionar Todas"
                    : "Seleccionar Todas"}
                </Button>
                <Badge variant="outline" className="text-lg">
                  Total: S/. {totalAmount.toFixed(2)}
                </Badge>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedSaleIds.length === availableSales.length &&
                            availableSales.length > 0
                          }
                          onCheckedChange={handleToggleAll}
                        />
                      </TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedSaleIds.includes(sale.id)}
                            onCheckedChange={() => handleToggleSale(sale.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {sale.document_type}
                            </span>
                            <span className="font-mono font-semibold">
                              {sale.serie}-{sale.numero}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {sale.customer.names} {sale.customer.father_surname}{" "}
                            {sale.customer.mother_surname}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {new Date(sale.issue_date).toLocaleDateString(
                              "es-ES"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          S/. {parseFloat(sale.total_amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </GroupFormSection>
        )}

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || selectedSaleIds.length === 0}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear Planilla" : "Actualizar Planilla"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
