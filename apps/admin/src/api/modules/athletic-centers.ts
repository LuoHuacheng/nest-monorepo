import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AthleticCenters,
  type AthleticCenterControllerFindAllData,
  type CreateAthleticCenterDto,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf, WithId } from "@/api/types";

export type AthleticCenterListQuery = QueryOf<AthleticCenterControllerFindAllData>;

export const athleticCenterKeys = {
  all: ["athletic-centers"] as const,
  list: (params?: AthleticCenterListQuery) => [...athleticCenterKeys.all, "list", params] as const,
  detail: (id: string) => [...athleticCenterKeys.all, "detail", id] as const,
};

export function useAthleticCenterList(params?: AthleticCenterListQuery) {
  return useQuery({
    queryKey: athleticCenterKeys.list(params),
    queryFn: async () => {
      const { data } = await AthleticCenters.athleticCenterControllerFindAll(
        params ? { query: params } : undefined,
      );
      return data as PaginatedResponse;
    },
  });
}

export function useAthleticCenterDetail(id: string) {
  return useQuery({
    queryKey: athleticCenterKeys.detail(id),
    queryFn: async () => {
      const { data } = await AthleticCenters.athleticCenterControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAthleticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateAthleticCenterDto) => {
      const { data } = await AthleticCenters.athleticCenterControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}

export function useUpdateAthleticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<Partial<CreateAthleticCenterDto>>) => {
      const { data } = await AthleticCenters.athleticCenterControllerUpdate({
        path: { id },
        body,
      } as Parameters<typeof AthleticCenters.athleticCenterControllerUpdate>[0] & {
        body: Partial<CreateAthleticCenterDto>;
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}

export function useDeleteAthleticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await AthleticCenters.athleticCenterControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}

export function useResetAthleticCenterPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await AthleticCenters.athleticCenterControllerResetPassword({
        path: { id },
      });
      return data;
    },
  });
}

export function useUpdateAthleticCenterStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const { data } = await AthleticCenters.athleticCenterControllerUpdateStatus({
        path: { id },
        body: { status },
      } as Parameters<typeof AthleticCenters.athleticCenterControllerUpdateStatus>[0] & {
        body: { status: number };
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}
