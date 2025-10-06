import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Wallet } from "lucide-react";
import type { PaymentConceptSchema } from "./payment-concept.schema";

const ROUTE = "/conceptos-pago";
const NAME = "Concepto de Pago";

export const PAYMENT_CONCEPT: ModelComplete<PaymentConceptSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de conceptos de pago del sistema.",
    plural: "Conceptos de Pago",
    gender: false,
  },
  ICON: "Wallet",
  ICON_REACT: Wallet,
  ENDPOINT: "/paymentconcept",
  QUERY_KEY: "payment-concepts",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear un nuevo ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar el ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar el ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    name: "",
    type: "INGRESO",
  },
};

export interface PaymentConceptResponse {
  data: PaymentConceptResource[];
  links: Links;
  meta: Meta;
}

export interface PaymentConceptResource {
  id: number;
  name: string;
  type: string;
  created_at: string;
}

export interface PaymentConceptResourceById {
  data: PaymentConceptResource;
}

export interface getPaymentConceptProps {
  params?: Record<string, unknown>;
}
