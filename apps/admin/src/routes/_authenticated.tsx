import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore, type User } from "@/stores/auth";
import { Auth } from "@match/api-client";
import { MainLayout } from "@/components/layout/main-layout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    // Fetch latest user info
    try {
      const { data } = await Auth.authControllerGetProfile();
      if (data) {
        useAuthStore.getState().updateUser(data as User);
      }
    } catch {
      // profile fetch failure shouldn't block page load
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
