import type { Links, Meta } from "@/lib/pagination.interface";
import type { DocumentType } from "./warehouse-document.interface";

// Kardex Movement Type
export type MovementType = "INGRESO" | "EGRESO";

// Kardex Resource
export interface WarehouseKardexResource {
  id: number;
  movement_type: MovementType;
  document_type: DocumentType;
  document_number: string;
  movement_date: string;
  movement_date_formatted: string;
  product_id: number;
  product: {
    id: number;
    name: string;
    codigo: string;
    sku: string | null;
    unit: {
      id: number;
      name: string;
      code: string;
    };
    weight: number;
  };
  warehouse_id: number;
  warehouse: {
    id: number;
    name: string;
    code: string | null;
  };
  quantity_sacks_in: number;
  quantity_kg_in: number;
  quantity_in: number;
  unit_cost_in: number;
  total_cost_in: number;
  quantity_sacks_out: number;
  quantity_kg_out: number;
  quantity_out: number;
  unit_cost_out: number;
  total_cost_out: number;
  balance_quantity: number;
  balance_sacks: number;
  balance_kg: number;
  balance_unit_cost: number;
  balance_total_cost: number;
  warehouse_document_id: number | null;
  sale_id: number | null;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string | null;
  };
  observations: string | null;
  created_at: string;
  created_at_formatted: string;
}

// Kardex Response
export interface WarehouseKardexResponse {
  data: WarehouseKardexResource[];
  links: Links;
  meta: Meta;
}

// Kardex by Product
export interface KardexByProductMovement {
  id: number;
  document_type: DocumentType;
  document_number: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  previous_balance: number;
  new_balance: number;
  document_date: string;
  warehouse_name: string;
  created_at: string;
}

export interface KardexByProductResource {
  product_id: number;
  product_name: string;
  movements: KardexByProductMovement[];
}

export interface KardexByProductResponse {
  data: KardexByProductResource;
}

// Valuated Inventory - Same structure as WarehouseKardexResource
export type ValuatedInventoryItem = WarehouseKardexResource;

export interface ValuatedInventoryResponse {
  data: ValuatedInventoryItem[];
  links: Links;
  meta: Meta;
}

// Query Props
export interface GetWarehouseKardexProps {
  params?: {
    page?: number;
    per_page?: number;
    warehouse_id?: number;
    product_id?: number;
    document_type?: DocumentType;
    from?: string;
    to?: string;
    movement_type?: MovementType;
  };
}
