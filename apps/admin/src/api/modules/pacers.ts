import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pacers,
  type AssignPacerDto,
  type CreatePacerDto,
  type PacerControllerFindAllData,
  type PacerControllerFindEventsData,
  type PacerControllerFindTestsData,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf, WithId } from "@/api/types";

export type PacerListQuery = QueryOf<PacerControllerFindAllData>;
export type PacerTestsQuery = QueryOf<PacerControllerFindTestsData>;
export type PacerEventsQuery = QueryOf<PacerControllerFindEventsData>;

export const pacerKeys = {
  all: ["pacers"] as const,
  list: (params?: PacerListQuery) => [...pacerKeys.all, "list", params] as const,
  detail: (id: string) => [...pacerKeys.all, "detail", id] as const,
  tests: (params?: PacerTestsQuery) => ["pacer-tests", params] as const,
  events: (params?: PacerEventsQuery) => ["pacer-events", params] as const,
  eventDetail: (id: string) => ["pacer-events", "detail", id] as const,
};

export function usePacerList(params?: PacerListQuery) {
  return useQuery({
    queryKey: pacerKeys.list(params),
    queryFn: async () => {
      const { data } = await Pacers.pacerControllerFindAll({ query: params });
      return data as PaginatedResponse;
    },
  });
}

export function usePacerDetail(id: string) {
  return useQuery({
    queryKey: pacerKeys.detail(id),
    queryFn: async () => {
      const { data } = await Pacers.pacerControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreatePacerDto) => {
      const { data } = await Pacers.pacerControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function useDeletePacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Pacers.pacerControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function useApprovePacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Pacers.pacerControllerApprove({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function useSuspendPacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Pacers.pacerControllerSuspend({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function useRevokePacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Pacers.pacerControllerRevoke({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pacerKeys.all }),
  });
}

export function usePacerTests(params?: PacerTestsQuery) {
  return useQuery({
    queryKey: pacerKeys.tests(params),
    queryFn: async () => {
      const { data } = await Pacers.pacerControllerFindTests({ query: params });
      return data as PaginatedResponse;
    },
  });
}

export function useUpdatePacerTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<Record<string, unknown>>) => {
      const { data } = await Pacers.pacerControllerUpdateTest({
        path: { id },
        body,
      } as Parameters<typeof Pacers.pacerControllerUpdateTest>[0] & {
        body: Record<string, unknown>;
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pacer-tests"] }),
  });
}

export function usePacerEvents(params?: PacerEventsQuery) {
  return useQuery({
    queryKey: pacerKeys.events(params),
    queryFn: async () => {
      const { data } = await Pacers.pacerControllerFindEvents({ query: params });
      return data as PaginatedResponse;
    },
  });
}

export function usePacerEventDetail(id: string) {
  return useQuery({
    queryKey: pacerKeys.eventDetail(id),
    queryFn: async () => {
      const { data } = await Pacers.pacerControllerFindEventDetail({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useAssignPacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AssignPacerDto) => {
      const { data } = await Pacers.pacerControllerAssign({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pacer-events"] }),
  });
}

export function useWithdrawPacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Pacers.pacerControllerWithdraw({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pacer-events"] }),
  });
}
