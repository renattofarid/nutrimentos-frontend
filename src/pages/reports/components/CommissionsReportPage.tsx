import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Filter, FileSpreadsheet, Search, Percent, TrendingUp, Package, DollarSign, CheckCircle2, Circle } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import {
  getCommissionsReport,
  exportCommissionsReport,
} from "../lib/reports.actions";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorToast, successToast } from "@/lib/core.function";
import { format as dateFnsFormat } from "date-fns";
import type { CommissionDatum, CommissionsReportResponse } from "../lib/reports.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "comisiones";

interface FilterFormValues {
  selected_month: string;
}

const fmt = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-8 shrink-0 ${done ? "bg-primary" : "bg-muted-foreground/30"}`} />}
            <div className={`flex items-center gap-1.5 ${active ? "text-primary font-semibold" : done ? "text-primary/70" : "text-muted-foreground"}`}>
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <Circle className={`h-4 w-4 shrink-0 ${active ? "fill-primary/10" : ""}`} />
              )}
              <span className="whitespace-nowrap">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color = "text-foreground",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="rounded-md bg-muted p-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default function CommissionsReportPage() {
  const { can } = usePermission();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<CommissionsReportResponse | null>(null);
  const [commissionRates, setCommissionRates] = useState<Record<number, string>>({});

  const currentMonth = dateFnsFormat(new Date(), "yyyy-MM");

  const form = useForm<FilterFormValues>({
    defaultValues: { selected_month: currentMonth },
  });

  const sellers: CommissionDatum[] = reportData?.data ?? [];

  const hasValidRates = Object.values(commissionRates).some((r) => {
    const v = parseFloat(r);
    return !isNaN(v) && v >= 0 && v <= 1;
  });

  const currentStep = !reportData ? 1 : !hasValidRates ? 2 : 3;

  const handleSearch = async (values: FilterFormValues) => {
    if (!values.selected_month) return;
    setIsLoading(true);
    try {
      const res = await getCommissionsReport({ selected_month: values.selected_month });
      setReportData(res);
      const initial: Record<number, string> = {};
      res.data.forEach((s) => {
        initial[s.codigo] = "1";
      });
      setCommissionRates(initial);
    } catch {
      errorToast("Error al obtener el reporte de comisiones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateChange = (codigo: number, value: string) => {
    setCommissionRates((prev) => ({ ...prev, [codigo]: value }));
  };

  const handleExport = async () => {
    const values = form.getValues();
    if (!values.selected_month || !hasValidRates) return;

    const commission_rates: Record<number, number> = {};
    for (const [id, rate] of Object.entries(commissionRates)) {
      const parsed = parseFloat(rate);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        commission_rates[Number(id)] = parsed;
      }
    }

    setIsExporting(true);
    try {
      const blob = await exportCommissionsReport({
        selected_month: values.selected_month,
        commission_rates,
        format: "excel",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `comisiones-${values.selected_month}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      successToast("Reporte de comisiones exportado exitosamente");
    } catch {
      errorToast("Error al exportar el reporte de comisiones");
    } finally {
      setIsExporting(false);
    }
  };

  const totalToneladas = sellers.reduce((sum, s) => sum + s.toneladas, 0);
  const totalVendido = sellers.reduce((sum, s) => sum + s.importe_vendido, 0);
  const totalCobrado = sellers.reduce((sum, s) => sum + s.importe_cobrado, 0);
  const totalComision = sellers.reduce((sum, s) => sum + s.importe_comision, 0);
  const totalPorCobrar = sellers.reduce((sum, s) => sum + s.por_cobrar, 0);

  return (
    <PageWrapper size="3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">

          <StepIndicator
            steps={["Selecciona el mes", "Ajusta las tasas", "Exporta el Excel"]}
            current={currentStep}
          />

          <GroupFormSection
            title="Paso 1 · Selecciona el mes"
            icon={Filter}
            gap="gap-2"
            cols={{ sm: 1, md: 3 }}
          >
            <FormInput
              control={form.control}
              name="selected_month"
              label="Mes"
              type="month"
              required
            />
            <div className="flex gap-2 items-end h-full">
              <Button variant="outline" color="primary" type="submit" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? "Cargando..." : "Buscar vendedores"}
              </Button>
            </div>
          </GroupFormSection>

          {reportData && sellers.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              <Percent className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p className="text-sm">No se encontraron vendedores con actividad en el mes seleccionado.</p>
            </div>
          )}

          {reportData && sellers.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryCard icon={Package} label="Toneladas" value={fmt(totalToneladas)} />
                <SummaryCard icon={DollarSign} label="Importe vendido" value={fmt(totalVendido)} />
                <SummaryCard icon={TrendingUp} label="Importe cobrado" value={fmt(totalCobrado)} />
                <SummaryCard icon={Percent} label="Total comisiones" value={fmt(totalComision)} color="text-blue-600" />
              </div>

              <GroupFormSection
                title="Paso 2 · Ajusta las tasas de comisión"
                icon={Percent}
                cols={{ sm: 1 }}
              >
                <div className="col-span-full space-y-3">
                  {reportData.labels && (
                    <p className="text-xs text-muted-foreground">
                      Meses de referencia:{" "}
                      <span className="font-medium text-foreground capitalize">{reportData.labels.month1}</span>
                      {" "}y{" "}
                      <span className="font-medium text-foreground capitalize">{reportData.labels.month2}</span>
                    </p>
                  )}

                  <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                    Revisa y ajusta la columna <strong>"Tasa"</strong> para cada vendedor.
                    El valor debe estar entre <strong>0</strong> (sin comisión) y <strong>1</strong> (100%).
                    Por defecto todos están en <strong>1</strong>. Cuando estés listo, exporta el Excel.
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendedor</TableHead>
                        <TableHead className="text-right">Toneladas</TableHead>
                        <TableHead className="text-right">Vendido</TableHead>
                        <TableHead className="text-right">Cobrado</TableHead>
                        <TableHead className="text-right">Por Cobrar</TableHead>
                        <TableHead className="text-right">% Comisión</TableHead>
                        <TableHead className="text-right">Importe Comisión</TableHead>
                        <TableHead className="w-32 text-center">Tasa (0–1)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellers.map((s) => (
                        <TableRow key={s.codigo}>
                          <TableCell className="font-medium">{s.vendedor}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{fmt(s.toneladas)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{fmt(s.importe_vendido)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{fmt(s.importe_cobrado)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            <span className={s.por_cobrar < 0 ? "text-red-600 font-medium" : "text-green-700"}>
                              {fmt(s.por_cobrar)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">{fmt(s.pct_comision)}</TableCell>
                          <TableCell className="text-right font-mono text-sm font-semibold text-blue-600">
                            {fmt(s.importe_comision)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={1}
                              step={0.01}
                              placeholder="0.00"
                              value={commissionRates[s.codigo] ?? ""}
                              onChange={(e) => handleRateChange(s.codigo, e.target.value)}
                              className="w-24 font-mono text-center"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot>
                      <tr className="border-t-2 bg-muted/50 font-bold">
                        <td className="p-2 pl-4 text-sm">Totales</td>
                        <td className="p-2 text-right font-mono text-sm">{fmt(totalToneladas)}</td>
                        <td className="p-2 text-right font-mono text-sm">{fmt(totalVendido)}</td>
                        <td className="p-2 text-right font-mono text-sm">{fmt(totalCobrado)}</td>
                        <td className="p-2 text-right font-mono text-sm">
                          <span className={totalPorCobrar < 0 ? "text-red-600" : "text-green-700"}>
                            {fmt(totalPorCobrar)}
                          </span>
                        </td>
                        <td className="p-2" />
                        <td className="p-2 text-right font-mono text-sm text-blue-600">{fmt(totalComision)}</td>
                        <td className="p-2" />
                      </tr>
                    </tfoot>
                  </Table>

                  {can(ROUTE, ACTIONS.EXPORTAR) && (
                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        color="green"
                        onClick={handleExport}
                        disabled={isExporting || !hasValidRates}
                        title={!hasValidRates ? "Ingresa al menos una tasa válida (0–1) para exportar" : ""}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        {isExporting ? "Exportando..." : "Paso 3 · Exportar Excel"}
                      </Button>
                    </div>
                  )}
                </div>
              </GroupFormSection>
            </>
          )}
        </form>
      </Form>
    </PageWrapper>
  );
}
