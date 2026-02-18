import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientStore } from "./client.store";
import { CLIENT, CLIENT_ROLE_CODE } from "./client.interface";
import { getPersons } from "@/pages/person/lib/person.actions";

const { QUERY_KEY } = CLIENT;

export function useClients(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      getPersons({
        params: {
          ...params,
          role_names: [CLIENT_ROLE_CODE],
        },
      }),
  });
}

export function useAllClients(params?: Record<string, unknown>) {
  const { allClients, meta, isLoadingAll, error, fetchAllClients } =
    useClientStore();

  useEffect(() => {
    if (!allClients) {
      fetchAllClients({ params });
    }
  }, [allClients, fetchAllClients]);

  return {
    data: allClients,
    meta,
    isLoading: isLoadingAll,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      return fetchAllClients({ params: refetchParams });
    },
  };
}
