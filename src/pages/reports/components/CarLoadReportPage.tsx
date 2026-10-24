import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
  useCarLoadReport,
  useZonesToday,
  useBranchAsyncSearch,
} from "../lib/reports.hook";

import type { CarLoadReportParams } from "../lib/reports.interface";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Search } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { exportCarLoadReport } from "../lib/reports.actions";
import ExportButtons from "@/components/ExportButtons";
import { DataTable } from "@/components/DataTable";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "llenado-carros";

interface FilterFormValues {
  branch_id: string;
  date_from: Date | string;
  date_to: Date | string;
}

interface ZoneOption {
  label: string;
  value: string;
  code: string;
}

const today = new Date();

type PeriodValue = "today" | "yesterday" | "week" | "month" | "custom";

const PERIOD_OPTIONS: { label: string; value: PeriodValue }[] = [
  { label: "Hoy", value: "today" },
  { label: "Ayer", value: "yesterday" },
  { label: "Semana", value: "week" },
  { label: "Mes", value: "month" },
  { label: "Personalizado", value: "custom" },
];

function getPeriodRange(period: PeriodValue): { from: Date; to: Date } | null {
  const now = new Date();
  switch (period) {
    case "today":
      return { from: now, to: now };
    case "yesterday": {
      const y = subDays(now, 1);
      return { from: y, to: y };
    }
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
    case "month":
      return { from: startOfMonth(now), to: now };
    default:
      return null;
  }
}

function formatDateParam(v: Date | string | undefined | null): string | null {
  if (!v) return null;
  if (v instanceof Date) return format(v, "yyyy-MM-dd");
  return v || null;
}

export default function CarLoadReportPage() {
  const { can } = usePermission();
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [period, setPeriod] = useState<PeriodValue>("today");
  const isZoneAutoSelectRef = useRef(false);

  const { data: rawData, isLoading, fetch } = useCarLoadReport();

  const form = useForm<FilterFormValues>({
    defaultValues: {
      branch_id: "1",
      date_from: today,
      date_to: today,
    },
  });

  const handlePeriodChange = (value: PeriodValue) => {
    setPeriod(value);
    const range = getPeriodRange(value);
    if (!range) return;
    form.setValue("date_from", range.from);
    form.setValue("date_to", range.to);
  };

  const watchedDateFrom = form.watch("date_from");
  const watchedDateTo = form.watch("date_to");

  const { data: zonesData } = useZonesToday({
    date_from: formatDateParam(watchedDateFrom),
    date_to: formatDateParam(watchedDateTo),
  });

  const zoneOptions: ZoneOption[] = (
    (zonesData?.data ?? []) as {
      zone_id: number;
      zone_name: string;
      zone_code?: string;
      sigla?: string;
    }[]
  ).map((z) => ({
    label: z.zone_name,
    value: String(z.zone_id),
    code: z.zone_code ?? z.sigla ?? "-",
  }));

  const buildParams = (
    values: FilterFormValues,
    zones: string[],
  ): CarLoadReportParams => ({
    zone_ids: zones.map(Number),
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    date_from: formatDateParam(values.date_from),
    date_to: formatDateParam(values.date_to),
  });

  // Cuando cambian las zonas del API (nuevo rango de fechas), seleccionar todas
  useEffect(() => {
    if (zoneOptions.length === 0) return;
    isZoneAutoSelectRef.current = true;
    setSelectedZones(zoneOptions.map((z) => z.value));
  }, [zonesData]);

  // Cuando cambia la selección de zonas, re-fetchar el reporte
  useEffect(() => {
    if (selectedZones.length === 0) return;
    if (isZoneAutoSelectRef.current) {
      isZoneAutoSelectRef.current = false;
    }
    const timer = setTimeout(() => {
      fetch(buildParams(form.getValues(), selectedZones));
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedZones]);

  const handleSearch = (values: FilterFormValues) => {
    fetch(buildParams(values, selectedZones));
  };

  const handleExportPdf = async () => {
    const values = form.getValues();
    const blob = await exportCarLoadReport(
      buildParams(values, selectedZones),
      "pdf",
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte-llenado-carros.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const toggleZone = (value: string) => {
    setSelectedZones((prev) =>
      prev.includes(value) ? prev.filter((z) => z !== value) : [...prev, value],
    );
  };

  const displayedZones = rawData ? zoneOptions : [];

  const zoneColumns = useMemo<ColumnDef<ZoneOption>[]>(
    () => [
      // {
      //   accessorKey: "code",
      //   header: "Sigla",
      // },
      {
        accessorKey: "label",
        header: "Nombre",
      },
      {
        id: "selector",
        header: () => <span className="block text-center">Sel.</span>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={selectedZones.includes(row.original.value)}
              onCheckedChange={() => toggleZone(row.original.value)}
            />
          </div>
        ),
        enableSorting: false,
      },
    ],
    [selectedZones],
  );

  return (
    <PageWrapper size="3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-end justify-start gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <FormSelectAsync
                control={form.control}
                name="branch_id"
                label="Tienda"
                placeholder="Buscar tienda..."
                useQueryHook={useBranchAsyncSearch}
                mapOptionFn={(item) => ({
                  label: item.name,
                  value: String(item.id),
                })}
              />
              <div className="flex flex-col gap-0.5">
                <Label className="font-bold uppercase">Fecha</Label>
                <Select
                  value={period}
                  onValueChange={(v) => handlePeriodChange(v as PeriodValue)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {period === "custom" && (
                <>
                  <DatePickerFormField
                    control={form.control}
                    name="date_from"
                    label="Desde"
                    placeholder="Fecha inicio"
                  />
                  <DatePickerFormField
                    control={form.control}
                    name="date_to"
                    label="Hasta"
                    placeholder="Fecha fin"
                  />
                </>
              )}
            </div>
            <div className="flex gap-2 pb-0.5">
              <Button type="submit" disabled={isLoading} size="sm">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              {can(ROUTE, ACTIONS.EXPORTAR) && (
                <ExportButtons
                  onPdfDownload={handleExportPdf}
                  pdfLabel="Imprimir"
                />
              )}
            </div>
          </div>

          {/* Zonas */}
          <div className="flex items-start justify-start">
            <div className="w-full md:w-[420px]">
              <DataTable
                columns={zoneColumns}
                data={displayedZones}
                isLoading={false}
                isVisibleColumnFilter={false}
                onRowClick={(zone) => toggleZone(zone.value)}
              />
              {displayedZones.length > 0 && (
                <p className="text-xs text-muted-foreground pt-2">
                  {
                    selectedZones.filter((id) =>
                      displayedZones.some((z) => z.value === id),
                    ).length
                  }
                  /{displayedZones.length} seleccionadas
                </p>
              )}
            </div>
          </div>
        </form>
      </Form>
    </PageWrapper>
  );
}
