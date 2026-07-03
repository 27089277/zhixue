// 学生端 AI 出题（一句话）：调用与老师端相同的 /ai/generate-questions，
// 但生成的题**只属于学生本人、只存本地**（visibility=private, origin=student-ai），
// 不 persistQuestion、不进公共/老师题库。错题走学生自己的错题本。
import { aiPost } from "../api/client";
import { parseCount, parseQuestionType, parseSmartIntent } from "../api/ai";
import { useStore } from "../store/useStore";
import { currentProfile } from "../store/permissions";
import type { Question } from "../types";

function parsePoint(query: string, subject: string): string {
  return (
    query.match(/关于([一-龥]{2,12})/)?.[1] ||
    query.match(/([一-龥]{2,10})(?:相关|专项|这一?章|这一?节|的题|题目)/)?.[1] ||
    query.match(/(?:道|个)?([一-龥]{2,12})(?:题|中档|基础|较难)/)?.[1] ||
    `${subject}综合`
  );
}

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

  const ai = await aiPost(
    "/ai/generate-questions",
    {
      subject,
      knowledge_point: point,
      question_type: type,
      difficulty,
      count,
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
