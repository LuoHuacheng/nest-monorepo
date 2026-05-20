import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientConfigs, type BatchUpdateClientConfigDto } from "@match/api-client";

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
    mutationFn: async (body: BatchUpdateClientConfigDto) => {
      const { data } = await ClientConfigs.clientConfigControllerBatchUpdate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clientConfigKeys.all }),
  });
}
