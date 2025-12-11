// ============================================
// GUIDE - Interfaces, Types & Routes
// ============================================

// ===== API RESOURCES =====

export interface GuideDetailResource {
  id: number;
  sale_shipping_guide_id: number;
  product_id: number;
  quantity: number;
  unit_code: string;
  description: string;
  product: Product;
  created_at: string;
}

export interface GuideMotiveResource {
  id: number;
  code: string;
  name: string;
}

export interface GuideResource {
  id: number;
  company_id: number;
  branch_id: number;
  warehouse_id: number;
  sale_id?: string;
  customer_id: number;
  user_id: number;
  serie: string;
  numero: string;
  full_document_number: string;
  issue_date: string;
  transfer_date: string;
  modality: string;
  motive_id: number;
  sale_document_number: string;
  carrier_document_type: string;
  carrier_document_number: string;
  carrier_name: string;
  carrier_ruc: string;
  carrier_mtc_number: string;
  vehicle_plate?: string;
  driver_document_type?: string;
  driver_document_number?: string;
  driver_name?: string;
  driver_license?: string;
  origin_address: string;
  origin_ubigeo: string;
  destination_address: string;
  destination_ubigeo: string;
  unit_measurement: string;
  total_weight: number;
  total_packages: number;
  status: string;
  is_electronic: boolean;
  observations: string;
  ubigeo_origin_id: number;
  ubigeo_destination_id: number;
  company: Company;
  branch: Branch;
  warehouse: Branch;
  customer: Customer;
  user: User;
  motive: GuideMotiveResource;
  sale?: string;
  details: GuideDetailResource[];
  electronic_document?: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  codigo: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
}

interface Customer {
  id: number;
  names: string;
  father_surname: string;
  mother_surname: string;
  full_name: string;
  number_document: string;
  business_name: string;
  address: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
}

interface Company {
  id: number;
  social_reason: string;
  trade_name: string;
  ruc: string;
}

export interface GuideResourceById {
  data: GuideResource;
}

// ===== API RESPONSES =====

export interface GuideResponse {
  current_page: number;
  data: GuideResource[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface GuideMotiveResponse {
  data: GuideMotiveResource[];
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateGuideDetailRequest {
  product_id: number;
  quantity: number;
  unit_code: string;
  description: string;
}

export interface CreateGuideRequest {
  company_id: number;
  branch_id: number;
  warehouse_id: number;
  sale_id?: number | null;
  customer_id: number;
  issue_date: string;
  transfer_date: string;
  modality: string;
  motive_id: number;
  sale_document_number: string;
  carrier_document_type: string;
  carrier_document_number: string;
  carrier_name: string;
  carrier_ruc: string;
  carrier_mtc_number: string;
  vehicle_plate?: string | null;
  driver_document_type?: string | null;
  driver_document_number?: string | null;
  driver_name?: string | null;
  driver_license?: string | null;
  origin_address: string;
  origin_ubigeo: string;
  destination_address: string;
  destination_ubigeo: string;
  unit_measurement: string;
  total_weight: number;
  total_packages: number;
  observations?: string;
  details: CreateGuideDetailRequest[];
}

export interface UpdateGuideRequest {
  company_id?: number;
  branch_id?: number;
  warehouse_id?: number;
  sale_id?: number | null;
  customer_id?: number;
  issue_date?: string;
  transfer_date?: string;
  modality?: string;
  motive_id?: number;
  sale_document_number?: string;
  carrier_document_type?: string;
  carrier_document_number?: string;
  carrier_name?: string;
  carrier_ruc?: string;
  carrier_mtc_number?: string;
  vehicle_plate?: string | null;
  driver_document_type?: string | null;
  driver_document_number?: string | null;
  driver_name?: string | null;
  driver_license?: string | null;
  origin_address?: string;
  origin_ubigeo?: string;
  destination_address?: string;
  destination_ubigeo?: string;
  unit_measurement?: string;
  total_weight?: number;
  total_packages?: number;
  observations?: string;
  details?: CreateGuideDetailRequest[];
}

// ===== CONSTANTS =====

export const GUIDE_ENDPOINT = "/guide";
export const GUIDE_MOTIVE_ENDPOINT = "/guide-motives";

export const GUIDE_QUERY_KEY = "guides";
export const GUIDE_MOTIVE_QUERY_KEY = "guide-motives";

// ===== ROUTES =====

export const GuideRoute = "/guias";
export const GuideAddRoute = "/guias/agregar";
export const GuideEditRoute = "/guias/actualizar/:id";
export const GuideDetailRoute = "/guias/:id";

// ===== STATUS & TYPE OPTIONS =====

export const MODALITIES = [
  { value: "PUBLICO", label: "Transporte Público" },
  { value: "PRIVADO", label: "Transporte Privado" },
] as const;

export const CARRIER_DOCUMENT_TYPES = [
  { value: "DNI", label: "DNI" },
  { value: "RUC", label: "RUC" },
] as const;

export const DRIVER_DOCUMENT_TYPES = [
  { value: "DNI", label: "DNI" },
  { value: "RUC", label: "RUC" },
  { value: "CARNET_EXT", label: "Carnet de Extranjería" },
] as const;

export const UNIT_MEASUREMENTS = [
  { value: "KGM", label: "Kilogramos (KGM)" },
  { value: "TNE", label: "Toneladas (TNE)" },
  { value: "GRM", label: "Gramos (GRM)" },
  { value: "NIU", label: "Unidades (NIU)" },
] as const;

export const GUIDE_STATUSES = [
  { value: "REGISTRADA", label: "Registrada" },
  { value: "ENVIADA", label: "Enviada" },
  { value: "ACEPTADA", label: "Aceptada" },
  { value: "RECHAZADA", label: "Rechazada" },
  { value: "ANULADA", label: "Anulada" },
] as const;

// ===== MODEL COMPLETE =====

import type { ModelComplete } from "@/lib/core.interface";
import { Truck } from "lucide-react";
import type { GuideSchema } from "./guide.schema";

const NAME = "Guía de Remisión";

export const GUIDE: ModelComplete<GuideSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de guías de remisión del sistema.",
    plural: "Guías de Remisión",
    gender: false,
  },
  ICON: "Truck",
  ICON_REACT: Truck,
  ENDPOINT: GUIDE_ENDPOINT,
  QUERY_KEY: GUIDE_QUERY_KEY,
  ROUTE: GuideRoute,
  ROUTE_ADD: GuideAddRoute,
  ROUTE_UPDATE: GuideEditRoute,
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
  EMPTY: {} as any,
};
