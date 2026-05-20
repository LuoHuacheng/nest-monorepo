import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Events,
  type CreateEventDto,
  type CreateInviteCodeDto,
  type CreateShuttleBusDto,
  type EventControllerFindAllData,
  type EventControllerFindOrdersData,
  type EventControllerFindParticipantsData,
  type EventControllerFindResultsData,
  type UpdateEventDto,
  type UpdatePublishStatusDto,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf, WithId } from "@/api/types";

export type EventListQuery = QueryOf<EventControllerFindAllData>;
export type EventResultsQuery = QueryOf<EventControllerFindResultsData>;
export type EventParticipantsQuery = QueryOf<EventControllerFindParticipantsData>;
export type EventOrdersQuery = QueryOf<EventControllerFindOrdersData>;

export const eventKeys = {
  all: ["events"] as const,
  list: (params?: EventListQuery) => [...eventKeys.all, "list", params] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
  inviteCodes: (eventId: string) => [...eventKeys.all, eventId, "invite-codes"] as const,
  shuttleBuses: (eventId: string) => [...eventKeys.all, eventId, "shuttle-buses"] as const,
  results: (eventId: string, params?: EventResultsQuery) =>
    [...eventKeys.all, eventId, "results", params] as const,
  participants: (eventId: string, params?: EventParticipantsQuery) =>
    [...eventKeys.all, eventId, "participants", params] as const,
  orders: (eventId: string, params?: EventOrdersQuery) =>
    [...eventKeys.all, eventId, "orders", params] as const,
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

export function useCreateInviteCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, body }: { eventId: string; body: CreateInviteCodeDto }) => {
      const { data } = await Events.eventControllerCreateInviteCode({
        path: { eventId },
        body,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
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

export function useCreateShuttleBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, body }: { eventId: string; body: CreateShuttleBusDto }) => {
      const { data } = await Events.eventControllerCreateShuttleBus({
        path: { eventId },
        body,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUpdateShuttleBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<Partial<CreateShuttleBusDto>>) => {
      const { data } = await Events.eventControllerUpdateShuttleBus({
        path: { id },
        body,
      } as Parameters<typeof Events.eventControllerUpdateShuttleBus>[0] & {
        body: Partial<CreateShuttleBusDto>;
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useDeleteShuttleBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Events.eventControllerRemoveShuttleBus({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useEventResults(eventId: string, params?: EventResultsQuery) {
  return useQuery({
    queryKey: eventKeys.results(eventId, params),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindResults({
        path: { eventId },
        query: params,
      });
      return data as PaginatedResponse;
    },
    enabled: !!eventId,
  });
}

export function useImportEventResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, body }: { eventId: string; body: string[] }) => {
      const { data } = await Events.eventControllerImportResults({
        path: { eventId },
        body,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

// ==================== 参赛人 ====================

export function useEventParticipants(eventId: string, params?: EventParticipantsQuery) {
  return useQuery({
    queryKey: eventKeys.participants(eventId, params),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindParticipants({
        path: { eventId },
        query: params,
      });
      return data as PaginatedResponse;
    },
    enabled: !!eventId,
  });
}

// ==================== 订单 ====================

export function useEventOrders(eventId: string, params?: EventOrdersQuery) {
  return useQuery({
    queryKey: eventKeys.orders(eventId, params),
    queryFn: async () => {
      const { data } = await Events.eventControllerFindOrders({
        path: { eventId },
        query: params,
      });
      return data as PaginatedResponse;
    },
    enabled: !!eventId,
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
