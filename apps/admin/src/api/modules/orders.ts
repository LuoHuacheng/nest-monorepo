import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Orders, type CreateOrderDto, type OrderControllerFindAllData } from "@match/api-client";
import type { PaginatedResponse, QueryOf } from "@/api/types";

export type OrderListQuery = QueryOf<OrderControllerFindAllData>;

export const orderKeys = {
  all: ["orders"] as const,
  list: (params?: OrderListQuery) => [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useOrderList(params?: OrderListQuery) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const { data } = await Orders.orderControllerFindAll({ query: params });
      return data as PaginatedResponse;
    },
  });
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const { data } = await Orders.orderControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateOrderDto) => {
      const { data } = await Orders.orderControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
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
