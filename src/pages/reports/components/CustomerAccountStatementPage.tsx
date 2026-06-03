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
import { Printer, Search, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
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
import { getAllSalesFiltered } from "@/pages/sale/lib/sale.actions";
import { previewDeliverySheet } from "@/pages/deliverysheet/lib/deliverysheet.actions";

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

export default function CustomerAccountStatementPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: zones } = useAllZones();
  const { data: workers } = useAllWorkers();
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
  const _threeMonthsAgoStr = format(new Date(_today.getFullYear(), _today.getMonth() - 3, 1), "yyyy-MM-dd");

  const form = useForm<FilterFormValues>({
    defaultValues: {
      zone_id: "",
      customer_id: "",
      vendedor_id: "",
      payment_type: "ALL",
      start_date: _threeMonthsAgoStr,
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
      label: `${worker.names} ${worker.father_surname} ${worker.mother_surname}`,
    })) || [];

  const paymentTypeOptions: Option[] = [
    { value: "ALL", label: "Todos" },
    { value: "CONTADO", label: "Contado" },
    { value: "CREDITO", label: "Crédito" },
  ];

  const queryTypeOptions: Option[] = [
    { value: "todo", label: "Todo" },
    { value: "solo_deuda", label: "Solo Deudas" },
  ];

  const handleSearch = (values: FilterFormValues) => {
    const params: CustomerAccountStatementParams = {
      zone_id: values.zone_id ? Number(values.zone_id) : null,
      customer_id: values.customer_id ? Number(values.customer_id) : null,
      vendedor_id: values.vendedor_id ? Number(values.vendedor_id) : null,
      payment_type:
        values.payment_type === "ALL"
          ? null
          : (values.payment_type as "CONTADO" | "CREDITO"),
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      query_type: values.query_type as "solo_deuda" | "todo",
      show_old: values.show_old,
    };
    fetch(params);
  };

  const handleExport = async () => {
    const values = form.getValues();
    setIsExporting(true);
    const toastId = loadingToast("Generando planilla de reparto...");
    try {
      const paymentType =
        values.payment_type === "ALL"
          ? undefined
          : (values.payment_type as "CONTADO" | "CREDITO");

      const sales = await getAllSalesFiltered({
        customer_id: values.customer_id ? Number(values.customer_id) : undefined,
        vendedor_id: values.vendedor_id ? Number(values.vendedor_id) : undefined,
        payment_type: paymentType,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
      });

      const sale_ids = sales.map((s) => s.id);

      const blob = await previewDeliverySheet({
        type: paymentType ?? "CONTADO",
        zone_id: values.zone_id ? Number(values.zone_id) : undefined,
        sale_ids,
      });

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      successToast("Planilla generada exitosamente");
    } catch (error) {
      errorToast("Error al generar la planilla");
      console.error(error);
    } finally {
      dismissToast(toastId);
      setIsExporting(false);
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
                    description: customer.number_document ?? "-",
                  })}
                />
              </div>
              <Button type="submit" disabled={isLoading} size="sm">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
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
                  name="zone_id"
                  label="Zona"
                  placeholder="Seleccionar zona"
                  options={zoneOptions}
                />
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
                  name="payment_type"
                  label="Tipo de Pago"
                  placeholder="Seleccionar tipo"
                  options={paymentTypeOptions}
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
