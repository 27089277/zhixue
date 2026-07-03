// AI 业务流程，移植自 legacy app.js（aiContextFor/mockAiAnalysis/parseSmartIntent/executeSmartAiRequest）。
import { aiPost, aiErrorMessage } from "./client";
import { useStore } from "../store/useStore";
import { currentProfile, visibleClasses, visibleQuestions } from "../store/permissions";
import {
  aiQuestionToPaperItem,
  createBankQuestionFromPaperItem,
  normalizePaperSections,
  preparePapers,
} from "../lib/papers";
import type { Paper, Question, Section } from "../types";

export const aiSceneNames: Record<string, string> = {
  workspace: "教学首页",
  org: "班级与学生管理",
  bank: "题库管理",
  homework: "作业与考试",
  grading: "批改与评价",
  video: "讲题视频",
  analytics: "学情分析",
  admin: "后台管理",
};

export function aiContextFor(section?: Section) {
  const s = useStore.getState();
  const scene = section || s.section;
  const classes = visibleClasses(s);
  return {
    role: s.role,
    scene: aiSceneNames[scene] || scene,
    classes: classes.map((item) => ({
      name: item.name,
      count: item.count,
      completion: item.rate,
    })),
    students: classes.reduce((sum, item) => sum + item.count, 0),
    questions: visibleQuestions(s).length,
    papers: s.papers.length,
    assignments: s.assignments.filter((item) =>
      classes.some((cls) => cls.name === item.className)
    ).length,
    videos: s.videos.length,
    knowledge: s.knowledge,
    pendingManual: 12,
    riskStudents: s.risk,
  };
}

export interface AiInsight {
  summary: string;
  insights: { title: string; detail: string; priority: string }[];
  actions: { label: string; target_module: string; reason: string }[];
  risks: { name: string; reason: string; suggestion: string }[];
}

export function mockAiAnalysis(scene: string): AiInsight {
  const name = aiSceneNames[scene] || "当前模块";
  const presets: Record<string, string[]> = {
    workspace: ["优先处理 12 份主观题，再提醒 8 名未提交学生。", "本周均分上升，但几何证明仍是风险点。"],
    org: ["张老师只应管理授权班级，建议继续按班级筛选学生。", "需关注学生应加入本周跟进计划。"],
    bank: ["公共真题、教师题库、学生练习库边界清晰，导入后建议先审核再公开。", "AI 搜真题适合先生成草稿，再人工校对答案解析。"],
    homework: ["整卷发布适合考试，题库选题适合作业和测验。", "建议给未提交学生设置自动提醒。"],
    grading: ["主观题建议按题集中批改，并用 AI 生成初评语。", "低分学生应自动进入错题和讲题视频推荐。"],
    video: ["讲题视频应绑定知识点、题目和作业结果。", "未观看学生可进入提醒队列。"],
    analytics: ["班级薄弱点集中在相似三角形和二次函数。", "建议按风险学生生成分层练习。"],
    admin: ["建议检查账号、权限边界和异常登录。", "SSO 与手机验证码登录需要审计日志。"],
  };
  const insights = presets[scene] || [`${name} 可加入 AI 总结、风险识别和下一步建议。`];
  return {
    summary: `${name} AI 分析已生成`,
    insights: insights.map((detail, index) => ({
      title: index ? "补充观察" : "重点建议",
      detail,
      priority: index ? "中" : "高",
    })),
    actions: [
      { label: "生成跟进计划", target_module: scene, reason: "把分析转成可执行任务" },
      { label: "推送个性化练习", target_module: "homework", reason: "针对薄弱知识点补练" },
    ],
    risks: [{ name: "数据需复核", reason: "当前为原型数据", suggestion: "正式版接 MySQL 和审计日志后再自动执行" }],
  };
}

export async function fetchAiInsight(scene: string): Promise<AiInsight> {
  try {
    const ai = await aiPost("/ai/analyze", {
      scene: aiSceneNames[scene] || scene,
      role: useStore.getState().role,
      question: "",
      context: aiContextFor(scene as Section),
    });
    const r = ai.result || {};
    if (r.summary || r.insights) return r as AiInsight;
    return mockAiAnalysis(scene);
  } catch {
    return mockAiAnalysis(scene);
  }
}

