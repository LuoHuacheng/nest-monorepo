import { useQuery } from "@tanstack/react-query";
import { Logs, type LogControllerFindAllData } from "@match/api-client";
import type { PaginatedResponse, QueryOf } from "@/api/types";

export type LogListQuery = QueryOf<LogControllerFindAllData>;

export const logKeys = {
  all: ["logs"] as const,
  list: (params?: LogListQuery) => [...logKeys.all, "list", params] as const,
};

export function useLogList(params?: LogListQuery) {
  return useQuery({
    queryKey: logKeys.list(params),
    queryFn: async () => {
      const { data } = await Logs.logControllerFindAll(params ? { query: params } : undefined);
      return data as PaginatedResponse;
    },
  });
}
