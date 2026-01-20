import type { ColumnDef } from "@tanstack/react-table";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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

export function getSaleTableColumns(
  form: UseFormReturn<SettlementFormSchema, any, undefined>
): ColumnDef<SaleWithIndex>[] {
  return [
    {
      accessorKey: "full_document_number",
      header: "Documento",
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            {row.original.document_type}
          </Badge>
          <div className="font-mono font-semibold text-sm">
            {row.original.full_document_number}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "customer.full_name",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="min-w-[150px]">{row.original.customer.full_name}</div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Monto Total",
      cell: ({ row }) => (
        <div className="text-right">
          <Badge variant="outline">
            S/. {parseFloat(row.original.total_amount).toFixed(2)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "current_amount",
      header: "Monto Pendiente",
      cell: ({ row }) => (
        <div className="text-right">
          <Badge variant="secondary">
            S/. {parseFloat(row.original.current_amount).toFixed(2)}
          </Badge>
        </div>
      ),
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
              value={formValues?.delivery_status || "PENDIENTE"}
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
      accessorKey: "payment_amount",
      header: "Monto Cobrado",
      cell: ({ row }) => {
        const index = row.original.index;
        const formValues = form.watch(`sales.${index}`);
        const formErrors = form.formState.errors.sales?.[index];

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">S/.</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={parseFloat(row.original.current_amount)}
                placeholder="0.00"
                className={`w-full md:w-[120px] text-right ${
                  formErrors?.payment_amount ? "border-red-500" : ""
                }`}
                value={formValues?.payment_amount || "0"}
                onChange={(e) =>
                  form.setValue(
                    `sales.${index}.payment_amount`,
                    e.target.value,
                    {
                      shouldValidate: true,
                    }
                  )
                }
              />
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
      accessorKey: "delivery_notes",
      header: "Notas",
      cell: ({ row }) => {
        const index = row.original.index;
        const formValues = form.watch(`sales.${index}`);
        const formErrors = form.formState.errors.sales?.[index];

        return (
          <div className="space-y-1">
            <Textarea
              placeholder="Observaciones de entrega..."
              className={`min-w-[200px] resize-none ${
                formErrors?.delivery_notes ? "border-red-500" : ""
              }`}
              rows={2}
              maxLength={500}
              value={formValues?.delivery_notes || ""}
              onChange={(e) =>
                form.setValue(`sales.${index}.delivery_notes`, e.target.value, {
                  shouldValidate: true,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              {(formValues?.delivery_notes || "").length}/500
            </p>
            {formErrors?.delivery_notes && (
              <p className="text-xs text-red-500">
                {formErrors.delivery_notes.message}
              </p>
            )}
          </div>
        );
      },
    },
  ];
}
