import { useEffect } from "react";
import { useDriverStore } from "./driver.store";
import { useQuery } from "@tanstack/react-query";
import { DRIVER, DRIVER_ROLE_CODE } from "./driver.interface";
import { getPersons } from "@/pages/person/lib/person.actions";

const { QUERY_KEY } = DRIVER;

export function useDrivers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      getPersons({
        params: {
          ...params,
          role_names: [DRIVER_ROLE_CODE],
        },
      }),
  });
}

export function useAllDrivers(params?: Record<string, unknown>) {
  const { allDrivers, fetchAllDrivers } = useDriverStore();
  useEffect(() => {
    if (!allDrivers) {
      fetchAllDrivers(params);
    }
  }, [allDrivers, fetchAllDrivers, params]);
  return {
    data: allDrivers,
    refetch: () => fetchAllDrivers(params),
  };
}
