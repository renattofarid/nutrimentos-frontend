import { type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { SaleWithIndex, SettlementFormSchema } from "./types";

interface SaleTableWithNotesProps {
  sales: SaleWithIndex[];
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
  expandedNotes: Set<number>;
  children: React.ReactNode;
}

export function SaleTableWithNotes({ sales, form, expandedNotes, children }: SaleTableWithNotesProps) {
  const expandedSales = sales.filter(sale => expandedNotes.has(sale.index));

  const getPendingAmount = (sale: SaleWithIndex) => {
    const creditNotesTotal = sale.sale.credit_notes_total_raw || 0;
    const currentAmount = parseFloat(sale.current_amount || "0");
    return currentAmount - creditNotesTotal;
  };

  const allPaid = sales.every((sale) => {
    const formValues = form.watch(`sales.${sale.index}`);
    const pendingAmount = getPendingAmount(sale);
    return parseFloat(formValues?.payment_amount || "0") === pendingAmount;
  });

  const handlePayAll = (checked: boolean) => {
    sales.forEach((sale) => {
      const pendingAmount = getPendingAmount(sale);
      form.setValue(
        `sales.${sale.index}.payment_amount`,
        checked ? pendingAmount.toFixed(2) : "0",
        { shouldValidate: true }
      );
    });
  };

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 px-4 py-3 border rounded-t-md bg-muted/50">
        <Checkbox
          id="pay-all"
          checked={allPaid}
          onCheckedChange={handlePayAll}
        />
        <label
          htmlFor="pay-all"
          className="text-sm font-medium cursor-pointer select-none"
        >
          Pagar todas
        </label>
      </div>
      {children}
      {expandedSales.length > 0 && (
        <div className="border-t">
          {expandedSales.map((sale) => {
            const index = sale.index;
            const formValues = form.watch(`sales.${index}`);
            const formErrors = form.formState.errors.sales?.[index];

            return (
              <div
                key={sale.id}
                className="border-b last:border-b-0 px-4 py-3 bg-muted/30"
              >
                <div className="flex items-start gap-2">
                  <label className="text-xs font-medium text-muted-foreground pt-2 min-w-[140px]">
                    Notas ({sale.sale.full_document_number}):
                  </label>
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Observaciones de entrega..."
                      className={`w-full ${
                        formErrors?.delivery_notes ? "border-red-500" : ""
                      }`}
                      maxLength={200}
                      value={formValues?.delivery_notes || ""}
                      onChange={(e) =>
                        form.setValue(`sales.${index}.delivery_notes`, e.target.value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    {formErrors?.delivery_notes && (
                      <p className="text-xs text-red-500">
                        {formErrors.delivery_notes.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
