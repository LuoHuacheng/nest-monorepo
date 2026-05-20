import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Permissions } from "@/api/generated";

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
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await Permissions.permissionControllerCreate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: permissionKeys.all }),
  });
}

export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await Permissions.permissionControllerUpdate({ path: { id }, body } as any);
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
