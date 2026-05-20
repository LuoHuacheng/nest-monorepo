import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore, authRehydratePromise } from "@/stores/auth";
import { LoginPage } from "@/features/auth/login-page";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      return;
    }
    await authRehydratePromise;
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});
