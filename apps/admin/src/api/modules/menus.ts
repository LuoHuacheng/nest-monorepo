import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Menus, type CreateMenuDto } from "@match/api-client";
import type { WithId } from "@/api/types";

export const menuKeys = {
  all: ["menus"] as const,
  tree: () => [...menuKeys.all, "tree"] as const,
  userTree: () => [...menuKeys.all, "user-tree"] as const,
};

export function useMenuTree() {
  return useQuery({
    queryKey: menuKeys.tree(),
    queryFn: async () => {
      const { data } = await Menus.menuControllerFindTree();
      return data;
    },
  });
}

export function useUserMenuTree() {
  return useQuery({
    queryKey: menuKeys.userTree(),
    queryFn: async () => {
      const { data } = await Menus.menuControllerFindUserTree();
      return data;
    },
  });
}

export function useCreateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateMenuDto) => {
      const { data } = await Menus.menuControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all }),
  });
}

export function useUpdateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<Partial<CreateMenuDto>>) => {
      const { data } = await Menus.menuControllerUpdate({
        path: { id },
        body,
      } as Parameters<typeof Menus.menuControllerUpdate>[0] & { body: Partial<CreateMenuDto> });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all }),
  });
}

export function useDeleteMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Menus.menuControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.all }),
  });
}
