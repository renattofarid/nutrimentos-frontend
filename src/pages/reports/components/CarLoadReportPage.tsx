import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import {
  useCarLoadReport,
  useZonesToday,
  useBranchAsyncSearch,
} from "../lib/reports.hook";

import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { CarLoadReportParams, CarLoadRow } from "../lib/reports.interface";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Truck,
  Scale,
  LayoutList,
  Filter,
} from "lucide-react";
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

function KgGruposCell({
  label,
  grupos,
}: {
  label: string;
  grupos: CarLoadRow["kg_grupos"];
}) {
  if (!label || grupos.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto py-0.5 px-1 font-mono text-xs text-left justify-start max-w-[180px] truncate"
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-2 space-y-1">
        {grupos.map((g, i) => (
          <div
            key={i}
            className="flex justify-between items-center px-2 py-1 rounded bg-muted/50 text-sm"
          >
            <span className="font-mono">{g.label}</span>
            <span className="text-muted-foreground font-mono">{g.kg} kg</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

const columns: ColumnDef<CarLoadRow>[] = [
  {
    accessorKey: "cod",
    header: "Código",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.cod}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Producto",
    size: 220,
    cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
  },
  {
    accessorKey: "unit",
    header: "Unidad",
    size: 80,
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.unit}</span>
    ),
  },
  {
    accessorKey: "sacos",
    header: "Sacos",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.sacos}
      </span>
    ),
  },
  {
    accessorKey: "kg_total",
    header: "KG Total",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.kg_total}
      </span>
    ),
  },
  {
    accessorKey: "kg_label",
    header: "Detalle KG",
    size: 200,
    cell: ({ row }) => (
      <KgGruposCell
        label={row.original.kg_label}
        grupos={row.original.kg_grupos}
      />
    ),
  },
  {
    accessorKey: "ton",
    header: "Ton",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.ton}
      </span>
    ),
  },
  {
    accessorKey: "contado",
    header: "Contado",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.contado}
      </span>
    ),
  },
  {
    accessorKey: "credito",
    header: "Crédito",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">
        {row.original.credito}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-right block">
        {row.original.total}
      </span>
    ),
  },
];

const today = new Date();

function formatDateParam(v: Date | string | undefined | null): string | null {
  if (!v) return null;
  if (v instanceof Date) return format(v, "yyyy-MM-dd");
  return v || null;
}

export default function CarLoadReportPage() {
  const [showSummary, setShowSummary] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [zoneSearch, setZoneSearch] = useState("");
  const hasSearchedRef = useRef(false);
  const isAutoSelectingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);

  const { data: rawData, isLoading, fetch } = useCarLoadReport();
  const { data: zonesData } = useZonesToday();

  const zoneOptions = (
    (Array.isArray(zonesData) ? zonesData : (zonesData?.data ?? [])) as { id: number; name: string }[]
  ).map((z) => ({
    label: z.name,
    value: String(z.id),
  }));

  const reportData = rawData?.data;

  const form = useForm<FilterFormValues>({
    defaultValues: {
      branch_id: "1",
      date_from: today,
      date_to: today,
    },
  });

  const buildParams = (
    values: FilterFormValues,
    zones: string[],
  ): CarLoadReportParams => ({
    zone_ids: zones.map(Number),
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    date_from: formatDateParam(values.date_from),
    date_to: formatDateParam(values.date_to),
  });

  // Auto-search once zones are loaded, sending all zone IDs
  useEffect(() => {
    if (initialFetchDoneRef.current || zoneOptions.length === 0) return;
    initialFetchDoneRef.current = true;
    hasSearchedRef.current = true;
    fetch(buildParams(form.getValues(), zoneOptions.map((z) => z.value)));
  }, [zoneOptions.length]);

  // When a search result arrives, auto-select only zones that appear in the result
  useEffect(() => {
    if (!rawData || !reportData?.zones || zoneOptions.length === 0) return;
    const matched = zoneOptions
      .filter((z) => (reportData.zones as string[]).includes(z.label))
      .map((z) => z.value);
    isAutoSelectingRef.current = true;
    setSelectedZones(matched);
  }, [rawData, zoneOptions.length]);

  // Auto-refetch when zones change (only after first search, skip auto-selections)
  useEffect(() => {
    if (!hasSearchedRef.current) return;
    if (isAutoSelectingRef.current) {
      isAutoSelectingRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const values = form.getValues();
      fetch(buildParams(values, selectedZones));
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedZones]);

  const handleSearch = (values: FilterFormValues) => {
    hasSearchedRef.current = true;
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

  // Only show zones that appear in the last search result
  const displayedZones = rawData
    ? zoneOptions.filter((z) =>
        (reportData?.zones ?? []).includes(z.label)
      )
    : [];

  const filteredZones = displayedZones.filter((z) =>
    z.label.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const allSelected =
    displayedZones.length > 0 &&
    displayedZones.every((z) => selectedZones.includes(z.value));
  const rows = reportData?.rows ?? [];
  const totals = reportData?.totals;

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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSummary((prev) => !prev)}
              >
                <LayoutList className="mr-2 h-4 w-4" />
                {showSummary ? "Ocultar Resumen" : "Mostrar Resumen"}
              </Button>
            </div>
          </div>

          {/* Zonas + Tabla */}
          <div className="grid grid-cols-5 gap-4 items-start">
            {/* 1/4 — Zonas */}
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

            {/* 3/4 — Resumen + Tabla */}
            <div className="col-span-4 space-y-4">
              {showSummary && totals && (
                <GroupFormSection
                  title="Resumen"
                  icon={Truck}
                  cols={{ sm: 2, md: 3, lg: 6 }}
                >
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ventas</p>
                    <p className="text-2xl font-bold">
                      {reportData?.sales_count ?? 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sacos</p>
                    <p className="text-2xl font-bold">{totals.sacos}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Scale className="h-3 w-3" /> KG Total
                    </p>
                    <p className="text-2xl font-bold">{totals.kg_total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ton</p>
                    <p className="text-2xl font-bold">{totals.ton}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Contado</p>
                    <p className="text-2xl font-bold">{totals.contado}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Crédito</p>
                    <p className="text-2xl font-bold">{totals.credito}</p>
                  </div>
                </GroupFormSection>
              )}
              <DataTable
                columns={columns}
                data={rows}
                isLoading={isLoading}
                isVisibleColumnFilter={false}
              />
            </div>
          </div>
        </form>
      </Form>
    </PageWrapper>
  );
}
