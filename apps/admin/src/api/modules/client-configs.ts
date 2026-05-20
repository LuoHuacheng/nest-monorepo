import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientConfigs } from "@/api/generated";

export const clientConfigKeys = {
  all: ["client-configs"] as const,
  list: () => [...clientConfigKeys.all, "list"] as const,
};

export function useClientConfigList() {
  return useQuery({
    queryKey: clientConfigKeys.list(),
    queryFn: async () => {
      const { data } = await ClientConfigs.clientConfigControllerFindAll();
      return data as unknown[];
    },
  });
}

export function useBatchUpdateClientConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await ClientConfigs.clientConfigControllerBatchUpdate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clientConfigKeys.all }),
  });
}
