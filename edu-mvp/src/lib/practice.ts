// 学生自主学习题源规则（严格）：历史真题 + 自主练习只允许
// ① 公共题库题（visibility=public） ② 公开的网络/历史真题试卷。
// 老师 teacher/private 内容对学生不可见（作业除外）。
import type { Paper, Question } from "../types";

export function publicBankQuestions(questions: Question[]): Question[] {
  return questions.filter((q) => q.visibility === "public");
}

const REAL_EXAM_KINDS = ["中考", "高考", "真题", "模拟", "联考", "期中", "期末", "月考"];

export function isPublicRealPaper(p: Paper): boolean {
  if (p.visibility !== "public") return false;
  const hay = `${p.exam || ""} ${(p.tags || []).join(" ")} ${p.source || ""}`;
  return REAL_EXAM_KINDS.some((k) => hay.includes(k)) || (p.tags || []).includes("联网导入");
}

export function publicRealPapers(papers: Paper[]): Paper[] {
  return papers.filter(isPublicRealPaper);
}

export interface PracticeWrong {
  key: string;
  subject: string;
  point: string;
  type: string;
  stem: string;
  choices?: string[];
  mine: string;
  answer: string;
  analysis?: string;
  origin: "practice" | "student-ai";
  at: number;
}

export function wrongKey(subject: string, stem: string): string {
  return `${subject}::${(stem || "").replace(/<[^>]+>/g, "").slice(0, 48)}`;
}
