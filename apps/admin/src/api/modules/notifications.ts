import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Notifications,
  type CreateNotificationDto,
  type NotificationControllerFindAllData,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf } from "@/api/types";

export type NotificationListQuery = QueryOf<NotificationControllerFindAllData>;

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: NotificationListQuery) => [...notificationKeys.all, "list", params] as const,
};

export function useNotificationList(params?: NotificationListQuery) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const { data } = await Notifications.notificationControllerFindAll(
        params ? { query: params } : undefined,
      );
      return data as PaginatedResponse;
    },
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateNotificationDto) => {
      const { data } = await Notifications.notificationControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
