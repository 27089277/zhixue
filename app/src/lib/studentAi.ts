// 学生端 AI 出题（一句话，同 Web 输入体验）：调用与老师端相同的 /ai/generate-questions，
// 但生成的题**只属于学生本人、只存本地**（visibility=private, origin=student-ai），
// 不 persistQuestion、不进公共/老师题库。错题走学生自己的错题本。
import { aiPost } from "../api/client";
import { parseCount, parseQuestionType, parseSmartIntent, parseStageGrade } from "../api/ai";
import { useStore } from "../store/useStore";
import { currentProfile } from "../store/permissions";
import { aiQuestionToPaperItem, normalizePaperSections } from "./papers";
import type { Paper, Question } from "../types";

function parsePoint(query: string, subject: string): string {
  return (
    query.match(/关于([一-龥]{2,12})/)?.[1] ||
    query.match(/([一-龥]{2,10})(?:相关|专项|这一?章|这一?节|的题|题目)/)?.[1] ||
    query.match(/(?:道|个)?([一-龥]{2,12})(?:题|中档|基础|较难)/)?.[1] ||
    `${subject}综合`
  );
}

// 返回生成的私有题（已写入 store.myPracticeQuestions）
export async function generateStudentPractice(
  query: string,
  signal?: AbortSignal
): Promise<Question[]> {
  const store = useStore.getState();
  const intent = parseSmartIntent(query);
  const subject = intent.subject;
  const point = parsePoint(query, subject);
  const type = parseQuestionType(query);
  const count = parseCount(query, 5);
  const difficulty = query.includes("较难")
    ? "较难"
    : query.includes("基础") || query.includes("简单")
    ? "容易"
    : "中等";

  const { grade } = parseStageGrade(query);
  const ai = await aiPost(
    "/ai/generate-questions",
    {
      subject,
      knowledge_point: point,
      question_type: type,
      difficulty,
      count,
      grade,
      notes: query,
      source_scope: "学生自练",
    },
    signal
  );

  const owner = currentProfile(store).name;
  const generated: Question[] = ((ai.result?.questions as any[]) || [])
    .slice(0, count)
    .map((item, index) => ({
      title: item.stem || `${point} 练习题 ${index + 1}`,
      type: item.type || type,
      point: (item.knowledge_points || [point])[0],
      subject,
      source: "学生 AI 自练",
      visibility: "private" as const,
      owner,
      origin: "student-ai",
      answer: item.standard_answer || item.answer,
      analysis: item.analysis,
      choices:
        Array.isArray(item.options) && item.options.length ? item.options : undefined,
      sharedWith: [],
    }));

  if (!generated.length) throw new Error("AI 没有返回题目，换个说法再试试");
  store.addMyPracticeQuestions(generated);
  return generated;
}

// 历史真题·联网搜索：题库找不到时，用 GenAI 联网检索/解析出整套真题卷。
// 结果为**学生私有、只存本地**（visibility=student, persist:false），可直接进入作答。
export async function importRealPaperFromWeb(
  query: string,
  signal?: AbortSignal
): Promise<Paper> {
  const store = useStore.getState();
  const intent = parseSmartIntent(query);
  const fallbackTitle = `${intent.year} ${intent.region}${intent.exam}${intent.subject}卷`;

  const ai = await aiPost(
    "/ai/web-import-paper",
    {
      title: fallbackTitle,
      subject: intent.subject,
      exam_type: intent.exam,
      region: intent.region,
      year: intent.year,
      question_count: 20,
      total_score: 120,
      duration_minutes: 100,
      query,
    },
    signal
  );

  const aiQuestions: any[] = ai.result?.questions || [];
  const aiPaper: any = ai.result?.paper || {};
  if (!aiQuestions.length && !aiPaper.title) {
    throw new Error("网络上没检索到匹配的真题，换个说法或年份再试");
  }
  const items = aiQuestions.map((it, i) => aiQuestionToPaperItem(it, i));
  const score =
    aiPaper.total_score ||
    items.reduce((sum, it) => sum + (Number(it.score) || 0), 0) ||
    120;
  const paper: Paper = {
    id: `stu-real-${Date.now()}`,
    title: aiPaper.title || fallbackTitle,
    exam: aiPaper.exam_type || intent.exam,
    subject: aiPaper.subject || intent.subject,
    region: aiPaper.region || intent.region,
    year: aiPaper.year || intent.year,
    duration: aiPaper.duration_minutes || 100,
    score,
    questions: Math.max(1, items.length),
    progress: 0,
    difficulty: "中等",
    sections: normalizePaperSections(aiPaper.sections, items),
    tags: ["联网导入", "真题", "我的私有"],
    visibility: "student",
    owner: currentProfile(store).name,
    source: "AI 联网真题（我的私有）",
    sharedWith: [],
    items,
  };
  store.addPaper(paper, { persist: false }); // 只存本地，不进后端/公共库
  return paper;
}
