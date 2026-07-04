// 试卷/题目处理工具，移植自 legacy app.js (601-703)，并包含 preparePapers 归一化修复。
import type { Paper, PaperItem, Question } from "../types";

// 客观题判分：多选题按「字母集合(无序)」比对；其余按去空白全等。
export function isObjectiveCorrect(type: string, answerKey?: string, value?: string): boolean {
  const a = String(value ?? "").trim();
  const key = String(answerKey ?? "").trim();
  if (!a) return false;
  if (type === "多选题") {
    const norm = (s: string) =>
      s.toUpperCase().replace(/[^A-Z]/g, "").split("").sort().join("");
    const na = norm(a);
    return na !== "" && na === norm(key);
  }
  return a === key;
}

export function stripChoiceLabel(value: unknown): string {
  return String(value ?? "")
    .replace(/^[A-H][.、．]\s*/i, "")
    .trim();
}

export function normalizeAiOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  return options
    .map((option) => {
      if (typeof option === "string") return stripChoiceLabel(option);
      if (option && typeof option === "object") {
        const o = option as Record<string, unknown>;
        return stripChoiceLabel(o.text ?? o.value ?? o.content ?? o.label);
      }
      return stripChoiceLabel(option);
    })
    .filter(Boolean);
}

export function aiQuestionToPaperItem(item: any = {}, index = 0): PaperItem {
  const type = item.type || item.question_type || "单选题";
  const score =
    Number(item.score || item.points || item.full_score) ||
    (String(type).includes("解答") ? 10 : 4);
  const knowledge = Array.isArray(item.knowledge_points)
    ? item.knowledge_points
    : [item.knowledge_point || item.point].filter(Boolean);
  return {
    no: Number(item.number || item.no) || index + 1,
    type,
    title: item.stem || item.title || item.question || `第 ${index + 1} 题`,
    choices: normalizeAiOptions(item.options || item.choices),
    answer: item.standard_answer || item.answer || item.reference_answer || "",
    analysis: item.analysis || item.explanation || item.solution || "",
    score,
    knowledge,
    status: "未答",
  };
}

export function normalizePaperSections(
  sections: any[] = [],
  items: PaperItem[] = []
): string[] {
  if (Array.isArray(sections) && sections.length) {
    return sections
      .map((section) => {
        if (typeof section === "string") return section;
        return `${section.name || section.title || section.section || "题组"} ${
          section.count || section.question_count || ""
        }`.trim();
      })
      .filter(Boolean);
  }
  const counts = items.reduce<Record<string, number>>((result, item) => {
    result[item.type] = (result[item.type] || 0) + 1;
    return result;
  }, {});
  const normalized = Object.entries(counts).map(
    ([type, count]) => `${type} ${count}`
  );
  return normalized.length ? normalized : ["选择题", "填空题", "解答题"];
}

export function createBankQuestionFromPaperItem(
  item: PaperItem,
  paper: Paper,
  index: number,
  ownerFallback: string
): Question {
  return {
    title: item.title || `${paper.title} 第 ${index + 1} 题`,
    type: item.type || "单选题",
    point: (item.knowledge || [])[0] || "综合应用",
    source: paper.title,
    visibility: paper.visibility || "teacher",
    owner: paper.owner || ownerFallback,
    origin: "试卷导入",
    paperId: paper.id,
    paperTitle: paper.title,
  };
}

// preparePapers：只做归一化，不再编造占位题（此前会把任意试卷填成"数学题"，导致学科错乱）。
// 试卷有多少真实题就展示多少；questions 以真实 items 数为准。
export function preparePapers(papers: Paper[]): Paper[] {
  return papers.map((paper) => {
    const items: PaperItem[] = (Array.isArray(paper.items) ? paper.items : []).map(
      (it, index) => ({
        ...it,
        no: it.no ?? index + 1,
        status: it.status || "未答",
      })
    );
    const sections =
      Array.isArray(paper.sections) && paper.sections.length
        ? paper.sections
        : normalizePaperSections([], items);
    return { ...paper, questions: items.length, items, sections };
  });
}
