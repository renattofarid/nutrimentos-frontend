import { useEffect } from "react";
import { useClientStore } from "./client.store";

export function useClients(params?: Record<string, unknown>) {
  const { clients, meta, isLoading, error, fetchClients } = useClientStore();

  useEffect(() => {
    if (!clients) {
      fetchClients({ params });
    }
  }, [clients, fetchClients]);

  return {
    data: clients,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      return fetchClients({ params: refetchParams });
    },
  };
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
