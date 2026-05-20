import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Events } from "@match/api-client";

export const eventKeys = {
  all: ["events"] as const,
  list: (params?: Record<string, unknown>) => [...eventKeys.all, "list", params] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
  inviteCodes: (eventId: string) => [...eventKeys.all, eventId, "invite-codes"] as const,
  shuttleBuses: (eventId: string) => [...eventKeys.all, eventId, "shuttle-buses"] as const,
  results: (eventId: string) => [...eventKeys.all, eventId, "results"] as const,
};

export function useEventList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindAll({ query: params });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Events.eventControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUpdatePublishStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      publishStatus,
    }: {
      id: string;
      publishStatus: "draft" | "published" | "offline";
    }) => {
      const { data } = await Events.eventControllerUpdatePublishStatus({
        path: { id },
        body: { publishStatus },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useInviteCodes(eventId: string) {
  return useQuery({
    queryKey: eventKeys.inviteCodes(eventId),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindInviteCodes({ path: { eventId } });
      return data;
    },
    enabled: !!eventId,
  });
}

export function useDeleteInviteCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Events.eventControllerRemoveInviteCode({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useShuttleBuses(eventId: string) {
  return useQuery({
    queryKey: eventKeys.shuttleBuses(eventId),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindShuttleBuses({ path: { eventId } });
      return data;
    },
    enabled: !!eventId,
  });
}

export function useEventResults(eventId: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: eventKeys.results(eventId),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindResults({
        path: { eventId },
        query: params,
      });
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
    enabled: !!eventId,
  });
}
