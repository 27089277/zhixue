import type { ReactNode } from "react";
import AppBreadcrumb from "./AppBreadcrumb";

// 页面外壳：AntD 面包屑 + 标题工具栏 + 内容。
export default function PageShell({
  title,
  actions,
  children,
}: {
  eyebrow?: string; // 兼容旧调用，现已由面包屑替代
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="toolbar-line">
        <div>
          <AppBreadcrumb />
          {title ? <h2 style={{ margin: "4px 0 0" }}>{title}</h2> : null}
        </div>
        <div className="page-actions">{actions}</div>
      </div>
      {children}
    </>
  );
}
