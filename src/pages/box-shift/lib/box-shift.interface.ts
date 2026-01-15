import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Wallet } from "lucide-react";

const ROUTE = "/turnos-caja";
const NAME = "Turno de Caja";

export const BOX_SHIFT: ModelComplete<BoxShiftResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de de caja chica",
    plural: "Caja Chica",
    gender: false,
  },
  ICON: "Wallet",
  ICON_REACT: Wallet,
  ENDPOINT: "/boxshift",
  QUERY_KEY: "box-shifts",
  ROUTE: ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Abrir ${NAME}`,
      subtitle: "Complete los campos para abrir un nuevo turno de caja",
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: "Actualice la información del turno de caja",
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: "¿Está seguro de eliminar este turno de caja?",
    },
  },
  EMPTY: {
    id: 0,
    box_id: 0,
    user_id: 0,
    open_date: "",
    close_date: "",
    box: {} as Box,
    user: {} as User,
    started_amount: 0,
    closed_amount: 0,
    status: "ABIERTO",
    observation: "",
    total_income: 0,
    total_outcome: 0,
    expected_balance: 0,
    difference: 0,
    is_open: true,
    is_closed: false,
    created_at: "",
    updated_at: "",
  },
};

export interface BoxShiftResource {
  id: number;
  box_id: number;
  box: Box;
  user_id: number;
  user: User;
  open_date: string;
  close_date?: string;
  started_amount: number;
  closed_amount: number;
  status: string;
  observation?: string;
  total_income: number;
  total_outcome: number;
  expected_balance: number;
  difference: number;
  is_open: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  company_id: number;
  company: string;
  person_id: number;
  person: Person;
  rol_id: number;
  rol_name: string;
}

interface Person {
  id: number;
  number_document: string;
  type_person: string;
  names: string;
  father_surname: string;
  mother_surname: string;
  gender?: string;
  birth_date?: string;
  phone: string;
  email: string;
  address: string;
  business_name: string;
  commercial_name: string;
  occupation: string;
  job_position_id?: number;
  business_type_id?: number;
  zone_id?: number;
  created_at: string;
  document_type_id?: number;
}

interface Box {
  id: number;
  name: string;
  status: string;
  serie: string;
  branch_id: number;
  branch_name: string;
  created_at: string;
}

export interface BoxShiftResponse {
  data: BoxShiftResource[];
  links: Links;
  meta: Meta;
}

export interface BoxShiftResourceById {
  data: BoxShiftResource;
}

export interface GetBoxShiftProps {
  params?: {
    box_id?: number;
    user_id?: number;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
    search?: string;
  };
}

export interface CreateBoxShiftProps {
  box_id: number;
  started_amount: number;
  observation?: string;
}

export interface CloseBoxShiftProps {
  box_id: number;
  closed_amount: number;
  observation?: string;
}
