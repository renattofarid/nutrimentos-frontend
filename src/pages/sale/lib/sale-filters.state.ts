import { useCallback, useState } from "react";

// Memoria a nivel de módulo: sobrevive al desmontaje de SalePage
// (al ir a crear/editar una venta y volver al listado).
const store = new Map<string, unknown>();

export function usePersistedFilter<T>(
  key: string,
  initial: T | (() => T),
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (store.has(key)) return store.get(key) as T;
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      store.set(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, set];
}

export function clearSaleFilters() {
  store.clear();
}
