import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dicts, type CreateDictDto, type CreateDictItemDto } from "@match/api-client";
import type { WithId } from "@/api/types";

export const dictKeys = {
  all: ["dicts"] as const,
  list: () => [...dictKeys.all, "list"] as const,
  detail: (id: string) => [...dictKeys.all, "detail", id] as const,
  byCode: (code: string) => [...dictKeys.all, "by-code", code] as const,
  items: (dictId: string) => [...dictKeys.all, "items", dictId] as const,
};

export function useDictList() {
  return useQuery({
    queryKey: dictKeys.list(),
    queryFn: async () => {
      const { data } = await Dicts.dictControllerFindAll();
      return data;
    },
  });
}

export function useDictByCode(code: string) {
  return useQuery({
    queryKey: dictKeys.byCode(code),
    queryFn: async () => {
      const { data } = await Dicts.dictControllerFindByCode({ path: { code } });
      return data;
    },
    enabled: !!code,
  });
}

export function useCreateDict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateDictDto) => {
      const { data } = await Dicts.dictControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dictKeys.all }),
  });
}

export function useUpdateDict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<Partial<CreateDictDto>>) => {
      const { data } = await Dicts.dictControllerUpdate({
        path: { id },
        body,
      } as Parameters<typeof Dicts.dictControllerUpdate>[0] & { body: Partial<CreateDictDto> });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dictKeys.all }),
  });
}

export function useDeleteDict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Dicts.dictControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dictKeys.all }),
  });
}

export function useDictItems(dictId: string) {
  return useQuery({
    queryKey: dictKeys.items(dictId),
    queryFn: async () => {
      const { data } = await Dicts.dictControllerFindItems({ path: { id: dictId } });
      return data;
    },
    enabled: !!dictId,
  });
}

export function useCreateDictItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dictId, body }: { dictId: string; body: CreateDictItemDto }) => {
      const { data } = await Dicts.dictControllerCreateItem({ path: { id: dictId }, body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dictKeys.all }),
  });
}

export function useUpdateDictItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<Partial<CreateDictItemDto>>) => {
      const { data } = await Dicts.dictControllerUpdateItem({
        path: { id },
        body,
      } as Parameters<typeof Dicts.dictControllerUpdateItem>[0] & {
        body: Partial<CreateDictItemDto>;
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dictKeys.all }),
  });
}

export function useDeleteDictItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Dicts.dictControllerRemoveItem({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dictKeys.all }),
  });
}
