import { useEffect } from "react";
import { useZoneStore } from "./zone.store";
import { useQuery } from "@tanstack/react-query";
import { ZONE } from "./zone.interface";
import { getZone } from "./zone.actions";

const { QUERY_KEY } = ZONE;

export function useZone(params?: Record<string, unknown>) {
  const { zones, meta, isLoading, error, fetchZones } = useZoneStore();

  useEffect(() => {
    if (!zones) fetchZones(params);
  }, [zones, fetchZones]);

  return {
    data: zones,
    meta,
    isLoading,
    error,
    refetch: fetchZones,
  };
}

export function useZoneSearch(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      getZone({
        params,
      }),
  });
}

export function useAllZones() {
  const { allZones, isLoadingAll, error, fetchAllZones } = useZoneStore();

  useEffect(() => {
    if (!allZones) fetchAllZones();
  }, [allZones, fetchAllZones]);

  return {
    data: allZones,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllZones,
  };
}

export function useZoneById(id: number) {
  const { zone, isFinding, error, fetchZone } = useZoneStore();

  useEffect(() => {
    fetchZone(id);
  }, [id]);

  return {
    data: zone,
    isFinding,
    error,
    refetch: () => fetchZone(id),
  };
}
