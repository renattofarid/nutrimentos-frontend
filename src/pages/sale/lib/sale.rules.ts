export const SALE_EDIT_EXPIRED_MESSAGE =
  "Solo se puede editar una venta durante el día en que se creó";

/** Una venta solo se puede editar el mismo día (calendario) en que se creó. */
export function isSaleEditable(createdAt?: string | null): boolean {
  if (!createdAt) return true;
  const created = new Date(createdAt.replace(" ", "T"));
  if (Number.isNaN(created.getTime())) return true;
  return created.toDateString() === new Date().toDateString();
}
