"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExcelGrid, type ExcelGridColumn } from "@/components/ExcelGrid";
import { parseFormattedNumber } from "@/lib/utils";
import { DELIVERY_STATUS_OPTIONS } from "./constants";
import type { SettlementFormSchema } from "./types";
import type { SaleWithIndex } from "./types";

// ── Cell components (use useWatch to avoid re-rendering the whole grid) ──────

function PayAllHeader({
  sales,
  form,
}: {
  sales: SaleWithIndex[];
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
}) {
  const allValues = useWatch({ control: form.control, name: "sales" }) as SettlementFormSchema["sales"];

  const allPaid = useMemo(() => {
    if (!allValues?.length) return false;
    const allFilled = allValues.every((sale, i) => {
      const saleData = sales[i];
      if (!saleData) return false;
      const saldo = Math.max(0, parseFormattedNumber(saleData.current_amount) - parseFormattedNumber(saleData.collected_amount));
      return Math.abs(parseFloat(sale.payment_amount || "0") - saldo) < 0.01;
    });
    if (allFilled) return true;
    const anyFilled = allValues.some((s) => parseFloat(s.payment_amount || "0") > 0);
    return anyFilled ? ("indeterminate" as const) : false;
  }, [allValues, sales]);

  const handlePayAll = (checked: boolean) => {
    sales.forEach((saleData) => {
      const saldo = Math.max(0, parseFormattedNumber(saleData.current_amount) - parseFormattedNumber(saleData.collected_amount));
      form.setValue(
        `sales.${saleData.index}.payment_amount`,
        checked ? saldo.toFixed(2) : "0",
        { shouldValidate: true },
      );
    });
  };

  return <Checkbox checked={allPaid} onCheckedChange={handlePayAll} />;
}

function CheckboxCell({
  index,
  saldo,
  form,
}: {
  index: number;
  saldo: number;
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
}) {
  const value =
    (useWatch({ control: form.control, name: `sales.${index}.payment_amount` }) as string) || "0";
  const isAutoFilled = Math.abs(parseFloat(value) - saldo) < 0.01;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Checkbox
        checked={isAutoFilled}
        onCheckedChange={(checked) =>
          form.setValue(
            `sales.${index}.payment_amount`,
            checked ? saldo.toFixed(2) : "0",
            { shouldValidate: true },
          )
        }
      />
    </div>
  );
}

