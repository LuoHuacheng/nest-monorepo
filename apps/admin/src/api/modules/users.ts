import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  type CreateUserDto,
  type UpdateUserDto,
  type UserControllerFindAllData,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf, WithId } from "@/api/types";

export type UserListQuery = QueryOf<UserControllerFindAllData>;

export const userKeys = {
  all: ["users"] as const,
  list: (params?: UserListQuery) => [...userKeys.all, "list", params] as const,
};

export function useUserList(params?: UserListQuery) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const { data } = await Users.userControllerFindAll({ query: params });
      return data as PaginatedResponse;
    },
  });
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: [...userKeys.all, "detail", id] as const,
    queryFn: async () => {
      const { data } = await Users.userControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateUserDto) => {
      const { data } = await Users.userControllerCreate({ body });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: WithId<UpdateUserDto>) => {
      const { data } = await Users.userControllerUpdate({ path: { id }, body });
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
