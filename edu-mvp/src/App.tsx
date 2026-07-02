import { useEffect, useRef } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useStore } from "./store/useStore";
import { loadBootstrap } from "./api/bootstrap";
import { bindNavigate, defaultPath } from "./lib/navigation";
import type { Section } from "./types";
import { currentProfile } from "./store/permissions";
import Login from "./pages/Login";
import AppShell from "./components/layout/AppShell";
import Workspace from "./pages/Workspace";
import Org from "./pages/Org";
import Bank from "./pages/Bank";
import Homework from "./pages/Homework";
import Grading from "./pages/Grading";
import VideoPage from "./pages/Video";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import StudentDock from "./pages/student/StudentDock";
import ModalHost from "./components/modals/ModalHost";

// 受权限保护的区段路由：未登录跳登录页，无权限的模块跳回默认页。
function Guarded({ section, children }: { section: Section; children: React.ReactNode }) {
  const authed = useStore((s) => s.authed);
  const s = useStore();
  if (!authed) return <Navigate to="/login" replace />;
  if (!currentProfile(s).allowed.includes(section))
    return <Navigate to={defaultPath(s.role, s.roleProfiles)} replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  const authed = useStore((s) => s.authed);
  if (!authed) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  const navigate = useNavigate();
  const restored = useRef(false);

  // 把 React Router 的 navigate 暴露给 store action 使用。
  bindNavigate(navigate);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    // 登录会话已在建 store 时同步恢复；这里只拉后端真实目录数据。
    loadBootstrap();
    if (import.meta.env.DEV) {
      const m = new URLSearchParams(location.search).get("modal");
      if (m) setTimeout(() => useStore.getState().openModal(m), 200);
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<DefaultRedirect />} />
          <Route path="workspace" element={<Guarded section="workspace"><Workspace /></Guarded>} />
          <Route path="org" element={<Guarded section="org"><Org /></Guarded>} />
          <Route path="bank" element={<Guarded section="bank"><Bank /></Guarded>} />
          <Route path="bank/:view" element={<Guarded section="bank"><Bank /></Guarded>} />
          <Route path="homework" element={<Guarded section="homework"><Homework /></Guarded>} />
          <Route path="grading" element={<Guarded section="grading"><Grading /></Guarded>} />
          <Route path="video" element={<Guarded section="video"><VideoPage /></Guarded>} />
          <Route path="analytics" element={<Guarded section="analytics"><Analytics /></Guarded>} />
          <Route path="admin" element={<Guarded section="admin"><Admin /></Guarded>} />
          <Route path="student" element={<StudentDock />} />
        </Route>
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
      <ModalHost />
    </>
  );
}

function DefaultRedirect() {
  const s = useStore();
  if (!s.authed) return <Navigate to="/login" replace />;
  return <Navigate to={defaultPath(s.role, s.roleProfiles)} replace />;
}

function LoginRoute() {
  const s = useStore();
  if (s.authed) return <Navigate to={defaultPath(s.role, s.roleProfiles)} replace />;
  return <Login />;
}
