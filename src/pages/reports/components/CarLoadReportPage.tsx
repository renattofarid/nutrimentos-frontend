import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import {
  useCarLoadReport,
  useZonesToday,
  useBranchAsyncSearch,
} from "../lib/reports.hook";

import type { CarLoadReportParams } from "../lib/reports.interface";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Search, Filter } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportCarLoadReport } from "../lib/reports.actions";
import ExportButtons from "@/components/ExportButtons";

import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";

interface FilterFormValues {
  branch_id: string;
  date_from: Date | string;
  date_to: Date | string;
}

const today = new Date();

function formatDateParam(v: Date | string | undefined | null): string | null {
  if (!v) return null;
  if (v instanceof Date) return format(v, "yyyy-MM-dd");
  return v || null;
}

export default function CarLoadReportPage() {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [zoneSearch, setZoneSearch] = useState("");
  const isZoneAutoSelectRef = useRef(false);

  const { data: rawData, isLoading, fetch } = useCarLoadReport();

  const form = useForm<FilterFormValues>({
    defaultValues: {
      branch_id: "1",
      date_from: today,
      date_to: today,
    },
  });

  const watchedDateFrom = form.watch("date_from");
  const watchedDateTo = form.watch("date_to");

  const { data: zonesData } = useZonesToday({
    date_from: formatDateParam(watchedDateFrom),
    date_to: formatDateParam(watchedDateTo),
  });

  const zoneOptions = (
    (zonesData?.data ?? []) as { zone_id: number; zone_name: string }[]
  ).map((z) => ({
    label: z.zone_name,
    value: String(z.zone_id),
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
    const blob = await exportCarLoadReport(buildParams(values, selectedZones), "pdf");
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

  const filteredZones = displayedZones.filter((z) =>
    z.label.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const allSelected =
    displayedZones.length > 0 &&
    displayedZones.every((z) => selectedZones.includes(z.value));

  return (
    <PageWrapper size="3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
          {/* Filtros */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex items-end gap-3 flex-1 flex-wrap">
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
              <DateRangePickerFormField
                control={form.control}
                nameFrom="date_from"
                nameTo="date_to"
                label="Rango de Fechas"
                placeholder="Seleccionar rango"
              />
            </div>
            <div className="flex gap-2 pb-0.5">
              <Button type="submit" disabled={isLoading} size="sm">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <ExportButtons onPdfDownload={handleExportPdf} pdfLabel="Imprimir" />
            </div>
          </div>

          {/* Zonas */}
          <GroupFormSection
            title="Zonas"
            icon={Filter}
            headerExtra={
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() =>
                  setSelectedZones(
                    allSelected ? [] : displayedZones.map((z) => z.value),
                  )
                }
              >
                {allSelected ? "Ninguna" : "Todas"}
              </button>
            }
            cols={{ sm: 1 }}
            gap="gap-0"
          >
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={zoneSearch}
                onChange={(e) => setZoneSearch(e.target.value)}
                placeholder="Buscar zona..."
                className="w-full rounded-md border bg-background pl-8 pr-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="max-h-[420px] overflow-y-auto space-y-1.5 pr-0.5">
              {filteredZones.map((zone) => (
                <label
                  key={zone.value}
                  className="flex items-center justify-between gap-2 cursor-pointer border rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm leading-tight">{zone.label}</span>
                  <Checkbox
                    checked={selectedZones.includes(zone.value)}
                    onCheckedChange={() => toggleZone(zone.value)}
                  />
                </label>
              ))}
              {!rawData && (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  Realiza una búsqueda para ver las zonas disponibles.
                </p>
              )}
              {rawData && displayedZones.length === 0 && (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  Sin zonas para este período.
                </p>
              )}
            </div>
            {displayedZones.length > 0 && (
              <p className="text-xs text-muted-foreground pt-2">
                {selectedZones.filter((id) => displayedZones.some((z) => z.value === id)).length}/{displayedZones.length} seleccionadas
              </p>
            )}
          </GroupFormSection>
        </form>
      </Form>
    </PageWrapper>
  );
}
