"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  deliverySheetSchemaCreate,
  type DeliverySheetSchema,
} from "../lib/deliverysheet.schema";
import {
  Loader,
  Search,
  SearchX,
  Info,
  List,
  ChevronDown,
  ChevronUp,
  Calendar,
  ListX,
} from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { FormSelect } from "@/components/FormSelect";
import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DELIVERY_SHEET_TYPES } from "../lib/deliverysheet.interface";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { BranchResource } from "@/pages/branch/lib/branch.interface";
import type { AvailableSale } from "../lib/deliverysheet.interface";
import type { CreditNoteResource } from "@/pages/credit-note/lib/credit-note.interface";
import { GeneralModal } from "@/components/GeneralModal";
import { parseFormattedNumber } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ZoneResource } from "@/pages/zone/lib/zone.interface";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";
import { FormTextArea } from "@/components/FormTextArea";
import { EmptyState } from "@/components/EmptyState";

interface DeliverySheetFormProps {
  defaultValues: Partial<DeliverySheetSchema>;
  onSubmit: (data: DeliverySheetSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  branches: BranchResource[];
  zones: ZoneResource[];
  availableSales: AvailableSale[];
  onSearchSales: (params: {
    payment_type: string;
    zone_id?: number;
    customer_id?: number;
    person_zone_id?: number;
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
  availableSales,
  onSearchSales,
  isLoadingAvailableSales,
}: DeliverySheetFormProps) => {
  const [selectedSaleIds, setSelectedSaleIds] = useState<number[]>(
    defaultValues.sale_ids || [],
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [creditNotesModal, setCreditNotesModal] = useState<{
    open: boolean;
    creditNotes: CreditNoteResource[];
    saleName: string;
  }>({ open: false, creditNotes: [], saleName: "" });
  const [searchParams, setSearchParams] = useState({
    payment_type: "",
    zone_id: "",
    customer_id: "",
    person_zone_id: "",
    date_from: new Date() as Date | undefined,
    date_to: new Date() as Date | undefined,
  });

  const form = useForm<DeliverySheetSchema>({
    resolver: zodResolver(deliverySheetSchemaCreate) as any,
    defaultValues: {
      branch_id:
        defaultValues.branch_id ||
        (branches.length > 0 ? branches[0].id.toString() : ""),
      zone_id: defaultValues.zone_id || "",
      customer_id: defaultValues.customer_id || "",
      type: defaultValues.type || "CONTADO",
      issue_date: defaultValues.issue_date,
      sale_ids: defaultValues.sale_ids || [],
      observations: defaultValues.observations || "",
      for_single_customer: defaultValues.for_single_customer ?? false,
    },
  });

  const typeValue = form.watch("type");
  const zoneValue = form.watch("zone_id");
  const customerValue = form.watch("customer_id");
  const forSingleCustomer = form.watch("for_single_customer");

  const handleSearchSales = () => {
    if (!searchParams.payment_type) {
      return;
    }

    setHasSearched(true);
    onSearchSales({
      payment_type: searchParams.payment_type,
      zone_id: searchParams.zone_id ? Number(searchParams.zone_id) : undefined,
      customer_id: searchParams.customer_id
        ? Number(searchParams.customer_id)
        : undefined,
      person_zone_id: searchParams.person_zone_id
        ? Number(searchParams.person_zone_id)
        : undefined,
      date_from: searchParams.date_from
        ? format(searchParams.date_from, "yyyy-MM-dd")
        : undefined,
      date_to: searchParams.date_to
        ? format(searchParams.date_to, "yyyy-MM-dd")
        : undefined,
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
    if (availableSales.length > 0) {
      setSelectedSaleIds(availableSales.map((sale) => sale.id));
    }
  }, [availableSales]);

  useEffect(() => {
    if (branches.length > 0 && !form.getValues("branch_id")) {
      form.setValue("branch_id", branches[0].id.toString());
    }
  }, [branches, form]);

  useEffect(() => {
    if (typeValue) {
      setSearchParams((prev) => ({ ...prev, payment_type: typeValue }));
    }
  }, [typeValue]);

  useEffect(() => {
    if (forSingleCustomer) {
      // Si es cliente único, limpiar zona y sincronizar customer_id
      form.setValue("zone_id", "");
      setSearchParams((prev) => ({
        ...prev,
        zone_id: "",
        customer_id: customerValue || "",
      }));
    } else {
      // Si es multi-cliente, limpiar cliente y sincronizar zone_id
      form.setValue("customer_id", "");
      setSearchParams((prev) => ({
        ...prev,
        customer_id: "",
        zone_id: zoneValue || "",
      }));
    }
  }, [forSingleCustomer, zoneValue, customerValue, form]);

  const totalAmount = selectedSaleIds.reduce((sum, saleId) => {
    const sale = availableSales.find((s) => s.id === saleId);
    return sum + (sale ? parseFormattedNumber(sale.total_amount) : 0);
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
          icon={Info}
          cols={{
            sm: 1,
            md: 2,
            lg: 3,
          }}
        >
          <FormSelect
            control={form.control}
            name="type"
            label="Tipo de Pago"
            placeholder="Seleccione un tipo"
            options={DELIVERY_SHEET_TYPES.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
          />

          {forSingleCustomer ? (
            <FormSelectAsync
              control={form.control}
              name="customer_id"
              label="Cliente"
              placeholder="Seleccione un cliente"
              useQueryHook={useClients}
              mapOptionFn={(customer) => ({
                value: customer.id.toString(),
                label: customer.names ?? customer.business_name,
              })}
            />
          ) : (
            <FormSelect
              control={form.control}
              name="zone_id"
              label="Zona"
              placeholder="Seleccione una zona"
              options={zones.map((zone) => ({
                value: zone.id.toString(),
                label: `${zone.name} (${zone.code})`,
              }))}
            />
          )}

          <div className="col-span-full">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1 px-0 hover:bg-transparent"
              onClick={() => setShowMoreFields(!showMoreFields)}
            >
              {showMoreFields ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showMoreFields ? "Menos opciones" : "Más opciones"}
            </Button>
          </div>

          {showMoreFields && (
            <>
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

              <DatePickerFormField
                control={form.control}
                name="issue_date"
                label="Fecha de Emisión"
                placeholder="Seleccione la fecha de emisión"
                dateFormat="dd/MM/yyyy"
              />

              <div className="col-span-full">
                <FormTextArea
                  control={form.control}
                  name="observations"
                  label="Observaciones"
                  placeholder="Ingrese observaciones (opcional)"
                />
              </div>
            </>
          )}
        </GroupFormSection>

        <GroupFormSection
          title="Buscar Ventas Disponibles"
          icon={Search}
          cols={{ sm: 1 }}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1"
                onClick={() => setShowDateFilter(!showDateFilter)}
              >
                <Calendar className="h-4 w-4" />
                Filtrar por fecha
                {showDateFilter ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                onClick={handleSearchSales}
                disabled={!searchParams.payment_type || isLoadingAvailableSales}
                size="sm"
              >
                {isLoadingAvailableSales ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Buscar Ventas
              </Button>
            </div>
            {showDateFilter && (
              <DateRangePickerFilter
                dateFrom={searchParams.date_from}
                dateTo={searchParams.date_to}
                onDateChange={(dateFrom, dateTo) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    date_from: dateFrom,
                    date_to: dateTo,
                  }))
                }
              />
            )}
          </div>
        </GroupFormSection>

        {hasSearched &&
          !isLoadingAvailableSales &&
          availableSales.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="Sin resultados"
              description="No se encontraron ventas disponibles con los filtros seleccionados."
            />
          )}

        {availableSales.length > 0 && (
          <GroupFormSection
            title={`Ventas Disponibles (${selectedSaleIds.length} seleccionadas)`}
            icon={List}
            cols={{ sm: 1 }}
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
                <Badge
                  color="green"
                  className="text-lg flex flex-col items-end"
                >
                  <span className="text-green-950 text-xs">TOTAL</span>
                  <span>S/. {totalAmount.toFixed(2)}</span>
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
                      <TableHead>Nota de Crédito</TableHead>
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
                          {sale.customer.business_name ??
                            `${sale.customer.names} ${sale.customer.father_surname} ${sale.customer.mother_surname}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {format(
                              parse(
                                sale.issue_date.split("T")[0],
                                "yyyy-MM-dd",
                                new Date(),
                              ),
                              "dd/MM/yyyy",
                            )}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {sale.credit_notes && sale.credit_notes.length > 0 ? (
                            <div className="flex gap-1">
                              <Badge size="default" color="orange">
                                S/.{" "}
                                {sale.credit_notes
                                  .reduce(
                                    (sum, cn) =>
                                      sum +
                                      parseFormattedNumber(cn.total_amount),
                                    0,
                                  )
                                  .toFixed(2)}
                              </Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                color="orange"
                                onClick={() =>
                                  setCreditNotesModal({
                                    open: true,
                                    creditNotes: sale.credit_notes!,
                                    saleName: `${sale.serie}-${sale.numero}`,
                                  })
                                }
                              >
                                <ListX className="h-3 w-3 mr-1" />
                                Detalles
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="default" color="muted">
                              SIN NOTA
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          S/.{" "}
                          {parseFormattedNumber(sale.total_amount).toFixed(2)}
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button
            size="sm"
            type="submit"
            disabled={isSubmitting || selectedSaleIds.length === 0}
          >
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear Planilla" : "Actualizar Planilla"}
          </Button>
        </div>
      </form>

      <GeneralModal
        open={creditNotesModal.open}
        onClose={() =>
          setCreditNotesModal((prev) => ({ ...prev, open: false }))
        }
        title="Notas de Crédito"
        subtitle={`Venta: ${creditNotesModal.saleName}`}
        icon="FileText"
        size="2xl"
      >
        <div className="space-y-3">
          <div className="flex justify-end">
            <Badge color="destructive" className="text-base">
              Total: S/.{" "}
              {creditNotesModal.creditNotes
                .reduce(
                  (sum, cn) => sum + parseFormattedNumber(cn.total_amount),
                  0,
                )
                .toFixed(2)}
            </Badge>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditNotesModal.creditNotes.map((cn) => (
                  <TableRow key={cn.id}>
                    <TableCell>
                      <span className="font-mono font-semibold">
                        {cn.full_document_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {format(
                          parse(
                            cn.issue_date.split("T")[0],
                            "yyyy-MM-dd",
                            new Date(),
                          ),
                          "dd/MM/yyyy",
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {cn.reason}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cn.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      S/. {parseFormattedNumber(cn.total_amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </GeneralModal>
    </Form>
  );
};
