import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AthleticCenters } from "@/api/generated";

export const athleticCenterKeys = {
  all: ["athletic-centers"] as const,
  list: (params?: Record<string, unknown>) => [...athleticCenterKeys.all, "list", params] as const,
};

export function useAthleticCenterList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: athleticCenterKeys.list(params),
    queryFn: async () => {
      const { data } = await AthleticCenters.athleticCenterControllerFindAll(
        params ? ({ query: params } as any) : undefined,
      );
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateAthleticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await AthleticCenters.athleticCenterControllerCreate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}

export function useUpdateAthleticCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await AthleticCenters.athleticCenterControllerUpdate({
        path: { id },
        body,
      } as any);
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

export function useUpdateAthleticCenterStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) => {
      const { data } = await AthleticCenters.athleticCenterControllerUpdateStatus({
        path: { id },
        body: { status },
      } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: athleticCenterKeys.all }),
  });
}
