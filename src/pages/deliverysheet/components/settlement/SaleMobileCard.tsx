import type { UseFormReturn } from "react-hook-form";
import { User, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DELIVERY_STATUS_OPTIONS } from "./constants";
import type { SaleWithIndex, SettlementFormSchema } from "./types";

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

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="bg-muted/50 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs">
              {sale.document_type}
            </Badge>
            <CardTitle className="text-base font-mono">
              {sale.full_document_number}
            </CardTitle>
          </div>
          <Badge variant="blue" className="text-right flex flex-col items-end">
            <p className="text-xs text-blue-900">TOTAL</p>
            <p className="font-semibold text-sm">
              S/. {parseFloat(sale.total_amount).toFixed(2)}
            </p>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-4 space-y-4">
        {/* Cliente */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{sale.customer.full_name}</span>
        </div>

        {/* Monto Pendiente */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Monto Pendiente</span>
          <Badge variant="secondary">
            S/. {parseFloat(sale.current_amount).toFixed(2)}
          </Badge>
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
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Monto Cobrado
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">S/.</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={parseFloat(sale.current_amount)}
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

        {/* Notas */}
        <div className="space-y-2">
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
              form.setValue(`sales.${index}.delivery_notes`, e.target.value, {
                shouldValidate: true,
              })
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
      </CardContent>
    </Card>
  );
}
