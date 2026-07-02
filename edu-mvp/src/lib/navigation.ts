// 导航桥：让 zustand action（非组件，拿不到 useNavigate）也能触发 React Router 跳转。
import type { Role, RoleProfile, Section } from "../types";

type NavFn = (to: string) => void;
let _navigate: NavFn | null = null;

export function bindNavigate(fn: NavFn) {
  _navigate = fn;
}

export function navigateTo(to: string) {
  _navigate?.(to);
}

// 角色登录后的默认落地路径。
export function defaultPath(role: Role, profiles: Record<Role, RoleProfile>): string {
  if (role === "student") return "/student";
  const allowed = profiles[role].allowed;
  const first: Section = allowed.includes("workspace") ? "workspace" : allowed[0];
  return `/${first}`;
}
