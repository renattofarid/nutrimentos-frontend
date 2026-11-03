import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useCustomerAccountStatement } from "../lib/reports.hook";

import { DataTable } from "@/components/DataTable";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type {
  AccountStatementFlatRow,
  CustomerAccountStatementParams,
} from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useAllZones } from "@/pages/zone/lib/zone.hook";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Printer, FilePlus2, Search, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { format } from "date-fns";
import { FormSwitch } from "@/components/FormSwitch";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import type { Option } from "@/lib/core.interface";
import {
  flattenCustomerAccountStatementData,
  calculateAccountStatementMetrics,
} from "../lib/reports.utils";
import { errorToast, successToast, loadingToast, dismissToast } from "@/lib/core.function";
import {
  previewDeliverySheet,
  storeDeliverySheet,
  exportDeliverySheetById,
} from "@/pages/deliverysheet/lib/deliverysheet.actions";
import { api } from "@/lib/config";
import { DELIVERY_SHEET_ENDPOINT } from "@/pages/deliverysheet/lib/deliverysheet.interface";
import type { AvailableSalesResponse } from "@/pages/deliverysheet/lib/deliverysheet.interface";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "estado-cuenta-clientes";

export const CustomerAccountStatementTitle = "Estado de Cuenta de Clientes";

interface FilterFormValues {
  zone_id: string;
  customer_id: string;
  vendedor_id: string;
  payment_type: string;
  start_date: string;
  end_date: string;
  query_type: string;
  show_old: boolean;
}

function sortFlatRows(
  rows: AccountStatementFlatRow[],
  sorting: SortingState
): AccountStatementFlatRow[] {
  if (sorting.length === 0) return rows;
  const [{ id, desc }] = sorting;
  return [...rows].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[id];
    const bVal = (b as unknown as Record<string, unknown>)[id];
    if (aVal === bVal) return 0;
    if (aVal == null) return desc ? -1 : 1;
    if (bVal == null) return desc ? 1 : -1;
    const result = aVal < bVal ? -1 : 1;
    return desc ? -result : result;
  });
}

