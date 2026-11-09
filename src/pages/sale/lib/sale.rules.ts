export const SALE_EDIT_EXPIRED_MESSAGE =
  "Solo se puede editar una venta durante el día en que se creó";

/** Las notas de venta no se envían a SUNAT, por eso no tienen límite de edición. */
export function isNotaVenta(documentType?: string | null): boolean {
  return (documentType ?? "").toUpperCase().replace(/[\s_]+/g, "_") === "NOTA_DE_VENTA" ||
    (documentType ?? "").toUpperCase().replace(/[\s_]+/g, "_") === "NOTA_VENTA";
}

/**
 * Una venta solo se puede editar el mismo día (calendario) en que se creó,
 * salvo las notas de venta, que se pueden editar siempre.
 */
export function isSaleEditable(
  createdAt?: string | null,
  documentType?: string | null,
): boolean {
  if (isNotaVenta(documentType)) return true;
  if (!createdAt) return true;
  const created = new Date(createdAt.replace(" ", "T"));
  if (Number.isNaN(created.getTime())) return true;
  return created.toDateString() === new Date().toDateString();
}
