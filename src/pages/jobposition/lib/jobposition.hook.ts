import { useEffect } from "react";
import { useJobPositionStore } from "./jobposition.store";

export function useJobPosition(params?: Record<string, unknown>) {
  const { jobPositions, meta, isLoading, error, fetchJobPositions } =
    useJobPositionStore();

  useEffect(() => {
    if (!jobPositions) fetchJobPositions(params);
  }, [jobPositions, fetchJobPositions]);

  return {
    data: jobPositions,
    meta,
    isLoading,
    error,
    refetch: fetchJobPositions,
  };
}

export function useAllJobPositions() {
  const { allJobPositions, isLoadingAll, error, fetchAllJobPositions } =
    useJobPositionStore();

  useEffect(() => {
    if (!allJobPositions) fetchAllJobPositions();
  }, [allJobPositions, fetchAllJobPositions]);

  return {
    data: allJobPositions,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllJobPositions,
  };
}

export function useJobPositionById(id: number) {
  const { jobPosition, isFinding, error, fetchJobPosition } = useJobPositionStore();

  useEffect(() => {
    fetchJobPosition(id);
  }, [id]);

  return {
    data: jobPosition,
    isFinding,
    error,
    refetch: () => fetchJobPosition(id),
  };
}
