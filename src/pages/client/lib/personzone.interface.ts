import type { ZoneResource } from "@/pages/zone/lib/zone.interface";

export interface PersonZonePerson {
  id: number;
  names: string;
  full_name: string;
}

export interface PersonZoneResource {
  id: number;
  person_id: number;
  zone_id: number;
  address: string;
  is_primary: boolean;
  person: PersonZonePerson;
  zone: ZoneResource;
  created_at: string;
}

export interface PersonZoneCreateRequest {
  person_id: number;
  zone_id: number;
  address: string;
  is_primary?: boolean;
}

export interface PersonZoneUpdateRequest {
  zone_id: number;
  address: string;
  is_primary?: boolean;
}

export interface PersonZoneResponse {
  data: PersonZoneResource;
}

export interface PersonZonesResponse {
  data: PersonZoneResource[];
}
