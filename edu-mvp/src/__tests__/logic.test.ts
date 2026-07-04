import { describe, it, expect } from "vitest";
import {
  parseCount,
  parseTotalCount,
  parseStageGrade,
  parseQuestionType,
  parseSmartIntent,
} from "../api/ai";
import {
  publicBankQuestions,
  publicRealPapers,
  isPublicRealPaper,
} from "../lib/practice";
import { isObjectiveCorrect } from "../lib/papers";
import { difficultyStars, starText, difficultyLabel } from "../lib/difficulty";
import type { Paper, Question } from "../types";

// ---- AI 一句话解析：数量/学段/题型/学科（这些是最容易回归、用户踩过的点）----
describe("parseCount / parseTotalCount", () => {
  it("单段数量取该数字", () => {
    expect(parseCount("给我来 6 道单选题", 10)).toBe(6);
    expect(parseCount("三道填空", 10)).toBe(3);
    expect(parseCount("没写数量", 10)).toBe(10); // 兜底
  });

  it("显式总数优先，避免『一共20，前19，最后1』=40 的误加", () => {
    const q = "出一套小学一年级十以内加减法，一共20道题，前19道是单选题，最后一道题是应用题";
    expect(parseTotalCount(q, 10)).toBe(20);
  });

  it("无总数时把分段相加：19单选+1应用=20", () => {
    expect(parseTotalCount("19道单选题，1道应用题", 10)).toBe(20);
  });

  it("中文『共二十道』也识别为总数", () => {
    expect(parseTotalCount("一共二十道，含十道单选", 6)).toBe(20);
  });
});

describe("parseStageGrade", () => {
  it("小学/初中/高中 学段识别", () => {
    expect(parseStageGrade("小学一年级十以内加减").stage).toBe("小学");
    expect(parseStageGrade("初二物理").stage).toBe("初中");
    expect(parseStageGrade("高三导数").stage).toBe("高中");
  });
  it("年级抽取", () => {
    expect(parseStageGrade("小学三年级").grade).toBe("三年级");
    expect(parseStageGrade("初二数学").grade).toBe("初二");
  });
});

describe("parseQuestionType / parseSmartIntent", () => {
  it("题型识别", () => {
    expect(parseQuestionType("出5道填空题")).toContain("填空");
    expect(parseQuestionType("来几道解答题")).toContain("解答");
    expect(parseQuestionType("默认")).toContain("单选");
  });
  it("学科识别", () => {
    expect(parseSmartIntent("初中物理电阻").subject).toBe("物理");
    expect(parseSmartIntent("十以内加减法").subject).toBe("数学"); // 默认数学
  });
});

// ---- 学生自主学习题源规则：只允许公共题库题 + 公开真题卷 ----
function paper(p: Partial<Paper>): Paper {
  return {
    id: p.id || "x", title: p.title || "卷", exam: p.exam || "", subject: p.subject || "数学",
    region: p.region || "", year: p.year || 2025, duration: 45, score: 100, questions: 1,
    progress: 0, difficulty: "中等", sections: [], tags: p.tags || [], visibility: p.visibility,
    owner: "张老师", source: p.source || "", sharedWith: [], items: [],
    ...p,
  } as Paper;
}

describe("练习题源规则", () => {
  it("publicBankQuestions 只保留 public 可见题", () => {
    const qs = [
      { title: "公开题", type: "单选题", point: "x", subject: "数学", visibility: "public" },
      { title: "老师题", type: "单选题", point: "x", subject: "数学", visibility: "teacher" },
      { title: "学生题", type: "单选题", point: "x", subject: "数学", visibility: "student" },
    ] as Question[];
    const out = publicBankQuestions(qs);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe("公开题");
  });

  it("isPublicRealPaper：必须公开且是真题/中考/联网导入", () => {
    expect(isPublicRealPaper(paper({ visibility: "public", exam: "中考真题" }))).toBe(true);
    expect(isPublicRealPaper(paper({ visibility: "public", tags: ["联网导入"] }))).toBe(true);
    // 老师私有卷不算
    expect(isPublicRealPaper(paper({ visibility: "teacher", exam: "中考真题" }))).toBe(false);
    // 公开但非真题（普通组卷）不算
    expect(isPublicRealPaper(paper({ visibility: "public", exam: "AI测验", tags: ["AI 组卷"] }))).toBe(false);
  });

  it("publicRealPapers 过滤出公开真题卷", () => {
    const list = [
      paper({ id: "a", visibility: "public", exam: "中考真题" }),
      paper({ id: "b", visibility: "teacher", exam: "中考真题" }),
      paper({ id: "c", visibility: "public", exam: "AI测验" }),
    ];
    const out = publicRealPapers(list).map((p) => p.id);
    expect(out).toEqual(["a"]);
  });
});

// ---- 客观题判分（含多选无序比对）----
describe("isObjectiveCorrect", () => {
  it("单选/判断：去空白全等", () => {
    expect(isObjectiveCorrect("单选题", "B", "B")).toBe(true);
    expect(isObjectiveCorrect("单选题", "B", " b ")).toBe(false); // 大小写敏感、单选不做集合
    expect(isObjectiveCorrect("判断题", "A", "A")).toBe(true);
  });
  it("填空：全等", () => {
    expect(isObjectiveCorrect("填空题", "42", "42")).toBe(true);
    expect(isObjectiveCorrect("填空题", "42", "43")).toBe(false);
  });
  it("多选：字母集合无序比对", () => {
    expect(isObjectiveCorrect("多选题", "AC", "CA")).toBe(true);
    expect(isObjectiveCorrect("多选题", "AC", "A,C")).toBe(true);
    expect(isObjectiveCorrect("多选题", "ABD", "ABD")).toBe(true);
    expect(isObjectiveCorrect("多选题", "AC", "A")).toBe(false); // 漏选
    expect(isObjectiveCorrect("多选题", "AC", "ABC")).toBe(false); // 多选
  });
  it("空作答判错", () => {
    expect(isObjectiveCorrect("单选题", "A", "")).toBe(false);
    expect(isObjectiveCorrect("多选题", "AC", "")).toBe(false);
  });
});

// ---- 难度星级 ----
describe("difficulty", () => {
  it("难度→星级", () => {
    expect(difficultyStars("容易")).toBe(2);
    expect(difficultyStars("困难")).toBe(5);
    expect(difficultyStars("中等")).toBe(3);
  });
  it("starText 输出星星", () => {
    expect(starText(3)).toMatch(/★/);
  });
  it("difficultyLabel：原样返回，空值兜底中等", () => {
    expect(difficultyLabel("基础")).toBe("基础");
    expect(difficultyLabel(undefined)).toBe("中等");
  });
});