// 解析题目数量：支持阿拉伯数字与中文数字（一/两/十/二十…）。
function cnToNum(s: string): number | null {
  const d: Record<string, number> = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (s === "十") return 10;
  if (s.includes("十")) {
    const [a, b] = s.split("十");
    return (a ? d[a] ?? 1 : 1) * 10 + (b ? d[b] ?? 0 : 0);
  }
  return d[s] ?? null;
}
export function parseCount(query: string, def: number): number {
  const m = query.match(/(\d+)\s*(?:道|个|题)/);
  if (m) return Number(m[1]);
  const cm = query.match(/([零一二两三四五六七八九十]+)\s*(?:道|个|题)/);
  if (cm) {
    const n = cnToNum(cm[1]);
    if (n && n > 0) return n;
  }
  return def;
}

// 总题量：把「19道单选题，1道应用」这类多段数量相加（组卷需要正确的总数）。
export function parseTotalCount(query: string, def: number): number {
  let total = 0;
  const re = /(\d+)\s*(?:道|个|题)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(query))) total += Number(m[1]);
  const cre = /([零一二两三四五六七八九十]+)\s*(?:道|个|题)/g;
  let cm: RegExpExecArray | null;
  while ((cm = cre.exec(query))) {
    const n = cnToNum(cm[1]);
    if (n && n > 0) total += n;
  }
  return total > 0 ? total : def;
}

// 解析题型：作文/简答/解答/计算/填空/判断/多选/单选
export function parseQuestionType(query: string): string {
  if (/作文/.test(query)) return "作文题";
  if (/简答/.test(query)) return "简答题";
  if (/计算/.test(query)) return "计算题";
  if (/解答|大题|论述/.test(query)) return "解答题";
  if (/填空/.test(query)) return "填空题";
  if (/判断/.test(query)) return "判断题";
  if (/多选/.test(query)) return "多选题";
  return "单选题";
}

// 解析目标题库：公共库 / 学生练习库 / 教师私人库
export function parseTargetLibrary(query: string): { visibility: "public" | "student" | "teacher" | "private"; source: string } {
  // 私人库优先识别（仅自己 / 私人 / 不公开）
  if (/私人|仅自己|不公开|私有/.test(query)) return { visibility: "private", source: "教师私人库" };
  if (/公共|公开|真题库/.test(query)) return { visibility: "public", source: "公共真题库" };
  if (/学生(练习|库|可练)/.test(query)) return { visibility: "student", source: "学生练习库" };
  return { visibility: "teacher", source: "教师题库" };
}

// 解析学段/年级
export function parseStageGrade(query: string): { stage: string; grade: string } {
  const stage = /高中|高一|高二|高三|高考/.test(query)
    ? "高中"
    : /小学|一年级|二年级|三年级|四年级|五年级|六年级/.test(query)
    ? "小学"
    : "初中";
  const g = query.match(/(初[一二三]|高[一二三]|[一二三四五六]年级)/);
  const grade = g ? g[1] : stage === "高中" ? "高一" : stage === "小学" ? "一年级" : "初三";
  return { stage, grade };
}

export function parseSmartIntent(query: string) {
  const yearMatch = query.match(/20\d{2}/);
  const subject = query.includes("物理")
    ? "物理"
    : query.includes("语文")
    ? "语文"
    : query.includes("英语")
    ? "英语"
    : query.includes("化学")
    ? "化学"
    : "数学";
  return {
    isGenerate: /生成|出题|新增题|题目/.test(query) && !/真题|试卷|卷/.test(query),
    isAssemble: /组卷|测验|考试|作业|一张/.test(query) && !/真题/.test(query),
    year: yearMatch ? Number(yearMatch[0]) : new Date().getFullYear(),
    subject,
    region: query.match(/([一-龥]{2,4})(?:中考|高考|期末|真题)/)?.[1] || "本地",
    exam: query.includes("高考")
      ? "高考真题"
      : query.includes("期末")
      ? "期末真题"
      : query.includes("测验")
      ? "测验"
      : "中考真题",
  };
}

export type Notify = (type: "success" | "error" | "info", msg: string) => void;

export interface SmartOptions {
  mode?: string;
  sourceUrl?: string;
  rawText?: string; // 上传文件解析出的原文（走 /ai/import-paper 解析入库）
  notify?: Notify;
  onStatus?: (msg: string, busy: boolean) => void;
  signal?: AbortSignal;
  title?: string; // 用户自定义试卷名称（组卷时优先使用，留空则自动命名）
}

