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
      
    </GroupFormSection>
  );
}
