import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { currentProfile, hasPermission } from "../../store/permissions";
import type { BankView, Role, Section } from "../../types";
import { clearLoginSession } from "../../lib/session";
import { useNotify } from "../../hooks/useNotify";
import { getStudentUnread, getTeacherUnread } from "../../api/teacherDirectory";

const NAV: { section: Section; icon: string; label: string }[] = [
  { section: "workspace", icon: "▦", label: "工作台" },
  { section: "org", icon: "▤", label: "组织与班级" },
  { section: "bank", icon: "▧", label: "题库管理" },
  { section: "homework", icon: "☑", label: "作业与考试" },
  { section: "grading", icon: "✎", label: "批改与评价" },
  { section: "analytics", icon: "◌", label: "学情分析" },
  { section: "admin", icon: "⚙", label: "后台管理" },
];

const ROLE_TITLE: Record<Role, string> = {
  teacher: "老师工作台",
  student: "学生学习空间",
  admin: "管理后台",
};

const BANK_VIEWS: { view: BankView; label: string }[] = [
  { view: "questions", label: "题目" },
  { view: "papers", label: "试卷" },
];

// 学生的“工作台”入口指向答题端 /student。
function navTarget(role: Role, section: Section): string {
  if (role === "student" && section === "workspace") return "/student";
  return `/${section}`;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const s = useStore();
  const notify = useNotify();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = currentProfile(s);

  // URL → store.section 同步，保证侧栏高亮、AI 上下文等与地址栏一致。
  useEffect(() => {
    const path = location.pathname.replace(/^\//, "") || "workspace";
    const seg = (path === "student" ? "workspace" : path) as Section;
    if (NAV.some((n) => n.section === seg) && s.section !== seg) {
      useStore.setState({ section: seg });
    }
  }, [location.pathname, s.section]);

  // 通知未读数（师/生消息，真实来自后端），每 20 秒刷新。
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!s.currentUserPhone || s.role === "admin") {
      setUnread(0);
      return;
    }
    let alive = true;
    const fetcher = s.role === "teacher" ? getTeacherUnread : getStudentUnread;
    const tick = () =>
      fetcher(s.currentUserPhone)
        .then((r) => alive && setUnread(r.unread || 0))
        .catch(() => {});
    tick();
    const id = window.setInterval(tick, 20000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [s.role, s.currentUserPhone, s.activeModal]);

  // 只渲染当前角色有权限的导航项（无权限的不显示）。
  const navItems = NAV.filter((item) => hasPermission(s, item.section));

  const seg = location.pathname.split("/").filter(Boolean);
  const activeSection = (
    location.pathname === "/student" ? "workspace" : seg[0] || "workspace"
  ) as Section;
  const currentBankView = (seg[0] === "bank" ? seg[1] || "questions" : "") as BankView;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">智</div>
          <div>
            <strong>智学云教</strong>
            <span>题练讲评一体化</span>
          </div>
        </div>
        <nav className="side-nav" aria-label="主导航">
          {navItems.map((item) => {
            const active = activeSection === item.section;
            return (
              <div key={item.section}>
                <button
                  className={active ? "active" : ""}
                  onClick={() => navigate(navTarget(s.role, item.section))}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
                {item.section === "bank" && active && (
                  <div className="side-subnav">
                    {BANK_VIEWS.map((b) => (
                      <button
                        key={b.view}
                        type="button"
                        className={currentBankView === b.view ? "active" : ""}
                        onClick={() => navigate(`/bank/${b.view}`)}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="teacher-card">
          <div className="avatar">{profile.avatar}</div>
          <div>
            <strong>{profile.name}</strong>
            <span>{profile.scope}</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar topbar-clean">
          <div className="topbar-title">
            <strong>{ROLE_TITLE[s.role]}</strong>
            <span>{profile.scope}</span>
          </div>
          <div className="top-actions">
            {hasPermission(s, "admin") && (
              <button className="ghost" onClick={() => s.openModal("permission")}>
                权限
              </button>
            )}
            <button
              className="ghost"
              onClick={() => {
                if (s.role === "student") navigate("/student");
                else s.openModal("messageCenter");
              }}
            >
              通知 {unread > 0 && <b>{unread}</b>}
            </button>
            {hasPermission(s, "homework") && (
              <button className="primary" onClick={() => s.switchSection("homework")}>
                发布作业
              </button>
            )}
            <button
              className="ghost"
              onClick={() => {
                clearLoginSession();
                s.logout();
              }}
            >
              退出
            </button>
          </div>
        </header>

        {/* 统一内容容器：限宽 + 居中 + 留白 + 响应式（对齐旧版 .section-page） */}
        <div className="section-page">{children}</div>
      </main>
    </div>
  );
}
