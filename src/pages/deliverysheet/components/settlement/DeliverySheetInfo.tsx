import { User, MapPin, Calendar, FileText } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import type { DeliverySheetResource } from "../../lib/deliverysheet.interface";

interface DeliverySheetInfoProps {
  deliverySheet: DeliverySheetResource;
}

export function DeliverySheetInfo({ deliverySheet }: DeliverySheetInfoProps) {
  return (
    <GroupFormSection
      title="Información de la Planilla"
      icon={FileText}
      cols={{ sm: 1, md: 3, lg: 3 }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <User className="h-4 w-4" />
          <span>Conductor</span>
        </div>
        <p className="font-medium text-base">
          {deliverySheet.driver?.full_name || "Sin conductor"}
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="h-4 w-4" />
          <span>Zona de Entrega</span>
        </div>
        <p className="font-medium text-base">
          {deliverySheet.zone?.name || "Sin zona"}
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="h-4 w-4" />
          <span>Fecha de Entrega</span>
        </div>
        <p className="font-medium text-base">
          {deliverySheet.delivery_date}
        </p>
      </div>
    </GroupFormSection>
  );
}
