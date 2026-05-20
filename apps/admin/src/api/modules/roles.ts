import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Roles } from "@match/api-client";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
};

export function useRoleList() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: async () => {
      const { data } = await Roles.roleControllerFindAll();
      return data;
    },
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await Roles.roleControllerCreate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await Roles.roleControllerUpdate({ path: { id }, body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Roles.roleControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useAssignRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, permissionIds }: { id: string; permissionIds: string[] }) => {
      const { data } = await Roles.roleControllerAssignPermissions({
        path: { id },
        body: { permissionIds },
      } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}
