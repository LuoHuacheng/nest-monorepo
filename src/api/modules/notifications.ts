import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Notifications } from "@/api/generated";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: Record<string, unknown>) => [...notificationKeys.all, "list", params] as const,
};

export function useNotificationList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const { data } = await Notifications.notificationControllerFindAll(
        params ? ({ query: params } as any) : undefined,
      );
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await Notifications.notificationControllerCreate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
