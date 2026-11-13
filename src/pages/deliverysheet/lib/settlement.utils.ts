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
 *
 * `current_amount` ya es el saldo vigente: descuenta NC y también los pagos
 * ya registrados (ej.: venta 42.20 con pago 20.20 → current 22.00). Por eso
 * NO se le vuelve a restar lo cobrado (antes daba 22.00 - 20.20 = 1.80).
 */
export function getSheetSaleSaldo(sheetSale: SheetSaleAmounts): number {
  return Math.max(0, parseFormattedNumber(sheetSale.current_amount));
}
