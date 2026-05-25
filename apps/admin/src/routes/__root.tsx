import { createRootRoute } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/query-client";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

// 确保 API 客户端在应用启动时配置
import "@/api/client";

export const Route = createRootRoute({
  component: AppLayout,
  notFoundComponent: () => (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">页面不存在</p>
      <a href="/" className="text-primary underline">
        返回首页
      </a>
    </div>
  ),
});

function AppLayout({ children }: { children?: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={<div className="flex min-h-svh items-center justify-center">Loading...</div>}
      >
        {children}
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
}
