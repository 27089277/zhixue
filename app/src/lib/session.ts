// 登录会话持久化（RN 版：AsyncStorage，异步）。移植自 web lib/session.ts。
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LoginMethod, LoginSession, Role, RoleProfile } from "../types";
import { DATA_VERSION } from "../data/seed";

const KEY = "zhixue-login-session";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export async function saveLoginSession(
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
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
}

export async function clearLoginSession() {
  await AsyncStorage.removeItem(KEY);
}

export async function readLoginSession(): Promise<LoginSession | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const saved = raw ? JSON.parse(raw) : null;
    if (!saved || !saved.role || (saved.dataVersion && saved.dataVersion !== DATA_VERSION)) {
      await clearLoginSession();
      return null;
    }
    if (saved.expiresAt < Date.now()) {
      await clearLoginSession();
      return null;
    }
    return saved as LoginSession;
  } catch {
    return null;
  }
}
