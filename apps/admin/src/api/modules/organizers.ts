import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Organizers,
  type CreateOrganizerDto,
  type OrganizerControllerFindAllData,
  type UpdateOrganizerDto,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf, WithId } from "@/api/types";

export type OrganizerListQuery = QueryOf<OrganizerControllerFindAllData>;

export const organizerKeys = {
  all: ["organizers"] as const,
  list: (params?: OrganizerListQuery) => [...organizerKeys.all, "list", params] as const,
  detail: (id: string) => [...organizerKeys.all, "detail", id] as const,
};

export function useOrganizerList(params?: OrganizerListQuery) {
  return useQuery({
    queryKey: organizerKeys.list(params),
    queryFn: async () => {
      const { data } = await Organizers.organizerControllerFindAll(
        params ? { query: params } : undefined,
      );
      return data as PaginatedResponse;
    },
  });
}

export function useOrganizerDetail(id: string) {
  return useQuery({
    queryKey: organizerKeys.detail(id),
    queryFn: async () => {
      const { data } = await Organizers.organizerControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrganizer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateOrganizerDto) => {
      const { data } = await Organizers.organizerControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: organizerKeys.all }),
  });
}

export function useUpdateOrganizer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<UpdateOrganizerDto>) => {
      const { data } = await Organizers.organizerControllerUpdate({ path: { id }, body });
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
      } as Parameters<typeof Organizers.organizerControllerUpdateStatus>[0] & {
        body: { status: number };
      });
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
