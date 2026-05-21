import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Auth, type LoginDto } from "@match/api-client";
import { useAuthStore, type User } from "@/stores/auth";

export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const result = await Auth.authControllerGetProfile();
      return result.data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const result = await Auth.authControllerLogin({ body: credentials });
      return result.data as unknown as {
        accessToken: string;
        refreshToken: string;
        user: User;
      };
    },
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
      navigate({ to: "/" });
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const result = await Auth.authControllerRefresh();
      return result.data;
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Auth.authControllerLogout();
    },
    onSettled: () => {
      useAuthStore.getState().logout();
      queryClient.clear();
      navigate({ to: "/login" });
    },
  });
}
