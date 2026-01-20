import { z } from "zod";

export const personZoneSchema = z.object({
  zone_id: z.string().min(1, "La zona es requerida"),
  address: z.string().min(1, "La dirección es requerida"),
  is_primary: z.boolean().optional(),
});

export type PersonZoneSchema = z.infer<typeof personZoneSchema>;
