import type { UseFormReturn } from "react-hook-form";
import { FileCheck } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { GroupFormSection } from "@/components/GroupFormSection";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { cn } from "@/lib/utils";
import type { SettlementFormSchema } from "./types";

interface SettlementFormFieldsProps {
  form: UseFormReturn<SettlementFormSchema, any, undefined>;
}

export function SettlementFormFields({ form }: SettlementFormFieldsProps) {
  return (
    <GroupFormSection
      title="Datos de Rendición"
      icon={FileCheck}
      cols={{ sm: 1, md: 2, lg: 2 }}
    >
      <DatePickerFormField
        control={form.control}
        name="payment_date"
        label="Fecha de Pago"
        placeholder="Selecciona la fecha de pago"
        dateFormat="dd/MM/yyyy"
        captionLayout="dropdown"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Observaciones Generales</label>
        <Textarea
          placeholder="Observaciones generales de la rendición..."
          rows={3}
          maxLength={500}
          {...form.register("observations")}
          className={cn(
            "text-xs",
            form.formState.errors.observations ? "border-red-500" : ""
          )}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {(form.watch("observations") || "").length}/500 caracteres
          </p>
          {form.formState.errors.observations && (
            <p className="text-xs text-red-500">
              {form.formState.errors.observations.message}
            </p>
          )}
        </div>
      </div>
    </GroupFormSection>
  );
}
