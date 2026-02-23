import type { UseFormReturn } from "react-hook-form";
import {
  User,
  DollarSign,
  Clock,
  MessageSquarePlus,
  MessageSquare,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DELIVERY_STATUS_OPTIONS } from "./constants";
import type { SaleWithIndex, SettlementFormSchema } from "./types";
import { parseFormattedNumber } from "@/lib/utils";
import { useState } from "react";

interface SaleMobileCardProps {
  sale: SaleWithIndex;
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
}

export function SaleMobileCard({ sale, form }: SaleMobileCardProps) {
  const index = sale.index;
  const formValues = form.watch(`sales.${index}`);
  const formErrors = form.formState.errors.sales?.[index];
  const statusOption = DELIVERY_STATUS_OPTIONS.find(
    (opt) => opt.value === formValues?.delivery_status,
  );
  const StatusIcon = statusOption?.icon || Clock;
  const [showNotes, setShowNotes] = useState(false);
  const hasNote =
    formValues?.delivery_notes && formValues.delivery_notes.length > 0;
  const creditNotesTotal = sale.sale.credit_notes_total_raw || 0;
  const currentAmount = parseFormattedNumber(sale.current_amount);
  const pendingAmount = currentAmount - creditNotesTotal;
  const hasCreditNotes = sale.sale.credit_notes.length > 0;

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="bg-muted/50 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {sale.sale.document_type}
              </Badge>
            </div>
            <CardTitle className="text-base font-mono">
              {sale.sale.full_document_number}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-right flex flex-col items-end">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold text-sm">
                S/. {parseFormattedNumber(sale.original_amount).toFixed(2)}
              </p>
            </Badge>
            <Badge color="secondary" className="text-right flex flex-col items-end">
              <p className="text-xs text-muted-foreground">Pendiente</p>
              <p className="font-semibold text-sm">
                S/. {pendingAmount.toFixed(2)}
              </p>
            </Badge>
            {hasCreditNotes && (
              <Badge
                variant="outline"
                className="text-right flex flex-col items-end bg-orange-50 text-orange-700 border-orange-200"
              >
                <p className="text-xs">N/C</p>
                <p className="font-semibold text-sm">
                  S/. {creditNotesTotal.toFixed(2)}
                </p>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4 space-y-4">
        {/* Cliente */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{sale.sale.customer?.full_name}</span>
        </div>

        {/* Estado de Entrega */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            Estado de Entrega
          </label>
          <Select
            value={formValues?.delivery_status || "ENTREGADO"}
            onValueChange={(value) =>
              form.setValue(`sales.${index}.delivery_status`, value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              className={formErrors?.delivery_status ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Seleccionar estado..." />
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

        {/* Monto Cobrado */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monto Cobrado
            </label>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`auto-fill-mobile-${index}`}
                checked={
                  parseFloat(formValues?.payment_amount || "0") ===
                  pendingAmount
                }
                onCheckedChange={(checked) => {
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
                }}
              />
              <label
                htmlFor={`auto-fill-mobile-${index}`}
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                Auto-llenar
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">S/.</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={pendingAmount.toString()}
              placeholder="0.00"
              className={`text-right ${
                formErrors?.payment_amount ? "border-red-500" : ""
              }`}
              value={formValues?.payment_amount || "0"}
              onChange={(e) =>
                form.setValue(`sales.${index}.payment_amount`, e.target.value, {
                  shouldValidate: true,
                })
              }
            />
          </div>
          {formErrors?.payment_amount && (
            <p className="text-xs text-red-500">
              {formErrors.payment_amount.message}
            </p>
          )}
        </div>

        {/* Botón de Notas */}
        <div className="space-y-2">
          <Button
            type="button"
            variant={showNotes ? "default" : "outline"}
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="w-full gap-2"
          >
            {showNotes ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ocultar Notas
              </>
            ) : (
              <>
                <MessageSquarePlus className="h-4 w-4" />
                Agregar Nota
                {hasNote && (
                  <Badge color="secondary" className="ml-1">
                    <MessageSquare className="h-3 w-3" />
                  </Badge>
                )}
              </>
            )}
          </Button>

          {showNotes && (
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Notas de Entrega</label>
              <Textarea
                placeholder="Observaciones sobre la entrega..."
                className={`resize-none ${
                  formErrors?.delivery_notes ? "border-red-500" : ""
                }`}
                rows={3}
                maxLength={500}
                value={formValues?.delivery_notes || ""}
                onChange={(e) =>
                  form.setValue(
                    `sales.${index}.delivery_notes`,
                    e.target.value,
                    {
                      shouldValidate: true,
                    },
                  )
                }
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {(formValues?.delivery_notes || "").length}/500 caracteres
                </p>
                {formErrors?.delivery_notes && (
                  <p className="text-xs text-red-500">
                    {formErrors.delivery_notes.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
