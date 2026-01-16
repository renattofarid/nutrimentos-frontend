import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { useCarrierStore } from "./carrier.store";
import { CARRIER_ROLE_CODE } from "./carrier.interface";

export function useCarriers(params?: Record<string, unknown>) {
  const { persons, meta, isLoading, error, fetchPersons } = usePersonStore();

  useEffect(() => {
    if (!persons) {
      // Add role filter for carriers
      const carrierParams = {
        ...params,
        role_names: [CARRIER_ROLE_CODE],
      };
      fetchPersons({ params: carrierParams });
    }
  }, [persons, fetchPersons]);

  return {
    data: persons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      const carrierParams = {
        ...refetchParams,
        role_names: [CARRIER_ROLE_CODE],
      };
      return fetchPersons({ params: carrierParams });
    },
  };
}

export function useAllCarriers(params?: Record<string, unknown>) {
  const { allCarriers, fetchAllCarriers } = useCarrierStore();
  useEffect(() => {
    if (!allCarriers) {
      fetchAllCarriers(params);
    }
  }, [allCarriers, fetchAllCarriers, params]);
  return {
    data: allCarriers,
    refetch: () => fetchAllCarriers(params),
  };
}
