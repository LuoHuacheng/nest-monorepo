import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  InviteCodes,
  type CreateInviteCodeDto,
  type UpdateInviteCodeDto,
  type InviteCodeControllerFindAllData,
  type InviteCodeControllerFindParticipantsData,
} from "@match/api-client";
import type { PaginatedResponse, QueryOf } from "@/api/types";

export type InviteCodeListQuery = QueryOf<InviteCodeControllerFindAllData>;
export type InviteCodeParticipantsQuery = QueryOf<InviteCodeControllerFindParticipantsData>;

export const inviteCodeKeys = {
  all: ["invite-codes"] as const,
  list: (params?: InviteCodeListQuery) => [...inviteCodeKeys.all, "list", params] as const,
  participants: (id: string, params?: InviteCodeParticipantsQuery) =>
    [...inviteCodeKeys.all, id, "participants", params] as const,
};

export interface InviteCodeQuery {
  eventId?: string;
  status?: number;
  dateStart?: string;
  dateEnd?: string;
}

export function useInviteCodes(params?: InviteCodeQuery) {
  return useQuery({
    queryKey: inviteCodeKeys.list(params),
    queryFn: async () => {
      const query: InviteCodeQuery = {};
      if (params?.eventId) query.eventId = params.eventId;
      if (params?.status !== undefined) query.status = params.status;
      if (params?.dateStart) query.dateStart = params.dateStart;
      if (params?.dateEnd) query.dateEnd = params.dateEnd;

      const { data } = await InviteCodes.inviteCodeControllerFindAll({
        query: Object.keys(query).length > 0 ? query : undefined,
      });
      return data;
    },
  });
}

export function useCreateInviteCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateInviteCodeDto) => {
      const { data } = await InviteCodes.inviteCodeControllerCreate({
        body,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: inviteCodeKeys.all }),
  });
}

export function useUpdateInviteCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateInviteCodeDto }) => {
      const { data } = await InviteCodes.inviteCodeControllerUpdate({
        path: { id },
        body,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: inviteCodeKeys.all }),
  });
}

export function useDeleteInviteCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await InviteCodes.inviteCodeControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: inviteCodeKeys.all }),
  });
}

export function useInviteCodeParticipants(id: string, params?: InviteCodeParticipantsQuery) {
  return useQuery({
    queryKey: inviteCodeKeys.participants(id, params),
    queryFn: async () => {
      const { data } = await InviteCodes.inviteCodeControllerFindParticipants({
        path: { id },
        query: params,
      });
      return data as PaginatedResponse;
    },
    enabled: !!id,
  });
}
