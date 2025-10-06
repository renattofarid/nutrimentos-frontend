import { Settings } from "lucide-react";

export const SETTING = {
  MODEL: {
    name: "Configuración",
    plural: "Configuraciones",
  },
  ROUTE: "/configuracion",
  ENDPOINT: "/setting",
  ICON_REACT: Settings,
};

export interface SettingResource {
  id: number;
  branch_id: number;
  branch_name: string;
  allow_multiple_prices: number;
  allow_invoice: number;
  allow_negative_stock: number;
  default_currency: string;
  tax_percentage: string;
  created_at: string;
}
