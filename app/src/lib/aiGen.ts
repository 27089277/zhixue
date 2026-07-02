// App 端 AI 生成/组卷 helper：直接调后端 /ai/*，用 papers.ts 组装，写入 store。
// 不依赖 Web 的 notify/DOM，返回结构化结果由调用方提示。
import { aiPost } from "../api/client";
import { useStore } from "../store/useStore";
import { currentProfile } from "../store/permissions";
import { aiQuestionToPaperItem, normalizePaperSections } from "./papers";
import type { Paper, PaperItem, Question } from "../types";

export interface GenParams {
  subject: string;
  knowledgePoint: string;
  type: string;
  difficulty: string; // 容易/中等/较难
  count: number;
  visibility?: "public" | "teacher" | "private" | "student";
}

async function callGen(p: GenParams) {
  const ai = await aiPost("/ai/generate-questions", {
    subject: p.subject,
    knowledge_point: p.knowledgePoint,
    question_type: p.type,
    difficulty: p.difficulty,
    count: p.count,
    source_scope: "App 生成",
  });
  return ((ai.result?.questions as any[]) || []).slice(0, p.count);
}

// 组卷：生成整卷并写入试卷库
export async function assemblePaper(p: GenParams): Promise<Paper> {
  const store = useStore.getState();
  const raw = await callGen(p);
  const items: PaperItem[] = raw.map((it, i) => aiQuestionToPaperItem(it, i));
  if (!items.length) throw new Error("AI 没有返回可组卷的题目");
  const score = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
  const title = `${p.subject}·${p.knowledgePoint}测验（${items.length}题）`;
  const paper: Paper = {
    id: `app-paper-${Date.now()}`,
    title,
    exam: "AI测验",
    subject: p.subject,
    region: "校本",
    year: new Date().getFullYear(),
    duration: 45,
    score,
    questions: items.length,
    progress: 0,
    difficulty: "中等",
    sections: normalizePaperSections([], items),
    tags: ["AI 组卷", "待校对"],
    visibility: p.visibility || "teacher",
    owner: currentProfile(store).name,
    source: "App AI 组卷",
    sharedWith: [],
    items,
  };
  store.addPaper(paper);
  return paper;
}

// 出题：生成题目写入题库
export async function generateQuestions(p: GenParams): Promise<Question[]> {
  const store = useStore.getState();
  const raw = await callGen(p);
  const owner = currentProfile(store).name;
  const questions: Question[] = raw.map((it: any, i: number) => ({
    title: it.stem || `${p.knowledgePoint} 题目 ${i + 1}`,
    type: it.type || p.type,
    point: (it.knowledge_points || [p.knowledgePoint])[0],
    subject: p.subject,
    source: "App 生成",
    visibility: p.visibility || "teacher",
    owner,
    origin: "AI 生成",
    answer: it.standard_answer || it.answer,
    analysis: it.analysis,
    choices: Array.isArray(it.options) && it.options.length ? it.options : undefined,
    sharedWith: [],
  }));
  if (!questions.length) throw new Error("AI 没有返回题目");
  store.addQuestions(questions);
  return questions;
}
