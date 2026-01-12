// ============================================
// CREDIT NOTE MOTIVE - Interfaces & Types
// ============================================

import type { Links, Meta } from "@/lib/pagination.interface";

// ===== API RESOURCES =====

export interface CreditNoteMotiveResource {
  id: number;
  code: string;
  name: string;
  active: number;
}

export interface CreditNoteMotiveResourceById {
  data: CreditNoteMotiveResource;
}

// ===== API RESPONSES =====

export interface CreditNoteMotiveResponse {
  data: CreditNoteMotiveResource[];
  meta: Meta;
  links: Links;
}

// ===== QUERY PROPS =====

export interface getCreditNoteMotiveProps {
  params?: Record<string, any>;
}

// ===== CONSTANTS =====

export const CREDIT_NOTE_MOTIVE_ENDPOINT = "/credit-note-motives";
