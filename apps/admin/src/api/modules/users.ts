import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "@/api/generated";

export const userKeys = {
  all: ["users"] as const,
  list: (params?: Record<string, unknown>) => [...userKeys.all, "list", params] as const,
};

export function useUserList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const { data } = await Users.userControllerFindAll({ query: params } as any);
      return data as { items: unknown[]; total: number; page: number; pageSize: number };
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await Users.userControllerCreate({ body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await Users.userControllerUpdate({ path: { id }, body } as any);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await Users.userControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Users.userControllerUpdateStatus({ path: { id } });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await Users.userControllerResetPassword({ path: { id } });
      return data;
    },
  });
}
