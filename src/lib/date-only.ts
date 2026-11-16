import { parse } from "date-fns";

/**
 * Convierte una fecha "yyyy-MM-dd" (o ISO con hora) en un Date local.
 * `new Date("2026-11-16")` se toma como UTC y en Perú (UTC-5) muestra el día anterior.
 */
export function parseDateOnly(value: string): Date {
  return parse(value.slice(0, 10), "yyyy-MM-dd", new Date());
}
