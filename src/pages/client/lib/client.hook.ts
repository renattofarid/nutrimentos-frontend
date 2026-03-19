import { useQuery } from "@tanstack/react-query";
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
