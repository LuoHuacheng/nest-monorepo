import { client } from "@match/api-client/generated/client.gen";
import { useAuthStore } from "@/stores/auth";

// 配置 baseUrl
client.setConfig({
  baseUrl: "http://localhost:4001",
  throwOnError: true,
});

// 请求拦截：注入 auth token
client.interceptors.request.use(async (request) => {
  const { token } = useAuthStore.getState();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});

// 响应拦截：解包 { code, data, message } 响应，并处理认证错误码
client.interceptors.response.use(async (response, request) => {
  if (response.ok) {
    const cloned = response.clone();
    try {
      const json = await cloned.json();
      if (json && typeof json === "object" && "code" in json && "data" in json) {
        // 后端 401/403 以 HTTP 200 + body.code 返回
        if (json.code === 401 || json.code === 403) {
          if (json.code === 401 && !request?.url?.includes("/auth/login")) {
            useAuthStore.getState().logout();
            window.location.href = "/login";
          }
          throw { code: json.code, message: json.message };
        }
        // 正常响应，解包 data 字段
        const unwrapped = new Response(JSON.stringify(json.data), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
        return unwrapped;
      }
    } catch (e) {
      if (e && typeof e === "object" && "code" in e) throw e;
      // 非 JSON 响应，直接返回
    }
  }
  return response;
});

// 错误拦截：处理网络层错误
client.interceptors.error.use(async (error, response) => {
  if (response?.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/login";
  }
  return error;
});

export { client };
