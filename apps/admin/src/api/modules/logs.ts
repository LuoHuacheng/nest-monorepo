import { useQuery } from "@tanstack/react-query";
import { Logs } from "@match/api-client";

export const logKeys = {
  all: ["logs"] as const,
  list: (params?: Record<string, unknown>) => [...logKeys.all, "list", params] as const,
};

export function useLogList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: logKeys.list(params),
    queryFn: async () => {
      const { data } = await Logs.logControllerFindAll(
        params ? ({ query: params } as any) : undefined,
      );
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}
