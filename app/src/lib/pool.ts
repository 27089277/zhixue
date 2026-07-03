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
}

export function buildPool(questions: Question[], papers: Paper[]): PracticeQ[] {
  const out: PracticeQ[] = [];
  const seen = new Set<string>();
  const push = (q: PracticeQ) => {
    const dedup = `${q.title}`.slice(0, 40);
    if (seen.has(dedup)) return;
    seen.add(dedup);
    out.push(q);
  };
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
      })
    )
  );
  return out;
}
