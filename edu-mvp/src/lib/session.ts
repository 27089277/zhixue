// 登录会话持久化，移植自 legacy saveLoginSession/clearLoginSession/restoreLoginSession。
import type { LoginMethod, LoginSession, Role, RoleProfile } from "../types";
import { DATA_VERSION } from "../data/seed";

const KEY = "zhixue-login-session";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function saveLoginSession(
  role: Role,
  method: LoginMethod,
  profile: RoleProfile,
  phone: string
) {
  const session: LoginSession & { dataVersion: string } = {
    dataVersion: DATA_VERSION,
    role,
    method,
    name: profile.name,
    scope: profile.scope,
    phone,
    loginAt: Date.now(),
    expiresAt: Date.now() + SEVEN_DAYS,
  };
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearLoginSession() {
  localStorage.removeItem(KEY);
}

export function readLoginSession(): LoginSession | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!saved || !saved.role || (saved.dataVersion && saved.dataVersion !== DATA_VERSION)) {
      clearLoginSession();
      return null;
    }
    if (saved.expiresAt < Date.now()) {
      clearLoginSession();
      return null;
    }
    return saved as LoginSession;
  } catch {
    clearLoginSession();
    return null;
  }
}