function StatusCell({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
}) {
  const value =
    (useWatch({ control: form.control, name: `sales.${index}.delivery_status` }) as string) ||
    "ENTREGADO";
  const error = form.formState.errors.sales?.[index]?.delivery_status;
  return (
    <Select
      value={value}
      onValueChange={(v) =>
        form.setValue(`sales.${index}.delivery_status`, v, { shouldValidate: true })
      }
    >
      <SelectTrigger
        className={`w-full h-fit rounded-none border-0 border-r-0 text-xs px-2 focus:ring-1 focus:ring-inset focus:ring-primary bg-transparent ${error ? "ring-1 ring-red-500" : ""}`}
      >
        <SelectValue placeholder="Seleccionar..." />
      </SelectTrigger>
      <SelectContent>
        {DELIVERY_STATUS_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2 text-xs">
                <Icon className="h-3 w-3" />
                {opt.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function PaymentAmountCell({
  index,
  pendingAmount,
  form,
}: {
  index: number;
  pendingAmount: number;
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
}) {
  const value =
    (useWatch({ control: form.control, name: `sales.${index}.payment_amount` }) as string) || "0";
  const error = form.formState.errors.sales?.[index]?.payment_amount;
  return (
    <input
      type="number"
      step="0.01"
      min="0"
      max={pendingAmount.toString()}
      value={value}
      onChange={(e) =>
        form.setValue(`sales.${index}.payment_amount`, e.target.value, {
          shouldValidate: true,
        })
      }
      className={`w-full h-full px-2 py-1 text-right text-xs border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary bg-transparent ${
        error ? "ring-1 ring-red-500" : ""
      }`}
    />
  );
}

function NuevoSaldoCell({
  index,
  saldo,
  form,
}: {
  index: number;
  saldo: number;
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
}) {
  const paymentAmount = parseFloat(
    (useWatch({ control: form.control, name: `sales.${index}.payment_amount` }) as string) || "0",
  );
  const nuevoSaldo = saldo - paymentAmount;
  return (
    <div className="w-full h-full flex items-center justify-end px-2 text-xs font-mono text-muted-foreground">
      S/. {nuevoSaldo.toFixed(2)}
    </div>
  );
}

function ObservationsCell({
  index,
  form,
}: {
  index: number;
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
}) {
  const value =
    (useWatch({ control: form.control, name: `sales.${index}.delivery_notes` }) as string) || "";
  const error = form.formState.errors.sales?.[index]?.delivery_notes;
  return (
    <input
      type="text"
      maxLength={500}
      value={value}
      onChange={(e) =>
        form.setValue(`sales.${index}.delivery_notes`, e.target.value, {
          shouldValidate: true,
        })
      }
      placeholder="Observaciones..."
      className={`w-full h-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-primary bg-transparent placeholder:text-muted-foreground/50 ${
        error ? "ring-1 ring-red-500" : ""
      }`}
    />
  );
}

// ── Row type (only static/display data) ──────────────────────────────────────

interface SettlementGridRow {
  index: number;
  fecha: string;
  cliente: string;
  documento: string;
  total: number;
  saldo: number;
  nota_credito_raw: number;
  has_credit_notes: boolean;
  credit_notes: Array<{
    id: number;
    full_document_number: string;
    total_amount: string;
    observations: string | null;
  }>;
  obs_nc: string;
  almacen: string;
}

// ── Main component ────────────────────────────────────────────────────────────

interface SettlementExcelGridProps {
  sales: SaleWithIndex[];
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
  isDisabled?: boolean;
}

export function SettlementExcelGrid({ sales, form, isDisabled }: SettlementExcelGridProps) {
  const gridData = useMemo<SettlementGridRow[]>(
    () =>
      sales.map((sheetSale) => {
        const currentAmount = parseFormattedNumber(sheetSale.current_amount);
        const collectedAmount = parseFormattedNumber(sheetSale.collected_amount);
        const saldo = Math.max(0, currentAmount - collectedAmount);

        const issueDate = sheetSale.sale.issue_date || "";
        const fecha = issueDate
          ? new Date(issueDate).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })
          : "-";

        const obsNc = sheetSale.sale.credit_notes
          .filter((cn) => cn.observations)
          .map((cn) => cn.observations as string)
          .join(" / ");

        return {
          index: sheetSale.index,
          fecha,
          cliente: sheetSale.sale.customer?.full_name || "-",
          documento: sheetSale.sale.full_document_number,
          total: parseFormattedNumber(sheetSale.original_amount),
          saldo,
          nota_credito_raw: sheetSale.sale.credit_notes_total_raw || 0,
          has_credit_notes: sheetSale.sale.credit_notes.length > 0,
          credit_notes: sheetSale.sale.credit_notes,
          obs_nc: obsNc,
          almacen: (sheetSale.sale as any).warehouse?.name || "-",
        };
      }),
    [sales],
  );

  const columns = useMemo<ExcelGridColumn<SettlementGridRow>[]>(
    () => [
      {
        id: "checkbox",
        header: <PayAllHeader sales={sales} form={form} />,
        type: "readonly",
        width: "40px",
        render: (row) => <CheckboxCell index={row.index} saldo={row.saldo} form={form} />,
      },
      {
        id: "fecha",
        header: "FECHA",
        type: "readonly",
        width: "80px",
        render: (row) => (
          <div className="px-2 py-1 text-xs font-mono">{row.fecha}</div>
        ),
      },
      {
        id: "cliente",
        header: "CLIENTE",
        type: "readonly",
        width: "160px",
        render: (row) => (
          <div className="px-2 py-1 text-xs truncate max-w-[155px]" title={row.cliente}>
            {row.cliente}
          </div>
        ),
      },
      {
        id: "documento",
        header: "DOCUMENTO",
        type: "readonly",
        width: "110px",
        render: (row) => (
          <div className="px-2 py-1 text-xs font-mono">{row.documento}</div>
        ),
      },
      {
        id: "total",
        header: "TOTAL",
        type: "readonly",
        width: "90px",
        render: (row) => (
          <div className="px-2 py-1 text-xs font-mono text-right">
            S/. {row.total.toFixed(2)}
          </div>
        ),
      },
      {
        id: "saldo",
        header: "SALDO PEND.",
        type: "readonly",
        width: "90px",
        render: (row) => (
          <div className="px-2 py-1 text-xs font-mono text-right font-semibold">
            S/. {row.saldo.toFixed(2)}
          </div>
        ),
      },
      {
        id: "nota_credito",
        header: "NOTA CRÉDITO",
        type: "readonly",
        width: "110px",
        render: (row) => {
          if (!row.has_credit_notes) {
            return <div className="px-2 py-1 text-xs text-muted-foreground text-center">-</div>;
          }
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="px-2 py-1 flex items-center gap-1 cursor-help">
                    <span className="text-xs font-mono text-orange-700">
                      S/. {row.nota_credito_raw.toFixed(2)}
                    </span>
                    <AlertCircle className="h-3 w-3 text-orange-500 shrink-0" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold">Notas de Crédito</p>
                    {row.credit_notes.map((cn) => (
                      <p key={cn.id}>{cn.full_document_number} — S/. {parseFloat(cn.total_amount || "0").toFixed(2)}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        id: "payment_amount",
        header: "MONTO COBRADO",
        type: "readonly",
        width: "130px",
        render: (row) => (
          <PaymentAmountCell index={row.index} pendingAmount={row.saldo} form={form} />
        ),
      },
      {
        id: "nuevo_saldo",
        header: "NUEVO SALDO",
        type: "readonly",
        width: "100px",
        render: (row) => <NuevoSaldoCell index={row.index} saldo={row.saldo} form={form} />,
      },
      {
        id: "obs_nc",
        header: "OBS N/C",
        type: "readonly",
        width: "130px",
        render: (row) => (
          <div
            className="px-2 py-1 text-xs text-muted-foreground truncate max-w-[125px]"
            title={row.obs_nc || "-"}
          >
            {row.obs_nc || "-"}
          </div>
        ),
      },
      {
        id: "almacen",
        header: "ALMACÉN",
        type: "readonly",
        width: "110px",
        render: (row) => (
          <div className="px-2 py-1 text-xs truncate max-w-[105px]" title={row.almacen}>
            {row.almacen}
          </div>
        ),
      },
      {
        id: "delivery_status",
        header: "ESTADO",
        type: "readonly",
        width: "160px",
        render: (row) => <StatusCell index={row.index} form={form} />,
      },
      {
        id: "delivery_notes",
        header: "OBSERVACIONES",
        type: "readonly",
        width: "200px",
        render: (row) => <ObservationsCell index={row.index} form={form} />,
      },
    ],
    [form, sales],
  );

  return (
    <ExcelGrid
      columns={columns}
      data={gridData}
      onAddRow={() => {}}
      onRemoveRow={() => {}}
      onCellChange={() => {}}
      hideActionButtons
      disabled={isDisabled}
      minHeight="100px"
      emptyMessage="No hay ventas en esta planilla."
    />
  );
}