const columns: ColumnDef<AccountStatementFlatRow>[] = [
  {
    accessorKey: "zone_name",
    header: "Zona",
    size: 120,
    enableSorting: true,
    cell: ({ getValue }) => (
      <Badge color="blue" size="sm">
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    accessorKey: "vendedor_name",
    header: "Vendedor",
    size: 160,
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="font-medium text-sm">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Fecha Emisión",
    size: 120,
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "customer_name",
    header: "Cliente",
    size: 200,
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "document_number",
    header: "Documento",
    size: 140,
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Tipo Doc.",
    size: 100,
    cell: ({ getValue }) => (
      <Badge variant="outline" size="sm">
        {getValue<string>()}
      </Badge>
    ),
  },
  {
    accessorKey: "payment_type",
    header: "Forma Pago",
    size: 110,
    cell: ({ getValue }) => {
      const val = getValue<string>();
      return (
        <Badge color={val === "CREDITO" ? "orange" : "green"} size="sm">
          {val}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Monto Total",
    size: 120,
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="font-medium tabular-nums">
        S/ {Number(getValue<number>()).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "paid_amount",
    header: "Pagado",
    size: 110,
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="font-medium text-green-600 tabular-nums">
        S/ {Number(getValue<number>()).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "debt_amount",
    header: "Deuda",
    size: 110,
    enableSorting: true,
    cell: ({ getValue }) => {
      const val = Number(getValue<number>());
      return (
        <span
          className={`font-bold tabular-nums ${val > 0 ? "text-red-600" : "text-muted-foreground"}`}
        >
          S/ {val.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "days_overdue",
    header: "Días Atraso",
    size: 110,
    enableSorting: true,
    cell: ({ getValue }) => {
      const days = (getValue<number>() ?? 0);
      if (days === 0) {
        return <span className="text-muted-foreground text-xs">Al día</span>;
      }
      const color = days > 30 ? "red" : days > 15 ? "orange" : "purple";
      return (
        <Badge color={color} size="sm">
          {days} {days === 1 ? "día" : "días"}
        </Badge>
      );
    },
  },
];

function getCustomerDescription(customer: PersonResource): string {
  const zoneNames = new Set<string>();
  if (customer.zone_name) zoneNames.add(customer.zone_name);
  customer.person_zones?.forEach((pz) => {
    if (pz.zone_name) zoneNames.add(pz.zone_name);
  });
  const zones = zoneNames.size ? [...zoneNames].join(", ") : "Sin zona";
  return customer.number_document
    ? `${zones} - ${customer.number_document}`
    : zones;
}

type SheetType = "CONTADO" | "CREDITO";

async function fetchSalesForSheet(
  values: FilterFormValues,
  paymentType: "CONTADO" | "CREDITO",
) {
  const today = format(new Date(), "yyyy-MM-dd");
  const response = await api.get<AvailableSalesResponse>(
    `${DELIVERY_SHEET_ENDPOINT}/available-sales/list`,
    {
      params: {
        payment_type: paymentType,
        customer_id: values.customer_id ? Number(values.customer_id) : undefined,
        zone_id: values.zone_id ? Number(values.zone_id) : undefined,
        date_from: values.start_date || today,
        date_to: values.end_date || today,
      },
    },
  );
  const { data } = response.data;
  return data;
}

export default function CustomerAccountStatementPage() {
  const { can } = usePermission();
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmGenerateOpen, setConfirmGenerateOpen] = useState(false);
  const [typeChoice, setTypeChoice] = useState<{
    resolve: (type: SheetType | null) => void;
    contado: number;
    credito: number;
  } | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: zones } = useAllZones();
  const { data: workers } = useAllWorkers();
  const { data: branchesData } = useAllBranches();
  const branches = branchesData ?? [];
  const { data: rawData, isLoading, fetch } = useCustomerAccountStatement();

  const { flatRows, meta } = useMemo(() => {
    if (!rawData) return { flatRows: [] as AccountStatementFlatRow[], meta: null };
    return {
      flatRows: flattenCustomerAccountStatementData(rawData),
      meta: calculateAccountStatementMetrics(rawData),
    };
  }, [rawData]);

  const tableData = useMemo(
    () => sortFlatRows(flatRows, sorting),
    [flatRows, sorting]
  );

  const _today = new Date();
  const _todayStr = format(_today, "yyyy-MM-dd");
  const _defaultStartStr = format(new Date(_today.getFullYear(), _today.getMonth(), _today.getDate()), "yyyy-MM-dd");

  const form = useForm<FilterFormValues>({
    defaultValues: {
      zone_id: "",
      customer_id: "",
      vendedor_id: "",
      start_date: _defaultStartStr,
      end_date: _todayStr,
      query_type: "todo",
      show_old: false,
    },
  });

  const zoneOptions: Option[] =
    zones?.map((zone) => ({ value: zone.id.toString(), label: zone.name })) || [];

  const workerOptions: Option[] =
    workers?.map((worker) => ({
      value: worker.id.toString(),
      label: `${worker.names ?? ""} ${worker.father_surname ?? ""} ${worker.mother_surname ?? ""}`,
    })) || [];

  const queryTypeOptions: Option[] = [
    { value: "todo", label: "Todo" },
    { value: "solo_deuda", label: "Solo Deudas" },
  ];

  const handleSearch = (values: FilterFormValues) => {
    const params: CustomerAccountStatementParams = {
      zone_id: values.zone_id ? Number(values.zone_id) : null,
      customer_id: values.customer_id ? Number(values.customer_id) : null,
      vendedor_id: values.vendedor_id ? Number(values.vendedor_id) : null,
      payment_type: null,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      query_type: values.query_type as "solo_deuda" | "todo",
      show_old: values.show_old,
    };
    fetch(params);
  };

  // Las ventas salen de lo que se ve en la tabla (ya filtrado por cliente,
  // zona, etc.) y solo entran las que siguen disponibles para una planilla.
  // El tipo (contado/crédito) se toma de cada venta, no de un filtro. Si hay
  // ventas de ambos tipos se le pide al usuario cuál planilla generar.
  const pickSalesForSheet = async (values: FilterFormValues) => {
    const [contadoAvail, creditoAvail] = await Promise.all([
      fetchSalesForSheet(values, "CONTADO"),
      fetchSalesForSheet(values, "CREDITO"),
    ]);
    const available = new Set(
      [...contadoAvail, ...creditoAvail].map((s) => s.id),
    );

    const byType: Record<SheetType, number[]> = { CONTADO: [], CREDITO: [] };
    const seen = new Set<number>();
    for (const row of flatRows) {
      if (!available.has(row.sale_id) || seen.has(row.sale_id)) continue;
      seen.add(row.sale_id);
      byType[row.payment_type === "CREDITO" ? "CREDITO" : "CONTADO"].push(
        row.sale_id,
      );
    }

    let type: SheetType;
    if (byType.CONTADO.length > 0 && byType.CREDITO.length > 0) {
      const chosen = await new Promise<SheetType | null>((resolve) =>
        setTypeChoice({
          resolve,
          contado: byType.CONTADO.length,
          credito: byType.CREDITO.length,
        }),
      );
      setTypeChoice(null);
      if (!chosen) return null;
      type = chosen;
    } else {
      type = byType.CREDITO.length > 0 ? "CREDITO" : "CONTADO";
    }
    return { type, saleIds: byType[type] };
  };

  const handleExport = async () => {
    const values = form.getValues();
    if (flatRows.length === 0) {
      errorToast("Primero realice la búsqueda para generar la planilla");
      return;
    }
    setIsExporting(true);
    try {
      const picked = await pickSalesForSheet(values);
      if (!picked) return;
      if (picked.saleIds.length === 0) {
        errorToast("No hay ventas para generar la planilla con los filtros actuales");
        return;
      }

      const toastId = loadingToast("Generando planilla de reparto...");
      try {
        const blob = await previewDeliverySheet({
          type: picked.type,
          zone_id: values.zone_id ? Number(values.zone_id) : undefined,
          sale_ids: picked.saleIds,
        });
        window.open(URL.createObjectURL(blob), "_blank");
        successToast("Planilla generada exitosamente");
      } finally {
        dismissToast(toastId);
      }
    } catch (error) {
      errorToast("Error al generar la planilla");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerate = async () => {
    const values = form.getValues();

    if (branches.length === 0) {
      errorToast("No se encontró una sucursal para generar la planilla");
      return;
    }

    if (flatRows.length === 0) {
      errorToast("Primero realice la búsqueda para generar la planilla");
      return;
    }

    setIsGenerating(true);
    try {
      const picked = await pickSalesForSheet(values);
      if (!picked) return;
      if (picked.saleIds.length === 0) {
        errorToast("No hay ventas para generar la planilla con los filtros actuales");
        return;
      }

      const toastId = loadingToast("Generando planilla...");
      try {
        const created = await storeDeliverySheet({
          branch_id: branches[0].id,
          zone_id: values.zone_id ? Number(values.zone_id) : undefined,
          customer_id: values.customer_id ? Number(values.customer_id) : undefined,
          type: picked.type,
          issue_date: format(new Date(), "yyyy-MM-dd"),
          sale_ids: picked.saleIds,
        });
        successToast("Planilla generada exitosamente");
        try {
          const blob = await exportDeliverySheetById(created.data.id);
          window.open(URL.createObjectURL(blob), "_blank");
        } catch (pdfError) {
          errorToast("La planilla se creó, pero no se pudo abrir el PDF");
          console.error(pdfError);
        }
      } finally {
        dismissToast(toastId);
      }
    } catch (error) {
      errorToast("Error al generar la planilla");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const tableFooter =
    meta && flatRows.length > 0 ? (
      <TableRow className="font-bold text-sm bg-muted/80 hover:bg-muted/80">
        <TableCell colSpan={7} className="text-right pr-4 text-muted-foreground">
          TOTALES — {flatRows.length} registros
        </TableCell>
        <TableCell className="tabular-nums">
          S/ {meta.total_debt.toFixed(2)}
        </TableCell>
        <TableCell className="text-green-700 tabular-nums">
          S/ {meta.total_paid.toFixed(2)}
        </TableCell>
        <TableCell className="text-red-700 tabular-nums">
          S/ {meta.total_pending.toFixed(2)}
        </TableCell>
        <TableCell />
      </TableRow>
    ) : undefined;

  return (
    <PageWrapper size="3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
          {/* Filtros */}
          <div className="space-y-3">
            <div className="flex items-end gap-2 flex-wrap">
              <div className="flex-1 min-w-[200px] max-w-sm">
                <FormSelectAsync
                  control={form.control}
                  name="customer_id"
                  label="Cliente"
                  placeholder="Seleccione un cliente"
                  useQueryHook={useClients}
                  mapOptionFn={(customer: PersonResource) => ({
                    value: customer.id.toString(),
                    label:
                      customer.business_name ??
                      `${customer.names ?? ""} ${customer.father_surname ?? ""} ${customer.mother_surname ?? ""}`.trim(),
                    description: getCustomerDescription(customer),
                  })}
                />
              </div>
              <div className="w-48">
                <FormSelect
                  control={form.control}
                  name="zone_id"
                  label="Zona"
                  placeholder="Seleccionar zona"
                  options={zoneOptions}
                />
              </div>
              <Button type="submit" disabled={isLoading} size="sm">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              {can(ROUTE, ACTIONS.EXPORTAR) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              )}
              {can(ROUTE, ACTIONS.EXPORTAR) && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setConfirmGenerateOpen(true)}
                    disabled={isGenerating}
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Generar planilla
                  </Button>
                  <ConfirmationDialog
                    open={confirmGenerateOpen}
                    onOpenChange={setConfirmGenerateOpen}
                    title="Generar planilla"
                    description="Se creará una planilla de reparto con las ventas que coinciden con los filtros actuales. ¿Desea continuar?"
                    confirmText="Sí, generar"
                    cancelText="Cancelar"
                    icon="info"
                    onConfirm={handleGenerate}
                  />
                  <Dialog
                    open={!!typeChoice}
                    onOpenChange={(open) => {
                      if (!open) typeChoice?.resolve(null);
                    }}
                  >
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>¿Qué planilla desea generar?</DialogTitle>
                        <DialogDescription>
                          Hay ventas de contado y de crédito. Elija el tipo de
                          planilla a generar.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => typeChoice?.resolve("CONTADO")}
                        >
                          Contado ({typeChoice?.contado})
                        </Button>
                        <Button
                          type="button"
                          onClick={() => typeChoice?.resolve("CREDITO")}
                        >
                          Crédito ({typeChoice?.credito})
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMoreFilters((v) => !v)}
              >
                {showMoreFilters ? (
                  <ChevronUp className="mr-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="mr-1 h-4 w-4" />
                )}
                {showMoreFilters ? "Menos filtros" : "Más filtros"}
              </Button>
            </div>

            {showMoreFilters && (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                <FormSelect
                  control={form.control}
                  name="vendedor_id"
                  label="Vendedor"
                  placeholder="Seleccionar vendedor"
                  options={workerOptions}
                />
                <DatePickerFormField
                  control={form.control}
                  name="start_date"
                  label="Del"
                />
                <DatePickerFormField
                  control={form.control}
                  name="end_date"
                  label="Al"
                />
                <FormSelect
                  control={form.control}
                  name="query_type"
                  label="Tipo de Consulta"
                  placeholder="Seleccionar tipo"
                  options={queryTypeOptions}
                />
                <div className="col-span-2">
                  <FormSwitch
                    control={form.control}
                    name="show_old"
                    label="Mostrar antiguos"
                    text="Incluir registros antiguos en la consulta"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cards resumen */}
          {meta && (
            <GroupFormSection
              title="Resumen de Cuentas"
              icon={DollarSign}
              cols={{ sm: 1, md: 2, lg: 4 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{meta.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monto Facturado</p>
                <p className="text-2xl font-bold">
                  S/ {meta.total_debt?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Deuda</p>
                <p className="text-2xl font-bold text-red-600">
                  S/ {meta.total_pending?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">
                  S/ {meta.total_paid?.toFixed(2) || "0.00"}
                </p>
              </div>
            </GroupFormSection>
          )}

          {/* Tabla plana */}
          <DataTable
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            sorting={sorting}
            onSortingChange={setSorting}
            footer={tableFooter}
          />
        </form>
      </Form>
    </PageWrapper>
  );
}
