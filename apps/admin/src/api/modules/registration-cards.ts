import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RegistrationCards,
  type CreateRegistrationCardDto,
  type RegistrationCardControllerFindAllData,
  type UpdateRegistrationCardDto,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf, WithId } from "@/api/types";

export type RegistrationCardListQuery = QueryOf<RegistrationCardControllerFindAllData>;

export const registrationCardKeys = {
  all: ["registration-cards"] as const,
  list: (params?: RegistrationCardListQuery) =>
    [...registrationCardKeys.all, "list", params] as const,
  detail: (id: string) => [...registrationCardKeys.all, "detail", id] as const,
};

export function useRegistrationCardList(params?: RegistrationCardListQuery) {
  return useQuery({
    queryKey: registrationCardKeys.list(params),
    queryFn: async () => {
      const { data } = await RegistrationCards.registrationCardControllerFindAll(
        params ? { query: params } : undefined,
      );
      return data as PaginatedResponse;
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
    mutationFn: async (body: CreateRegistrationCardDto) => {
      const { data } = await RegistrationCards.registrationCardControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: registrationCardKeys.all }),
  });
}

export function useUpdateRegistrationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<UpdateRegistrationCardDto>) => {
      const { data } = await RegistrationCards.registrationCardControllerUpdate({
        path: { id },
        body,
      });
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
