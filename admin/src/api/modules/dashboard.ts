import { useQuery } from "@tanstack/react-query";
import { Orders, Events } from "@/api/generated";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  recentOrders: () => [...dashboardKeys.all, "recent-orders"] as const,
  recentEvents: () => [...dashboardKeys.all, "recent-events"] as const,
};

export function useDashboardRecentOrders() {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(),
    queryFn: async () => {
      const { data } = await Orders.orderControllerFindAll({
        query: { page: 1, pageSize: 5 },
      } as any);
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useDashboardRecentEvents() {
  return useQuery({
    queryKey: dashboardKeys.recentEvents(),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindAll({
        query: { page: 1, pageSize: 5 },
      } as any);
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}
