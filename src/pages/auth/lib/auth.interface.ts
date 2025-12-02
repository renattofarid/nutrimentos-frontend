export interface AuthResponse {
  token: string;
  user: User;
  role: string;
  access: Access[];
  message: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  person_id: number;
  person: Person;
  rol_id: number;
  rol_name: string;
  boxes: Box[];
}

export interface Person {
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
  job_position_id?: string;
  business_type_id?: string;
  zone_id?: string;
  created_at: string;
  document_type_id?: string;
}

export interface Access {
  id: number;
  name: string;
  icon: string;
  nivel: number;
  permissions: Permission[];
  children?: Access[];
}

export interface Permission {
  name: string;
  actions: string[];
  routes: string[];
  status: string;
}

export interface Box {
  id: number;
  name: string;
  status: string;
  serie: string;
  branch_id: number;
  branch_name: string;
  created_at: string;
}
