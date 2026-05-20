import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Orders } from "@/api/generated";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params?: Record<string, unknown>) => [...orderKeys.all, "list", params] as const,
};

export function useOrderList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const { data } = await Orders.orderControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useRefundOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Orders.orderControllerRefund({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
