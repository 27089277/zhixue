import { Breadcrumb } from "antd";
import { useLocation } from "react-router-dom";
import type { BankView, Section } from "../../types";

// 用 AntD Breadcrumb 显示当前位置，如「题库管理 / 题目」，随路由变化。
const SECTION_LABEL: Record<Section | "student", string> = {
  workspace: "工作台",
  org: "组织与班级",
  bank: "题库管理",
  homework: "作业与考试",
  grading: "批改与评价",
  video: "讲题视频",
  analytics: "学情分析",
  admin: "后台管理",
  student: "学生学习空间",
};

const BANK_VIEW_LABEL: Record<BankView, string> = {
  questions: "题目",
  papers: "试卷",
  videos: "讲解视频",
};

export default function AppBreadcrumb() {
  const { pathname } = useLocation();
  const seg = pathname.split("/").filter(Boolean);
  const first = (seg[0] || "workspace") as Section | "student";

  const items: { title: string }[] = [{ title: "智学云教" }, { title: SECTION_LABEL[first] || "工作台" }];
  if (first === "bank") {
    const view = (seg[1] as BankView) || "questions";
    items.push({ title: BANK_VIEW_LABEL[view] || "题目" });
  }

  return <Breadcrumb items={items} style={{ marginBottom: 4 }} />;
}
