// 后端调用封装（RN 版）：绝对地址 + RN FormData。移植自 web api/client.ts。
// 通过 EXPO_PUBLIC_API_BASE 配置；默认指向线上 Spring 后端。dev 联调可改为局域网 IP。
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || "http://111.231.12.64/api";

// 后端返回的媒体/资源多是相对 /api/... 路径；RN 需要绝对地址。
export function absUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  const origin = API_BASE.replace(/\/api\/?$/, "");
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

// 上传媒体（手写 PNG / 图片 / 视频）。RN 用 { uri, name, type } 塞 FormData。
export async function uploadMedia(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<{ id: string; url: string; name: string; size: number }> {
  const form = new FormData();
  // @ts-expect-error RN FormData 接受 { uri, name, type }
  form.append("file", { uri: file.uri, name: file.name, type: file.type });
  const response = await fetch(`${API_BASE}/media`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`上传失败：${response.status}`);
  return response.json();
}

export async function aiPost<T = any>(
  path: string,
  payload: unknown,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data.detail || text);
    } catch (error: any) {
      if (error?.message && error.message !== text) throw error;
      throw new Error(text || `AI 请求失败：${response.status}`);
    }
  }
  return response.json();
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`请求失败：${response.status}`);
  return response.json();
}

export function aiErrorMessage(error: unknown): string {
  const message = (error as any)?.message || String(error || "未知错误");
  if (message.includes("未配置 DEEPSEEK_API_KEY"))
    return "DeepSeek Key 未配置，后端已接通但不能调用模型";
  if (message.includes("Failed to fetch") || message.includes("Network request failed"))
    return "无法连接后端，请检查网络或后端地址";
  return message.length > 120 ? `${message.slice(0, 120)}...` : message;
}
