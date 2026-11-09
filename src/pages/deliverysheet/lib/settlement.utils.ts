import { parseFormattedNumber } from "@/lib/utils";

interface SheetSaleAmounts {
  current_amount: string;
  collected_amount: string;
  sale: { credit_notes_total_raw?: number | null };
}

/**
 * Saldo realmente pendiente de cobro de una venta de la planilla.
 *
 * El backend ya descuenta las notas de crédito en `current_amount` y además
 * las suma a `collected_amount` (las trata como "cobradas"). Para no restarlas
 * dos veces, al monto cobrado se le quita lo que corresponde a notas de crédito.
 * Ej.: venta 266.20 con NC 214 → current 52.20, collected 214 → saldo 52.20.
 */
export function getSheetSaleSaldo(sheetSale: SheetSaleAmounts): number {
  const current = parseFormattedNumber(sheetSale.current_amount);
  const collected = parseFormattedNumber(sheetSale.collected_amount);
  const nc = sheetSale.sale.credit_notes_total_raw || 0;
  const realCollected = Math.max(0, collected - nc);
  return Math.max(0, current - realCollected);
}
