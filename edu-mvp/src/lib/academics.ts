// 学科 / 学段 / 年级 / 题型 公共常量。

export const SUBJECTS = [
  "语文",
  "数学",
  "英语",
  "物理",
  "化学",
  "生物",
  "政治",
  "历史",
  "地理",
  "道德与法治",
  "科学",
  "信息技术",
] as const;

export const STAGES = ["小学", "初中", "高中"] as const;

const GRADES: Record<string, string[]> = {
  小学: ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"],
  初中: ["初一", "初二", "初三"],
  高中: ["高一", "高二", "高三"],
};

export function gradesForStage(stage: string): string[] {
  return GRADES[stage] || [];
}

// 覆盖常见全题型；选择/判断走选项+正确答案，其余走参考答案。
export const QUESTION_TYPES = [
  "单选题",
  "多选题",
  "判断题",
  "填空题",
  "简答题",
  "解答题",
  "计算题",
  "论述题",
  "作文题",
  "完形填空",
  "阅读理解",
  "实验题",
] as const;

export function isChoiceType(type: string): boolean {
  return type === "单选题" || type === "多选题" || type === "判断题";
}

export function isSingleChoice(type: string): boolean {
  return type === "单选题" || type === "判断题";
}
