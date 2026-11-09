/**
 * La fecha de emisión llega como "yyyy-MM-dd" (sin hora). `new Date("2026-11-09")`
 * la interpreta como UTC y en Perú (UTC-5) mostraría el día anterior, así que
 * se toman los componentes directamente del texto.
 */
export function formatIssueDate(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "yyyy-MM-dd" para inputs de fecha (descarta hora/zona si viene ISO completo). */
export function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : "";
}
