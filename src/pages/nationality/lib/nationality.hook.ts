import { useEffect } from "react";
import { useNationalityStore } from "./nationality.store";

export function useNationality(params?: Record<string, unknown>) {
  const { nationalities, meta, isLoading, error, fetchNationalities } =
    useNationalityStore();

  useEffect(() => {
    if (!nationalities) fetchNationalities({ ...params });
  }, [nationalities, fetchNationalities]);

  return {
    data: nationalities,
    meta,
    isLoading,
    error,
    refetch: fetchNationalities,
  };
}

export function useAllNationalities() {
  const { allNationalities, fetchAllNationalities } = useNationalityStore();

  useEffect(() => {
    if (!allNationalities) {
      fetchAllNationalities();
    }
  }, [allNationalities, fetchAllNationalities]);

  return {
    data: allNationalities,
    refetch: fetchAllNationalities,
  };
}

export function useNationalityById(id: number) {
  const { nationality, isFinding, error, fetchNationality } =
    useNationalityStore();

  useEffect(() => {
    if (id) {
      fetchNationality(id);
    }
  }, [id, fetchNationality]);

  return {
    data: nationality,
    isFinding,
    error,
    refetch: () => fetchNationality(id),
  };
}
