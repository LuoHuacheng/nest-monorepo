import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Roles, type CreateRoleDto } from "@match/api-client";
import type { PaginatedResponse, WithId } from "@/api/types";

export const roleKeys = {
  all: ["roles"] as const,
  list: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

export function useRoleList() {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: async () => {
      const { data } = await Roles.roleControllerFindAll();
      return data as PaginatedResponse;
    },
  });
}

export function useRoleDetail(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const { data } = await Roles.roleControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateRoleDto) => {
      const { data } = await Roles.roleControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<Partial<CreateRoleDto>>) => {
      const { data } = await Roles.roleControllerUpdate({
        path: { id },
        body,
      } as Parameters<typeof Roles.roleControllerUpdate>[0] & { body: Partial<CreateRoleDto> });
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
      } as Parameters<typeof Roles.roleControllerAssignPermissions>[0] & {
        body: { permissionIds: string[] };
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}
