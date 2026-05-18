import type { LoginResponse } from "@/types/auth";

export async function loginHandler(username: string, password: string): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (username === "admin" && password === "admin123") {
    return {
      token: "mock-token-admin",
      user: {
        id: "1",
        username,
        name: "管理员",
        avatar: "/logo192.png",
        phone: "13800000001",
        email: "admin@example.com",
        status: 1,
        roles: ["admin"],
      },
    };
  }

  throw new Error("用户名或密码错误");
}
