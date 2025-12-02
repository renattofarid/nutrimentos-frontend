import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { CLIENT_ROLE_CODE } from "./client.interface";

export function useClients(params?: Record<string, unknown>) {
  const { persons, meta, isLoading, error, fetchPersons } = usePersonStore();

  useEffect(() => {
    if (!persons) {
      // Add role filter for clients
      const clientParams = {
        ...params,
        role_names: [CLIENT_ROLE_CODE],
      };
      fetchPersons({ params: clientParams });
    }
  }, [persons, fetchPersons]);

  return {
    data: persons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      const clientParams = {
        ...refetchParams,
        role_names: [CLIENT_ROLE_CODE],
      };
      return fetchPersons({ params: clientParams });
    },
  };
}

export function useAllClients(params?: Record<string, unknown>) {
  const { allPersons, meta, isLoading, error, fetchAllPersons } =
    usePersonStore();

  useEffect(() => {
    if (!allPersons) {
      // Add role filter for clients
      const clientParams = {
        ...params,
        role_names: [CLIENT_ROLE_CODE],
      };
      fetchAllPersons({ params: clientParams });
    }
  }, [allPersons, fetchAllPersons]);

  return {
    data: allPersons,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      const clientParams = {
        ...refetchParams,
        role_names: [CLIENT_ROLE_CODE],
      };
      return fetchAllPersons({ params: clientParams });
    },
  };
}
