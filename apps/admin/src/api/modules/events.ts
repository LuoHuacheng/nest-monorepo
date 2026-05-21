import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Events,
  type CreateEventDto,
  type EventControllerFindAllData,
  type EventControllerFindParticipantsData,
  type UpdateEventDto,
  type UpdatePublishStatusDto,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf, WithId } from "@/api/types";

export type EventListQuery = QueryOf<EventControllerFindAllData>;
export type EventParticipantsQuery = QueryOf<EventControllerFindParticipantsData>;

export const eventKeys = {
  all: ["events"] as const,
  list: (params?: EventListQuery) => [...eventKeys.all, "list", params] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
  participants: (id: string, params?: EventParticipantsQuery) =>
    [...eventKeys.all, id, "participants", params] as const,
  drawResults: (eventId: string) => [...eventKeys.all, eventId, "draw-results"] as const,
};

export function useEventList(params?: EventListQuery) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindAll({ query: params });
      return data as PaginatedResponse;
    },
  });
}

export function useEventDetail(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateEventDto) => {
      const { data } = await Events.eventControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<UpdateEventDto>) => {
      const { data } = await Events.eventControllerUpdate({ path: { id }, body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
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
    mutationFn: async ({ id, publishStatus }: { id: string } & UpdatePublishStatusDto) => {
      const { data } = await Events.eventControllerUpdatePublishStatus({
        path: { id },
        body: { publishStatus },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useConfirmRegistrationEnd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Events.eventControllerConfirmRegistrationEnd({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

// ==================== 参赛人 ====================

export function useEventParticipants(id: string, params?: EventParticipantsQuery) {
  return useQuery({
    queryKey: eventKeys.participants(id, params),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindParticipants({
        path: { id },
        query: params,
      });
      return data as PaginatedResponse;
    },
    enabled: !!id,
  });
}

// ==================== 抽签 ====================

export function useEventDrawResults(eventId: string) {
  return useQuery({
    queryKey: eventKeys.drawResults(eventId),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindDrawResults({
        path: { id: eventId },
      });
      return data;
    },
    enabled: !!eventId,
  });
}

export function useDrawEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Events.eventControllerDraw({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useConfirmDraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, orderIds }: { id: string; orderIds: string[] }) => {
      const { data } = await Events.eventControllerConfirmDraw({
        path: { id },
        body: { orderIds },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}
