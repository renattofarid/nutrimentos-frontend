import { SUPPLIER, SUPPLIER_ROLE_CODE } from "./supplier.interface";
import { useQuery } from "@tanstack/react-query";
import { getPersons } from "@/pages/person/lib/person.actions";

const { QUERY_KEY } = SUPPLIER;

export function useSuppliers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      getPersons({
        params: {
          ...params,
          role_names: [SUPPLIER_ROLE_CODE],
        },
      }),
  });
}