// 智能 AI 请求：生成题目 / 自动组卷 / 联网导入整卷 / 生成视频脚本。
// 移植自 executeSmartAiRequest，状态读写改走 zustand。
export async function executeSmartAiRequest(query: string, options: SmartOptions = {}) {
  const { notify = () => {}, onStatus = () => {}, sourceUrl = "" } = options;
  const store = useStore.getState();
  if (store.aiBusy) return;
  if (!query.trim()) {
    notify("info", "请输入要交给 AI 处理的需求");
    return;
  }
  const profileName = currentProfile(store).name;
  store.setAiBusy(true);
  onStatus("AI 正在理解需求...", true);
  try {
    const selectedMode = options.mode || store.aiMode || "auto";
    if (selectedMode === "video") {
      const title = query.slice(0, 28) || "AI 讲解视频脚本";
      const active = useStore.getState().papers.find(
        (p) => p.id === useStore.getState().activePaperId
      );
      store.addVideo({
        name: `${title}.mp4`,
        size: "脚本待录制",
        progress: 0,
        status: "脚本草稿",
        owner: profileName,
        source: "AI 生成脚本",
        paperTitle: active?.title || "未关联试卷",
        point: store.knowledge[0]?.name || "综合讲解",
      });
      notify("success", "AI 已生成讲解视频脚本草稿，可继续上传成片");
      return;
    }
    const intent = parseSmartIntent(query);
    if (selectedMode === "generate") {
      intent.isGenerate = true;
      intent.isAssemble = false;
    }
    if (selectedMode === "assemble") {
      intent.isGenerate = false;
      intent.isAssemble = true;
    }
    if (selectedMode === "web" || selectedMode === "import") {
      intent.isGenerate = false;
      intent.isAssemble = false;
    }

    if (intent.isGenerate) {
      const questionType = parseQuestionType(query);
      const { visibility, source } = parseTargetLibrary(query);
      const { stage, grade } = parseStageGrade(query);
      const point =
        query.match(/(?:道|个)?([一-龥]{2,12})(?:题|中档|基础|较难)/)?.[1] ||
        `${intent.subject}综合`;
      const count = parseCount(query, 6);
      onStatus("DeepSeek 正在生成题目与解析...", true);
      const ai = await aiPost("/ai/generate-questions", {
        subject: intent.subject,
        knowledge_point: point,
        question_type: questionType,
        difficulty: query.includes("较难") ? "较难" : query.includes("基础") ? "容易" : "中等",
        count,
        grade,
        notes: query, // 原始一句话，交后端精确贴合学段/难度
        source_scope: source,
      }, options.signal);
      const generated: Question[] = (ai.result.questions || []).map(
        (item: any, index: number) => ({
          title: item.stem || `${point} AI 题目 ${index + 1}`,
          type: item.type || questionType,
          point: (item.knowledge_points || [point])[0],
          subject: intent.subject,
          stage,
          grade,
          source,
          visibility,
          // 可见性可为公共/学生，但 owner 始终是创建老师 —— 创建者才能编辑/删除，其他人只读
          owner: profileName,
          origin: "AI 生成",
          answer: item.standard_answer || item.answer,
          analysis: item.analysis,
          choices: Array.isArray(item.options) && item.options.length ? item.options : undefined,
          sharedWith: [],
        })
      );
      if (!generated.length) throw new Error("DeepSeek 没有返回题目结构");
      // 严格按要求数量（模型可能多/少返回）
      const finalQuestions = generated.slice(0, count);
      store.addQuestions(finalQuestions);
      notify("success", `DeepSeek 已生成 ${finalQuestions.length} 道${questionType}，已放入${source}`);
    } else if (intent.isAssemble) {
      const lib = parseTargetLibrary(query);
      const count = parseTotalCount(query, 10);
      // 知识点优先取「关于X / X相关 / X专项」，否则退回学科综合（避免把“生成一套初中物理”当成知识点）
      const point =
        query.match(/关于([一-龥]{2,12})/)?.[1] ||
        query.match(/([一-龥]{2,10})(?:相关|专项|这一?章|这一?节)/)?.[1] ||
        `${intent.subject}综合`;
      const title =
        options.title?.trim() ||
        (point && !point.endsWith("综合")
          ? `${intent.subject}·${point}测验（${count}题）`
          : `${intent.subject}测验卷（${count}题）`);
      onStatus("DeepSeek 正在生成整卷题目…", true);
      const { grade } = parseStageGrade(query);
      // 直接生成该学科的真实题目组成整卷（不再只出蓝图、不再塞题库）
      const ai = await aiPost("/ai/generate-questions", {
        subject: intent.subject,
        knowledge_point: point,
        question_type: query.includes("解答") ? "解答题" : "单选题",
        difficulty: query.includes("较难") ? "较难" : query.includes("基础") ? "容易" : "中等",
        count,
        grade,
        notes: query,
        source_scope: "试卷组卷",
      }, options.signal);
      const items = (ai.result.questions || [])
        .slice(0, count)
        .map((it: any, i: number) => aiQuestionToPaperItem(it, i));
      if (!items.length) throw new Error("DeepSeek 没有返回可组卷的题目");
      const score = items.reduce((sum: number, it: any) => sum + (Number(it.score) || 0), 0);
      const paper: Paper = {
        id: `smart-paper-${Date.now()}`,
        title,
        exam: "AI测验",
        subject: intent.subject,
        region: "校本",
        year: intent.year,
        duration: Number(query.match(/(\d+)\s*分钟/)?.[1]) || 45,
        score,
        questions: items.length,
        progress: 0,
        difficulty: "中等",
        sections: normalizePaperSections([], items),
        tags: ["AI 组卷", lib.source, "待校对"],
        visibility: lib.visibility,
        owner: profileName,
        source: "AI 自动组卷",
        sharedWith: [],
        items,
      };
      store.addPaper(paper);
      notify("success", `已生成整卷「${title}」（${items.length} 题 ${intent.subject}），放入${lib.source}`);
    } else {
      const useRaw = !!options.rawText?.trim();
      onStatus(useRaw ? "DeepSeek 正在解析上传的试卷…" : "DeepSeek 正在检索并解析真题…", true);
      const ai = await aiPost(useRaw ? "/ai/import-paper" : "/ai/web-import-paper", {
        title: `${intent.year} ${intent.region}${intent.exam}${intent.subject}卷`,
        subject: intent.subject,
        exam_type: intent.exam,
        region: intent.region,
        year: intent.year,
        question_count: 24,
        total_score: 120,
        duration_minutes: 100,
        raw_text: options.rawText || "",
        query,
        source_url: sourceUrl,
      }, options.signal);
      const aiQuestions = ai.result.questions || [];
      const aiPaper = ai.result.paper || {};
      if (!aiQuestions.length && !aiPaper.title)
        throw new Error("DeepSeek 没有返回可导入的试卷结构");
      const title =
        aiPaper.title || `${intent.year} ${intent.region}${intent.exam}${intent.subject}卷`;
      const paperItems = (aiQuestions as any[]).map(aiQuestionToPaperItem);
      const importedPaper: Paper = {
        id: `web-paper-${Date.now()}`,
        title,
        exam: aiPaper.exam_type || intent.exam,
        subject: aiPaper.subject || intent.subject,
        region: aiPaper.region || intent.region,
        year: aiPaper.year || intent.year,
        duration: aiPaper.duration_minutes || 100,
        score:
          aiPaper.total_score ||
          paperItems.reduce((sum: number, item: any) => sum + (Number(item.score) || 0), 0) ||
          120,
        questions: Math.max(1, paperItems.length || 24),
        progress: 0,
        difficulty: "中等",
        sections: normalizePaperSections(aiPaper.sections, paperItems),
        tags: sourceUrl ? ["联网导入", "DeepSeek整卷", "待校对"] : ["DeepSeek整卷", "待校对"],
        visibility: "teacher",
        owner: profileName,
        source: sourceUrl ? "AI 从网络/PDF 导入" : "AI 从网络搜索导入",
        sharedWith: [],
        items: paperItems,
      };
      const importedQuestions = paperItems.map((item, index) =>
        createBankQuestionFromPaperItem(item, importedPaper, index, profileName)
      );
      // 一次性写入：试卷 + 题库题 + 设为当前试卷
      useStore.setState((s) => ({
        papers: preparePapers([importedPaper, ...s.papers]),
        questions: [...importedQuestions, ...s.questions],
        activePaperId: importedPaper.id,
      }));
      notify("success", `DeepSeek 已导入整卷“${title}”，共 ${importedPaper.questions} 题`);
    }
    if (options.mode) useStore.getState().closeModal();
    onStatus("处理完成，可以继续输入新的需求", false);
  } catch (error) {
    // 用户主动停止：静默处理，不弹错误。
    if ((error as any)?.name === "AbortError" || options.signal?.aborted) {
      onStatus("已停止", false);
    } else {
      notify("error", `AI 处理失败：${aiErrorMessage(error)}`);
      onStatus(`处理失败：${aiErrorMessage(error)}`, false);
    }
  } finally {
    useStore.getState().setAiBusy(false);
  }
}
