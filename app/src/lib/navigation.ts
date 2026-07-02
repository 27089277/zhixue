// RN 版：不再需要 DOM 路由桥；导航由 expo-router 在组件层处理。
// 仅保留"角色首页"的纯函数，供根布局按登录状态跳转。
import type { Role } from "../types";

export function homeRouteFor(role: Role): string {
  return role === "student" ? "/(student)" : "/(teacher)";
}
