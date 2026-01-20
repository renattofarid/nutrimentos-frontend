import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export const DELIVERY_STATUS_OPTIONS = [
  {
    value: "ENTREGADO",
    label: "Entregado",
    icon: CheckCircle2,
    color: "bg-green-500",
  },
  {
    value: "NO_ENTREGADO",
    label: "No Entregado",
    icon: XCircle,
    color: "bg-red-500",
  },
  {
    value: "DEVUELTO",
    label: "Devuelto",
    icon: ArrowLeft,
    color: "bg-orange-500",
  },
  {
    value: "ANULADO",
    label: "Anulado",
    icon: XCircle,
    color: "bg-gray-500",
  },
];
