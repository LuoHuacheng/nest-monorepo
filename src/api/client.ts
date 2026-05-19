import { client } from "@/api/generated/client.gen";
import { useAuthStore } from "@/stores/auth";

// 配置 baseUrl
client.setConfig({
  baseUrl: "http://localhost:4001",
  responseStyle: "data",
});

// 请求拦截：注入 auth token
client.interceptors.request.use(async (request) => {
  const { token } = useAuthStore.getState();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});

// 响应拦截：解包 { code, data, message } 响应
client.interceptors.response.use(async (response) => {
  if (response.ok) {
    const cloned = response.clone();
    try {
      const json = await cloned.json();
      if (json && typeof json === "object" && "code" in json && "data" in json) {
        // 后端统一响应格式，解包 data 字段
        const unwrapped = new Response(JSON.stringify(json.data), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
        return unwrapped;
      }
    } catch {
      // 非 JSON 响应，直接返回
    }
  }
  return response;
});

// 错误拦截：处理 401
client.interceptors.error.use(async (error, response) => {
  if (response?.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/login";
  }
  return error;
});

export { client };
