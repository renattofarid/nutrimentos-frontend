import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import type { ProductResource } from "@/pages/product/lib/product.interface";
import { ListIcon } from "lucide-react";

const ROUTE = "/lista-precio";
const NAME = "Lista de Precio";

// Configuración principal del modelo
export const PRICELIST: ModelComplete<PriceList> = {
  MODEL: {
    name: NAME,
    description: "Gestión de listas de precio",
    plural: "Listas de Precio",
    gender: true, // true = femenino
  },
  ICON: "ListIcon",
  ICON_REACT: ListIcon,
  ENDPOINT: "/pricelist",
  QUERY_KEY: "pricelist",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Completa los campos para crear una nueva ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Modifica los campos para actualizar la ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `¿Estás seguro de eliminar esta ${NAME.toLowerCase()}?`,
    },
  },
  EMPTY: {
    id: 0,
    name: "",
    code: "",
    description: "",
    is_active: true,
    weight_ranges: [],
    product_prices: [],
    created_at: "",
    updated_at: "",
  },
};

// Weight Range
export interface WeightRange {
  id: number;
  client_category_id: number;
  name: string;
  min_weight: string;
  max_weight: string;
  order: number;
  formatted_range: string;
  created_at: string;
  updated_at: string;
}

export interface WeightRangeRequest {
  name: string;
  min_weight: number;
  max_weight?: number;
  order: number;
}

// Product Price
export interface ProductPrice {
  id: number;
  product_id: number;
  weight_range_id: number;
  client_category_id: number;
  branch_id?: number;
  price: string;
  currency: string;
  is_active: boolean;
  formatted_price: string;
  product: ProductResource;
  created_at: string;
  updated_at: string;
}

export interface ProductPriceRequest {
  product_id: number;
  weight_range_index: number;
  price: number;
  currency: string;
}

// Price List
export interface PriceList {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  weight_ranges: WeightRange[];
  product_prices: ProductPrice[];
  created_at: string;
  updated_at: string;
}

// Request para crear/actualizar
export interface PriceListRequest {
  name: string;
  code?: string;
  description: string;
  is_active: boolean;
  weight_ranges: WeightRangeRequest[];
  product_prices?: ProductPriceRequest[];
}

// Response de la API
export interface PriceListResponse {
  data: PriceList[];
  links: Links;
  meta: Meta;
}

export interface PriceListByIdResponse {
  data: PriceList;
}

// Asignar cliente a lista de precio
export interface AssignClientRequest {
  person_id: string;
}

// Consultar precio
export interface GetPriceRequest {
  person_id: number;
  product_id: number;
  weight: number;
}

export interface AppliedWeightRange {
  id: number;
  client_category_id: number;
  name: string;
  min_weight: string;
  max_weight: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
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

export interface PriceData {
  id: number;
  product_id: number;
  weight_range_id: number;
  client_category_id: number;
  price: string;
  currency: string;
  is_active: boolean;
  branch_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  applied_weight_range: AppliedWeightRange;
  product: Product;
}

export interface GetPriceResponse {
  message: string;
  data: PriceData;
}
