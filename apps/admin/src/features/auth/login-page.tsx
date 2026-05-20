import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/api/modules/auth";
import { ArrowRight } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export function LoginPage() {
  const loginMutation = useLogin();
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: { username: "admin", password: "admin123" },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        await loginMutation.mutateAsync(value);
      } catch (e: unknown) {
        setError((e as Error)?.message ?? "登录失败");
      }
    },
    validators: {
      onSubmit: loginSchema,
    },
  });

  return (
    <div className="flex min-h-svh">
      {/* Left: Brand Panel */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-primary lg:flex">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-120 w-120 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative z-10 max-w-md px-12 text-primary-foreground">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4v6a6 6 0 0 0 12 0V4" />
                <line x1="4" y1="2" x2="8" y2="2" />
                <line x1="16" y1="2" x2="20" y2="2" />
                <line x1="12" y1="16" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">赛事管理</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            专业赛事管理平台
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-primary-foreground/80">
            高效管理赛事报名、配速员分配、订单处理与成绩发布，一站式解决赛事运营需求。
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold">30K+</div>
              <div className="mt-1 text-sm text-primary-foreground/60">赛事参与者</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="mt-1 text-sm text-primary-foreground/60">合作赛事</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="mt-1 text-sm text-primary-foreground/60">系统可用率</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex w-full items-center justify-center bg-card px-6 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              欢迎回来
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">登录您的管理员账户以继续</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form.Field name="username">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    用户名
                  </Label>
                  <Input
                    id="username"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入用户名"
                    className="h-11 bg-background"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      密码
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入密码"
                    className="h-11 bg-background"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="h-11 w-full font-medium"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      登录中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      登录
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            测试账号：admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
