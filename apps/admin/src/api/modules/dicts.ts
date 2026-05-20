import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dicts } from "@match/api-client";

export const dictKeys = {
  all: ["dicts"] as const,
  list: (params?: Record<string, unknown>) => [...dictKeys.all, "list", params] as const,
  detail: (id: string) => [...dictKeys.all, "detail", id] as const,
  byCode: (code: string) => [...dictKeys.all, "by-code", code] as const,
  items: (dictId: string) => [...dictKeys.all, "items", dictId] as const,
};

export function useDictList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: dictKeys.list(params),
    queryFn: async () => {
      const { data } = await Dicts.dictControllerFindAll(
        params ? ({ query: params } as any) : undefined,
      );
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
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
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await Dicts.dictControllerCreate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dictKeys.all }),
  });
}

export function useUpdateDict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await Dicts.dictControllerUpdate({ path: { id }, body } as any);
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
    mutationFn: async ({ dictId, body }: { dictId: string; body: Record<string, unknown> }) => {
      const { data } = await Dicts.dictControllerCreateItem({ path: { id: dictId }, body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dictKeys.all }),
  });
}

export function useUpdateDictItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await Dicts.dictControllerUpdateItem({ path: { id }, body } as any);
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
