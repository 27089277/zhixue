import type { Paper, Question } from "../types";

// 练习题（统一自 题库 + 各试卷题目，保证即使题库为空也有内容可练）
export interface PracticeQ {
  key: string;
  subject: string;
  point: string;
  type: string;
  title: string;
  choices?: string[];
  answer?: string;
  analysis?: string;
  difficulty?: string;
  origin?: "bank" | "paper" | "student-ai";
}

// 题源：公共题库题 + 公开真题卷题 + 学生私有 AI 题（调用方负责先过滤成"公共"）
export function buildPool(
  questions: Question[],
  papers: Paper[],
  mine: Question[] = []
): PracticeQ[] {
  const out: PracticeQ[] = [];
  const seen = new Set<string>();
  const push = (q: PracticeQ) => {
    const dedup = `${q.title}`.slice(0, 40);
    if (seen.has(dedup)) return;
    seen.add(dedup);
    out.push(q);
  };
  // 学生私有 AI 题排在最前（最新自练优先）
  mine.forEach((q, i) =>
    push({
      key: `ai-${q.id ?? i}-${i}`,
      subject: q.subject || "综合",
      point: q.point || "未分类",
      type: q.type,
      title: q.title,
      choices: q.choices,
      answer: q.answer,
      analysis: q.analysis,
      difficulty: q.difficulty,
      origin: "student-ai",
    })
  );
  questions.forEach((q, i) =>
    push({
      key: `q-${q.id ?? i}`,
      subject: q.subject || "综合",
      point: q.point || "未分类",
      type: q.type,
      title: q.title,
      choices: q.choices,
      answer: q.answer,
      analysis: q.analysis,
      difficulty: q.difficulty,
      origin: "bank",
    })
  );
  papers.forEach((p) =>
    (p.items || []).forEach((it, i) =>
      push({
        key: `p-${p.id}-${it.no ?? i}`,
        subject: p.subject || "综合",
        point: (it.knowledge || [])[0] || p.subject || "未分类",
        type: it.type,
        title: it.title,
        choices: it.choices,
        answer: it.answer,
        analysis: it.analysis,
        origin: "paper",
      })
    )
  );
  return out;
}
