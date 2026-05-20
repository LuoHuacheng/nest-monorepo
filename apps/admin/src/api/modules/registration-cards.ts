import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RegistrationCards } from "@match/api-client";

export const registrationCardKeys = {
  all: ["registration-cards"] as const,
  list: (params?: Record<string, unknown>) =>
    [...registrationCardKeys.all, "list", params] as const,
  detail: (id: string) => [...registrationCardKeys.all, "detail", id] as const,
};

export function useRegistrationCardList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: registrationCardKeys.list(params),
    queryFn: async () => {
      const { data } = await RegistrationCards.registrationCardControllerFindAll(
        params ? ({ query: params } as any) : undefined,
      );
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useRegistrationCardDetail(id: string) {
  return useQuery({
    queryKey: registrationCardKeys.detail(id),
    queryFn: async () => {
      const { data } = await RegistrationCards.registrationCardControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateRegistrationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await RegistrationCards.registrationCardControllerCreate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: registrationCardKeys.all }),
  });
}

export function useUpdateRegistrationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await RegistrationCards.registrationCardControllerUpdate({
        path: { id },
        body,
      } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: registrationCardKeys.all }),
  });
}

export function useDeleteRegistrationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await RegistrationCards.registrationCardControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: registrationCardKeys.all }),
  });
}
