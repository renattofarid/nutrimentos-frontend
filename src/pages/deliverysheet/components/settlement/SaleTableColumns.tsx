import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, MessageSquarePlus, MessageSquare } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DELIVERY_STATUS_OPTIONS } from "./constants";
import type { SettlementFormSchema } from "./types";
import { parseFormattedNumber } from "@/lib/utils";
import type { SheetSale } from "../../lib/deliverysheet.interface";

type SheetSaleWithIndex = SheetSale & { index: number };

export function getSaleTableColumns(
  form: UseFormReturn<SettlementFormSchema, any, undefined>,
  expandedNotes: Set<number>,
  toggleNote: (index: number) => void,
): ColumnDef<SheetSaleWithIndex>[] {
  return [
    {
      id: "document_customer",
      header: "Documento / Cliente",
      cell: ({ row }) => (
        <div className="space-y-2 min-w-[200px]">
          <div className="flex items-center gap-2">
            <Badge className="font-mono font-semibold text-sm">
              {row.original.sale.full_document_number}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.sale.customer?.full_name || "Sin cliente"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "original_amount",
      header: "Total",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          S/. {parseFormattedNumber(row.original.original_amount).toFixed(2)}
        </Badge>
      ),
    },
    {
      accessorKey: "current_amount",
      header: "Pendiente",
      cell: ({ row }) => {
        const creditNotesTotal = row.original.sale.credit_notes_total_raw || 0;
        const currentAmount = parseFormattedNumber(row.original.current_amount);
        const pendingAmount = currentAmount - creditNotesTotal;
        return (
          <Badge variant="secondary" className="text-xs font-semibold">
            S/. {pendingAmount.toFixed(2)}
          </Badge>
        );
      },
    },
    {
      id: "credit_notes_total",
      header: "N/C",
      cell: ({ row }) => {
        const creditNotes = row.original.sale.credit_notes || [];
        const hasCreditNotes = creditNotes.length > 0;
        const creditNoteAmount = row.original.sale.credit_notes_total;

        if (!hasCreditNotes) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Badge
                    variant="outline"
                    className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                  >
                    S/.{" "}
                    {creditNoteAmount && parseFloat(creditNoteAmount) > 0
                      ? parseFloat(creditNoteAmount).toFixed(2)
                      : "0.00"}
                  </Badge>
                  <AlertCircle className="h-3 w-3 text-orange-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2 text-xs">
                  <p className="font-semibold">Nota de Crédito</p>
                  {creditNotes.length > 0 &&
                    creditNotes.map((cn) => (
                      <div key={cn.id} className="space-y-0.5">
                        <p className="font-medium">{cn.full_document_number}</p>
                      </div>
                    ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "credit_notes_observations",
      header: "Obs. N/C",
      cell: ({ row }) => {
        const creditNotes = row.original.sale.credit_notes || [];
        const observations = creditNotes
          .filter((cn) => cn.observations)
          .map((cn) => cn.observations as string);

        if (observations.length === 0) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        return (
          <div className="max-w-[200px] text-xs text-muted-foreground">
            {observations.map((obs, idx) => (
              <p key={idx} className="text-wrap" title={obs}>
                {obs}
              </p>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "delivery_status",
      header: "Estado",
      cell: ({ row }) => {
        const index = row.original.index;
        const formValues = form.watch(`sales.${index}`);
        const formErrors = form.formState.errors.sales?.[index];
        return (
          <div className="space-y-1">
            <Select
              value={formValues?.delivery_status || "ENTREGADO"}
              onValueChange={(value) =>
                form.setValue(`sales.${index}.delivery_status`, value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger
                className={`w-full md:w-[160px] ${
                  formErrors?.delivery_status ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_STATUS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {formErrors?.delivery_status && (
              <p className="text-xs text-red-500">
                {formErrors.delivery_status.message}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "payment_amount",
      header: "Monto Cobrado",
      cell: ({ row }) => {
        const index = row.original.index;
        const formValues = form.watch(`sales.${index}`);
        const formErrors = form.formState.errors.sales?.[index];
        const creditNotesTotal = row.original.sale.credit_notes_total_raw || 0;
        const currentAmount = parseFormattedNumber(row.original.current_amount);
        const pendingAmount = currentAmount - creditNotesTotal;

        const handleAutoFill = (checked: boolean) => {
          if (checked) {
            form.setValue(
              `sales.${index}.payment_amount`,
              pendingAmount.toFixed(2),
              { shouldValidate: true },
            );
          } else {
            form.setValue(`sales.${index}.payment_amount`, "0", {
              shouldValidate: true,
            });
          }
        };

        const isAutoFilled =
          parseFloat(formValues?.payment_amount || "0") === pendingAmount;

        return (
          <div className="min-w-[280px] space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                S/.
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={pendingAmount.toString()}
                placeholder="0.00"
                className={`w-32 text-right ${
                  formErrors?.payment_amount ? "border-red-500" : ""
                }`}
                value={formValues?.payment_amount || "0"}
                onChange={(e) =>
                  form.setValue(
                    `sales.${index}.payment_amount`,
                    e.target.value,
                    {
                      shouldValidate: true,
                    },
                  )
                }
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`auto-fill-${index}`}
                  checked={isAutoFilled}
                  onCheckedChange={handleAutoFill}
                />
                <label
                  htmlFor={`auto-fill-${index}`}
                  className="text-sm font-medium cursor-pointer select-none whitespace-nowrap"
                >
                  Pagar todo
                </label>
              </div>
            </div>
            {formErrors?.payment_amount && (
              <p className="text-xs text-red-500">
                {formErrors.payment_amount.message}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "notes_toggle",
      header: "",
      cell: ({ row }) => {
        const index = row.original.index;
        const isExpanded = expandedNotes.has(index);
        const formValues = form.watch(`sales.${index}`);
        const hasNote =
          formValues?.delivery_notes && formValues.delivery_notes.length > 0;

        return (
          <div className="flex justify-center">
            <Button
              type="button"
              variant={isExpanded ? "default" : "outline"}
              size="sm"
              onClick={() => toggleNote(index)}
              className="gap-2"
            >
              {isExpanded ? (
                <MessageSquare className="h-4 w-4" />
              ) : (
                <MessageSquarePlus className="h-4 w-4" />
              )}
              {hasNote && !isExpanded && (
                <Badge
                  variant="secondary"
                  className="h-4 w-4 p-0 flex items-center justify-center rounded-full"
                >
                  !
                </Badge>
              )}
            </Button>
          </div>
        );
      },
    },
  ];
}
