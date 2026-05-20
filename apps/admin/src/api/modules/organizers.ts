import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Organizers } from "@match/api-client";

export const organizerKeys = {
  all: ["organizers"] as const,
  list: (params?: Record<string, unknown>) => [...organizerKeys.all, "list", params] as const,
};

export function useOrganizerList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: organizerKeys.list(params),
    queryFn: async () => {
      const { data } = await Organizers.organizerControllerFindAll(
        params ? ({ query: params } as any) : undefined,
      );
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateOrganizer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await Organizers.organizerControllerCreate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useUpdateOrganizer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await Organizers.organizerControllerUpdate({ path: { id }, body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useDeleteOrganizer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Organizers.organizerControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useUpdateOrganizerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const { data } = await Organizers.organizerControllerUpdateStatus({
        path: { id },
        body: { status },
      } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useResetOrganizerPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Organizers.organizerControllerResetPassword({ path: { id } });
      return data;
    },
  });
}
