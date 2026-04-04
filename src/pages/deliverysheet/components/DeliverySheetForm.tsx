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
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  ListX,
  Eye,
  Save,
  List,
} from "lucide-react";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { FormSelect } from "@/components/FormSelect";
import { useState, useEffect, useMemo } from "react";
import { format, parse } from "date-fns";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
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
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { ZoneResource } from "@/pages/zone/lib/zone.interface";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";
import { FormTextArea } from "@/components/FormTextArea";
import { EmptyState } from "@/components/EmptyState";

interface DeliverySheetFormProps {
  defaultValues: Partial<DeliverySheetSchema>;
  onSubmit: (data: DeliverySheetSchema) => void;
  formId?: string;
  showHeaderActions?: boolean;
  onCancel?: () => void;
  onPreview?: (data: DeliverySheetSchema) => void;
  isSubmitting?: boolean;
  isPreviewing?: boolean;
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
  formId,
  showHeaderActions = true,
  onPreview,
  isSubmitting = false,
  isPreviewing = false,
  mode = "create",
  branches,
  zones,
  availableSales,
  onSearchSales,
  isLoadingAvailableSales,
}: DeliverySheetFormProps) => {
  const user = useAuthStore((state) => state.user);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Auto-buscar ventas del día al seleccionar zona o cliente
  useEffect(() => {
    const targetId = forSingleCustomer ? customerValue : zoneValue;
    if (!typeValue || !targetId) return;

    const today = format(new Date(), "yyyy-MM-dd");
    setHasSearched(true);
    onSearchSales({
      payment_type: typeValue,
      zone_id: !forSingleCustomer && zoneValue ? Number(zoneValue) : undefined,
      customer_id:
        forSingleCustomer && customerValue ? Number(customerValue) : undefined,
      date_from: today,
      date_to: today,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneValue, customerValue, forSingleCustomer, typeValue]);

  const selectedSales = useMemo(
    () => availableSales.filter((sale) => selectedSaleIds.includes(sale.id)),
    [availableSales, selectedSaleIds],
  );

  const salesWithCreditNotes = selectedSales.filter(
    (sale) => !!sale.credit_notes?.length,
  ).length;

  const saleColumns = useMemo<ColumnDef<AvailableSale>[]>(
    () => [
      {
        id: "selected",
        header: () => (
          <Checkbox
            checked={
              selectedSaleIds.length === availableSales.length &&
              availableSales.length > 0
            }
            onCheckedChange={handleToggleAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedSaleIds.includes(row.original.id)}
            onCheckedChange={() => handleToggleSale(row.original.id)}
          />
        ),
        enableSorting: false,
      },
      {
        id: "vendedor",
        header: "Vendedor",
        cell: ({ row }) => {
          const vendedor = row.original.vendedor;
          return vendedor
            ? `${vendedor.names} ${vendedor.father_surname} ${vendedor.mother_surname}`
            : "-";
        },
      },
      {
        id: "fecha",
        header: "Fecha",
        cell: ({ row }) => (
          <Badge variant="outline">
            {format(
              parse(
                row.original.issue_date.split("T")[0],
                "yyyy-MM-dd",
                new Date(),
              ),
              "dd/MM/yyyy",
            )}
          </Badge>
        ),
      },
      {
        id: "cliente",
        header: "Cliente",
        cell: ({ row }) =>
          row.original.customer.business_name ??
          `${row.original.customer.names} ${row.original.customer.father_surname} ${row.original.customer.mother_surname}`,
      },
      {
        id: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            S/. {parseFormattedNumber(row.original.total_amount).toFixed(2)}
          </span>
        ),
      },
      {
        id: "nota_credito",
        header: "Nota de Crédito",
        cell: ({ row }) => {
          if (!row.original.credit_notes?.length) {
            return (
              <Badge variant="default" color="muted">
                SIN NOTA
              </Badge>
            );
          }

          const creditTotal = row.original.credit_notes
            .reduce((sum, cn) => sum + parseFormattedNumber(cn.total_amount), 0)
            .toFixed(2);

          return (
            <div className="flex gap-1 items-center">
              <Badge size="default" color="orange">
                S/. {creditTotal}
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="xs"
                color="orange"
                onClick={() =>
                  setCreditNotesModal({
                    open: true,
                    creditNotes: row.original.credit_notes!,
                    saleName: `${row.original.serie}-${row.original.numero}`,
                  })
                }
              >
                <ListX className="h-3 w-3 mr-1" />
                Detalles
              </Button>
            </div>
          );
        },
      },
      {
        id: "monto_pendiente",
        header: "Monto Pendiente",
        cell: ({ row }) => (
          <span className="font-bold">
            S/. {parseFormattedNumber(row.original.current_amount).toFixed(2)}
          </span>
        ),
      },
      {
        id: "documento",
        header: "Documento",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {row.original.document_type}
            </span>
            <span className="font-mono font-semibold">
              {row.original.serie}-{row.original.numero}
            </span>
          </div>
        ),
      },
    ],
    [availableSales.length, selectedSaleIds],
  );

  const handleFormSubmit = (data: DeliverySheetSchema) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="grid grid-cols-1 gap-4"
      >
        {showHeaderActions && (
          <div className="flex items-center gap-4 col-span-full">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                <X />
                Cancelar
              </Button>
            )}
            {onPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPreviewing || selectedSaleIds.length === 0}
                onClick={() => onPreview(form.getValues())}
              >
                {isPreviewing ? <Loader className="animate-spin" /> : <Eye />}
                Ver Planilla
              </Button>
            )}
            <Button
              size="sm"
              type="submit"
              disabled={isSubmitting || selectedSaleIds.length === 0}
            >
              {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
              {mode === "create" ? "Guardar Planilla" : "Actualizar Planilla"}
            </Button>
          </div>
        )}

        <GroupFormSection
          className="col-span-full xl:max-w-5xl"
          title="Datos de la Planilla"
          icon={Info}
          cols={{
            sm: 1,
            md: 1,
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

          <div className="rounded-lg border bg-muted/20 p-3 space-y-3 h-fit">
            <div className="flex flex-wrap gap-2 items-center justify-end">
              {isLoadingAvailableSales && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader className="h-3 w-3 animate-spin" />
                  Buscando ventas...
                </span>
              )}
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
              {showDateFilter && (
                <Button
                  type="button"
                  onClick={handleSearchSales}
                  disabled={
                    !searchParams.payment_type || isLoadingAvailableSales
                  }
                  size="sm"
                >
                  {isLoadingAvailableSales ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Buscar
                </Button>
              )}
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
              className="col-span-full"
            />
          )}

        {availableSales.length > 0 && (
          <GroupFormSection
            className="col-span-full"
            title={`Ventas Disponibles (${selectedSaleIds.length} seleccionadas)`}
            icon={List}
            cols={{ sm: 1 }}
          >
            <div className="space-y-4">
              <DataTable
                columns={saleColumns}
                data={availableSales}
                variant="outline"
                isVisibleColumnFilter={false}
                mobileCardRender={(sale) => {
                  const hasCreditNotes = !!sale.credit_notes?.length;
                  const creditNoteAmount = hasCreditNotes
                    ? sale.credit_notes!
                        .reduce(
                          (sum, cn) => sum + parseFormattedNumber(cn.total_amount),
                          0,
                        )
                        .toFixed(2)
                    : "0.00";

                  return (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold">
                          {sale.serie}-{sale.numero}
                        </span>
                        <Checkbox
                          checked={selectedSaleIds.includes(sale.id)}
                          onCheckedChange={() => handleToggleSale(sale.id)}
                        />
                      </div>
                      <div className="text-muted-foreground">
                        {sale.customer.business_name ??
                          `${sale.customer.names} ${sale.customer.father_surname} ${sale.customer.mother_surname}`}
                      </div>
                      <div className="flex items-center justify-between">
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
                        <span className="font-semibold">
                          S/. {parseFormattedNumber(sale.current_amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Notas crédito</span>
                        <span>S/. {creditNoteAmount}</span>
                      </div>
                    </div>
                  );
                }}
              >
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
              </DataTable>

              <div className="flex items-center justify-start rounded-md border px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Resumen:</span>
                <span className="mx-2">{selectedSaleIds.length} seleccionadas</span>
                <span className="mx-2">•</span>
                <span>{salesWithCreditNotes} con nota de crédito</span>
              </div>
            </div>
          </GroupFormSection>
        )}

        <div className="col-span-full text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{user?.name}</span>
          <span className="mx-2">·</span>
          <span>{format(now, "dd/MM/yyyy HH:mm:ss")}</span>
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
