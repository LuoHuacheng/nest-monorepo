import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Permissions, type CreatePermissionDto } from "@match/api-client";
import type { WithId } from "@/api/types";

export const permissionKeys = {
  all: ["permissions"] as const,
  tree: () => [...permissionKeys.all, "tree"] as const,
};

export function usePermissionTree() {
  return useQuery({
    queryKey: permissionKeys.tree(),
    queryFn: async () => {
      const { data } = await Permissions.permissionControllerFindTree();
      return data;
    },
  });
}

export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreatePermissionDto) => {
      const { data } = await Permissions.permissionControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: permissionKeys.all }),
  });
}

export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<Partial<CreatePermissionDto>>) => {
      const { data } = await Permissions.permissionControllerUpdate({
        path: { id },
        body,
      } as Parameters<typeof Permissions.permissionControllerUpdate>[0] & {
        body: Partial<CreatePermissionDto>;
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: permissionKeys.all }),
  });
}

export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Permissions.permissionControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: permissionKeys.all }),
  });
}
