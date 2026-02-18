import { useEffect } from "react";
import { usePersonStore } from "@/pages/person/lib/person.store";
import { WORKER, WORKER_ROLE_CODE } from "./worker.interface";
import { useQuery } from "@tanstack/react-query";
import { getPersons } from "@/pages/person/lib/person.actions";

const { QUERY_KEY } = WORKER;

export function useWorkers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      getPersons({
        params: {
          ...params,
          role_names: [WORKER_ROLE_CODE],
        },
      }),
  });
}

export function useAllWorkers(params?: Record<string, unknown>) {
  const { allWorkers, fetchAllWorkers, isLoadingAllWorkers } = usePersonStore();
  useEffect(() => {
    if (!allWorkers) {
      const workerParams = {
        ...params,
        role_names: [WORKER_ROLE_CODE],
      };
      fetchAllWorkers({ params: workerParams });
    }
  }, [allWorkers, fetchAllWorkers]);
  return { data: allWorkers, isLoading: isLoadingAllWorkers };
}
