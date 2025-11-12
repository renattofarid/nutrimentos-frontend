import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Calendar } from "lucide-react";

const ROUTE = "/cuota-compra";
const NAME = "Cuota de Compra";

export const PURCHASE_INSTALLMENT: ModelComplete<PurchaseInstallmentResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de cuotas de compras a crédito.",
    plural: "Cuotas de Compra",
    gender: false,
  },
  ICON: "Calendar",
  ICON_REACT: Calendar,
  ENDPOINT: "/purchaseinstallment",
  QUERY_KEY: "purchaseinstallments",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear una nueva ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar la ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar la ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    id: 0,
    correlativo: "",
    purchase_id: 0,
    purchase_correlativo: "",
    installment_number: 0,
    due_days: 0,
    due_date: "",
    amount: "0.00",
    pending_amount: "0.00",
    status: "PENDIENTE",
    created_at: "",
  },
};

export interface PurchaseInstallmentResponse {
  data: PurchaseInstallmentResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseInstallmentResource {
  id: number;
  correlativo: string;
  purchase_id: number;
  purchase_correlativo: string;
  installment_number: number;
  due_days: number;
  due_date: string;
  amount: string;
  pending_amount: string;
  status: string;
  created_at: string;
}

export interface PurchaseInstallmentResourceById {
  data: PurchaseInstallmentResource;
}

export interface getPurchaseInstallmentProps {
  params?: Record<string, any>;
}

export interface ExpiringAlertsResponse {
  data: PurchaseInstallmentResource[];
}

export type InstallmentStatus = "PENDIENTE" | "PAGADA" | "VENCIDA";
