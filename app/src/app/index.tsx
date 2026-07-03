import { Redirect } from "expo-router";
import { useStore } from "@/store/useStore";

// 认证网关：未登录去登录页，已登录按角色进对应 Tab 组。
export default function Index() {
  const authed = useStore((s) => s.authed);
  const role = useStore((s) => s.role);
  if (!authed) return <Redirect href="/login" />;
  if (role === "student") return <Redirect href="/(student)" />;
  if (role === "admin") return <Redirect href="/(admin)" />;
  return <Redirect href="/(teacher)" />;
}
