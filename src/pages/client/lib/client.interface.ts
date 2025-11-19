import type { ModelComplete } from "@/lib/core.interface";
import { Users } from "lucide-react";

const ROUTE = "/clientes";
const NAME = "Cliente";

export const CLIENT: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de clientes del sistema.",
    plural: "Clientes",
    gender: false,
  },
  ICON: "Users",
  ICON_REACT: Users,
  ENDPOINT: "/person",
  QUERY_KEY: "clients",
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
  EMPTY: {},
};

export const CLIENT_ROLE_CODE = "Cliente";
export const CLIENT_ROLE_ID = 1;

// Interfaces para la lista de precios del cliente
export interface ClientPriceListWeightRange {
  id: number;
  client_category_id: number;
  name: string;
  min_weight: string;
  max_weight: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ClientPriceList {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  weight_ranges: ClientPriceListWeightRange[];
}

export interface ClientPriceProduct {
  id: number;
  company_id: number;
  codigo: string;
  name: string;
  category_id: number;
  product_type_id: number;
  brand_id: number;
  unit_id: number;
  is_taxed: number;
  supplier_id: number;
  comment: string;
  nationality_id: number;
  created_at: string;
}

export interface ClientProductPrice {
  id: number;
  product_id: number;
  weight_range_id: number;
  client_category_id: number;
  price: string;
  currency: string;
  is_active: boolean;
  branch_id: null | number;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  product: ClientPriceProduct;
}

export interface ClientPriceListData {
  price_list: ClientPriceList;
  products: ClientProductPrice[];
  total_products: number;
}

export interface ClientPriceListResponse {
  message: string;
  data: ClientPriceListData;
}