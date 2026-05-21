import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Results, type ResultControllerFindAllData } from "@match/api-client";
import type { PaginatedResponse, QueryOf } from "@/api/types";

export type ResultListQuery = QueryOf<ResultControllerFindAllData>;

export const resultKeys = {
  all: ["results"] as const,
  list: (params?: ResultListQuery) => [...resultKeys.all, "list", params] as const,
};

export interface ResultQuery {
  eventId?: string;
  page?: number;
  pageSize?: number;
}

export function useResults(params?: ResultQuery) {
  return useQuery({
    queryKey: resultKeys.list(params),
    queryFn: async () => {
      const query: ResultQuery = {};
      if (params?.eventId) query.eventId = params.eventId;
      if (params?.page) query.page = params.page;
      if (params?.pageSize) query.pageSize = params.pageSize;

      const { data } = await Results.resultControllerFindAll({
        query: Object.keys(query).length > 0 ? query : undefined,
      });
      return data as PaginatedResponse;
    },
  });
}

export function useImportResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      eventId: string;
      results: { bibNumber: string; finishTime: string; rank?: number }[];
    }) => {
      const { data } = await Results.resultControllerImportResults({
        body,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: resultKeys.all }),
  });
}
