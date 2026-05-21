import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShuttleBuses,
  type CreateShuttleBusDto,
  type ShuttleBusControllerFindAllData,
} from "@match/api-client";
import type { QueryOf } from "@/api/types";

export type ShuttleBusListQuery = QueryOf<ShuttleBusControllerFindAllData>;

export const shuttleBusKeys = {
  all: ["shuttle-buses"] as const,
  list: (params?: ShuttleBusListQuery) => [...shuttleBusKeys.all, "list", params] as const,
};

export interface ShuttleBusQuery {
  eventId?: string;
}

export function useShuttleBuses(params?: ShuttleBusQuery) {
  return useQuery({
    queryKey: shuttleBusKeys.list(params),
    queryFn: async () => {
      const query: ShuttleBusQuery = {};
      if (params?.eventId) query.eventId = params.eventId;

      const { data } = await ShuttleBuses.shuttleBusControllerFindAll({
        query: Object.keys(query).length > 0 ? query : undefined,
      });
      return data;
    },
  });
}

export function useCreateShuttleBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateShuttleBusDto) => {
      const { data } = await ShuttleBuses.shuttleBusControllerCreate({
        body,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: shuttleBusKeys.all }),
  });
}

export function useUpdateShuttleBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<CreateShuttleBusDto> }) => {
      const { data } = await ShuttleBuses.shuttleBusControllerUpdate({
        path: { id },
        body,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: shuttleBusKeys.all }),
  });
}

export function useDeleteShuttleBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await ShuttleBuses.shuttleBusControllerRemove({ path: { id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: shuttleBusKeys.all }),
  });
}
