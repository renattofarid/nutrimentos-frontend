import { FileText } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { DeliverySheetById } from "../../lib/deliverysheet.interface";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/components/FormInput";

interface DeliverySheetInfoProps {
  form: UseFormReturn;
  deliverySheet: DeliverySheetById;
}

export function DeliverySheetInfo({
  form,
  deliverySheet,
}: DeliverySheetInfoProps) {
  return (
    <GroupFormSection
      title="Información de la Planilla"
      icon={FileText}
      cols={{ sm: 1, md: 3, lg: 4 }}
    >
      <FormInput
        name="zone"
        label="Zona de Entrega"
        value={deliverySheet.zone?.name || "Sin zona"}
        readOnly
        disabled
      />

      <DatePickerFormField
        control={form.control}
        name="payment_date"
        label="Fecha de Pago"
        placeholder="Selecciona la fecha de pago"
        dateFormat="dd/MM/yyyy"
        captionLayout="dropdown"
      />

      <FormInput
        name="observations"
        label="Observaciones de la Planilla"
        placeholder="Ingresa las observaciones de la planilla"
      />
    </GroupFormSection>
  );
}
