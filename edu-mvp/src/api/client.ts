// 后端调用封装，移植自 legacy app.js aiPost/aiErrorMessage。
// 走相对 /api，由 Vite dev proxy 转发到当前 Spring Boot 后端。
export const API_BASE = "/api";

// 上传媒体文件到对象存储（后端存磁盘，返回可播放的引用 URL），大文件不进关系库。
export async function uploadMedia(
  file: File
): Promise<{ id: string; url: string; name: string; size: number }> {
  const form = new FormData();
  form.append("file", file);
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
  const message =
    (error as any)?.message || String(error || "未知错误");
  if (message.includes("未配置 DEEPSEEK_API_KEY"))
    return "DeepSeek Key 未配置，后端已接通但不能调用模型";
  if (message.includes("404")) return "DeepSeek 后端路由未加载，请重启 8000 后端服务";
  if (
    message.includes("504") ||
    message.includes("响应超时") ||
    message.includes("timed out")
  )
    return "DeepSeek 响应超时，请稍后重试或缩小导入范围";
  if (message.includes("Failed to fetch"))
    return "无法连接 AI 后端，请先启动 8000 服务";
  return message.length > 120 ? `${message.slice(0, 120)}...` : message;
}
