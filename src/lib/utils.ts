import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Trunca (sin redondear) un número a `decimals` decimales.
 * Ej: truncDecimal(1.23456789, 6) => 1.234567
 */
export function truncDecimal(value: number, decimals = 6): number {
  if (!isFinite(value) || isNaN(value)) return value;
  const factor = Math.pow(10, decimals);
  return Math.trunc(value * factor) / factor;
}

/**
 * Formatea un número truncado a `decimals` decimales y devuelve string con esos decimales.
 * Usa truncDecimal internamente para evitar cualquier redondeo.
 */
export function formatDecimalTrunc(value: number, decimals = 6): string {
  const v = truncDecimal(value, decimals);
  // toFixed aquí no redondeará porque ya truncamos
  return v.toFixed(decimals);
}

/**
 * Parsea un string numérico que puede tener formato con separadores de miles (comas)
 * y lo convierte a número.
 * Ej: parseFormattedNumber("1,200.00") => 1200
 * Ej: parseFormattedNumber("1200.00") => 1200
 */
export function parseFormattedNumber(value: string): number {
  if (!value || typeof value !== "string") return 0;
  // Remover comas (separadores de miles)
  const cleanedValue = value.replace(/,/g, "");
  return parseFloat(cleanedValue) || 0;
}
