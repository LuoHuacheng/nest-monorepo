import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pacers } from "@match/api-client";

export const pacerKeys = {
  all: ["pacers"] as const,
  list: (params?: Record<string, unknown>) => [...pacerKeys.all, "list", params] as const,
  detail: (id: string) => [...pacerKeys.all, "detail", id] as const,
  tests: ["pacer-tests"] as const,
  events: ["pacer-events"] as const,
};

export function usePacerList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: pacerKeys.list(params),
    queryFn: async () => {
      const { data } = await Pacers.pacerControllerFindAll({ query: params } as any);
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
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
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await Pacers.pacerControllerCreate({ body } as any);
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

export function usePacerTests() {
  return useQuery({
    queryKey: pacerKeys.tests,
    queryFn: async () => {
      const { data } = await Pacers.pacerControllerFindTests();
      return data;
    },
  });
}

export function useUpdatePacerTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await Pacers.pacerControllerUpdateTest({ path: { id }, body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pacerKeys.tests }),
  });
}

export function usePacerEvents() {
  return useQuery({
    queryKey: pacerKeys.events,
    queryFn: async () => {
      const { data } = await Pacers.pacerControllerFindEvents();
      return data;
    },
  });
}

export function useAssignPacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await Pacers.pacerControllerAssign({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pacerKeys.events }),
  });
}

export function useWithdrawPacer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Pacers.pacerControllerWithdraw({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pacerKeys.events }),
  });
}
