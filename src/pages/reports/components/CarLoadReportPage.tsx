import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCarLoadReport,
  useZoneAsyncSearch,
  useBranchAsyncSearch,
} from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { CarLoadReportParams, CarLoadRow } from "../lib/reports.interface";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Search, Filter, Truck, Scale } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportCarLoadReport } from "../lib/reports.actions";
import { toast } from "sonner";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FilterMultiSelect } from "@/components/FilterMultiSelect";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";

interface FilterFormValues {
  zone_ids: string[];
  branch_id: string;
  date_from: string;
  date_to: string;
}

function KgGruposCell({ label, grupos }: { label: string; grupos: CarLoadRow["kg_grupos"] }) {
  if (!label || grupos.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-auto py-0.5 px-1 font-mono text-xs text-left justify-start max-w-[180px] truncate">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-2 space-y-1">
        {grupos.map((g, i) => (
          <div key={i} className="flex justify-between items-center px-2 py-1 rounded bg-muted/50 text-sm">
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
    cell: ({ row }) => (
      <span className="text-sm">{row.original.name}</span>
    ),
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
      <span className="font-mono text-sm text-right block">{row.original.sacos}</span>
    ),
  },
  {
    accessorKey: "kg_total",
    header: "KG Total",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">{row.original.kg_total}</span>
    ),
  },
  {
    accessorKey: "kg_label",
    header: "Detalle KG",
    size: 200,
    cell: ({ row }) => (
      <KgGruposCell label={row.original.kg_label} grupos={row.original.kg_grupos} />
    ),
  },
  {
    accessorKey: "ton",
    header: "Ton",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">{row.original.ton}</span>
    ),
  },
  {
    accessorKey: "contado",
    header: "Contado",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">{row.original.contado}</span>
    ),
  },
  {
    accessorKey: "credito",
    header: "Crédito",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-right block">{row.original.credito}</span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-right block">{row.original.total}</span>
    ),
  },
];

export default function CarLoadReportPage() {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { data: rawData, isLoading, fetch } = useCarLoadReport();
  const { data: zonesData } = useZoneAsyncSearch({ per_page: 100 });

  const zoneOptions = ((zonesData?.data ?? []) as { id: number; name: string }[]).map((z) => ({
    label: z.name,
    value: String(z.id),
  }));

  const form = useForm<FilterFormValues>({
    defaultValues: {
      zone_ids: [],
      branch_id: "",
      date_from: "",
      date_to: "",
    },
  });

  // Pre-select all zones once they load
  useEffect(() => {
    if (zoneOptions.length > 0 && form.getValues("zone_ids").length === 0) {
      form.setValue("zone_ids", zoneOptions.map((z) => z.value));
    }
  }, [zoneOptions.length]);

  const buildParams = (values: FilterFormValues): CarLoadReportParams => ({
    zone_ids: values.zone_ids.map(Number),
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    date_from: values.date_from || null,
    date_to: values.date_to || null,
  });

  const handleSearch = (values: FilterFormValues) => {
    fetch(buildParams(values));
  };

  const handleExportPdf = async () => {
    const values = form.getValues();
    setIsExportingPdf(true);
    try {
      const blob = await exportCarLoadReport(buildParams(values), "pdf");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-llenado-carros.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Reporte de Llenado de Carros exportado exitosamente");
    } catch {
      toast.error("Error al exportar el reporte de Llenado de Carros");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const reportData = rawData?.data;
  const rows = reportData?.rows ?? [];
  const totals = reportData?.totals;

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Llenado de Carros"
        subtitle="Consulta los productos cargados por zona y período"
        icon="BookOpen"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
          <GroupFormSection
            title="Filtros de Búsqueda"
            icon={Filter}
            gap="gap-2"
            cols={{ sm: 1, md: 2, lg: 4 }}
            headerExtra={
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} size="sm">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf || rows.length === 0}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            }
          >
            <FilterMultiSelect
              label="Zonas"
              placeholder="Seleccionar zonas..."
              options={zoneOptions}
              value={form.watch("zone_ids")}
              onChange={(vals) => form.setValue("zone_ids", vals)}
            />

            <FormSelectAsync
              control={form.control}
              name="branch_id"
              label="Sucursal"
              placeholder="Buscar sucursal..."
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
          </GroupFormSection>

          {totals && (
            <GroupFormSection
              title="Resumen"
              icon={Truck}
              cols={{ sm: 2, md: 3, lg: 6 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ventas</p>
                <p className="text-2xl font-bold">{reportData?.sales_count ?? 0}</p>
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
          />
        </form>
      </Form>
    </PageWrapper>
  );
}
