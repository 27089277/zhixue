import { useMemo, useState } from "react";
import { Modal, Table, Input, Select, Space, Tag, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ArrowUpOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useStore } from "../../store/useStore";
import { currentProfile, visibleQuestions } from "../../store/permissions";
import { normalizePaperSections } from "../../lib/papers";
import { aiPost } from "../../api/client";
import { SUBJECTS, STAGES, QUESTION_TYPES, gradesForStage } from "../../lib/academics";
import { useNotify } from "../../hooks/useNotify";
import type { Paper, PaperItem, Question } from "../../types";

interface Row extends Question {
  key: number;
}

function defScore(type: string): number {
  if (String(type).includes("解答")) return 10;
  if (String(type).includes("填空")) return 6;
  if (String(type).includes("判断")) return 3;
  return 4;
}

// 手动组卷：从题库勾选题目 + 填试卷信息 → 生成整卷并入库。
export default function PaperComposeModal() {
  const s = useStore();
  const notify = useNotify();
  const payload = (s.activeModal!.payload || {}) as Partial<Paper>;
  const isEdit = !!payload.id;

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState(payload.title || "");
  const [subject, setSubject] = useState(payload.subject || "数学");
  const [stage, setStage] = useState(payload.stage || "初中");
  const [grade, setGrade] = useState(payload.grade || "初三");
  const [region, setRegion] = useState(payload.region || "校本");
  const [duration, setDuration] = useState(payload.duration || 45);
  const [exam, setExam] = useState(payload.exam || "校本卷");
  const [visibility, setVisibility] = useState<string>(payload.visibility || "teacher");
  const [keyword, setKeyword] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiMatched, setAiMatched] = useState<Set<number> | null>(null);

  const all: Row[] = useMemo(
    () => visibleQuestions(s).map((q) => ({ ...q, key: s.questions.indexOf(q) })),
    [s]
  );

  // GenAI 智能选题：优先让 DeepSeek 从题库候选中语义选题；失败再退回本地匹配。
  async function runAiSelect(q: string) {
    const query = q.trim();
    if (!query) {
      setAiMatched(null);
      return;
    }
    // 1) 优先走向量库语义检索（题目 id 为 MySQL 主键）
    try {
      const vec = await aiPost("/ai/search-questions", { query, k: 30 });
      const dbIds: number[] = (vec?.result?.ids || []).map((x: any) => Number(x));
      const matchedKeys = all
        .filter((r) => r.id != null && dbIds.includes(r.id as number))
        .map((r) => r.key);
      if (matchedKeys.length) {
        setAiMatched(new Set(matchedKeys));
        notify("success", `向量库检索到 ${matchedKeys.length} 道相关题，请勾选`);
        return;
      }
    } catch {
      /* 继续尝试其它方式 */
    }
    // 2) 退回 DeepSeek 语义选题
    try {
      const ai = await aiPost("/ai/select-from-bank", {
        query,
        candidates: all.map((r) => ({
          id: r.key,
          text: `${r.subject || ""} ${r.stage || ""} ${r.type} ${r.point}：${r.title}`,
        })),
      });
      const ids: number[] = (ai?.result?.ids || [])
        .map((x: any) => Number(x))
        .filter((n: number) => all.some((r) => r.key === n));
      if (!ai?.fallback && ids.length) {
        setAiMatched(new Set(ids));
        notify("success", `DeepSeek 已从题库选出 ${ids.length} 道题，请勾选`);
        return;
      }
    } catch {
      /* 走本地兜底 */
    }
    // 3) 本地关键词兜底
    localSelect(query);
  }

  // 本地兜底：按学科/学段/题型/知识点关键词匹配。
  function localSelect(query: string) {
    const subj = SUBJECTS.find((x) => query.includes(x));
    const st =
      STAGES.find((x) => query.includes(x)) ||
      (/初[一二三]|中考/.test(query) ? "初中" : /高[一二三]|高考/.test(query) ? "高中" : undefined);
    const typ =
      QUESTION_TYPES.find((x) => query.includes(x)) ||
      (/选择/.test(query) ? "单选题" : undefined);
    // 剥离学科/学段/题型与常见填充词，剩下的作为知识点关键词（如“串并联”）
    let kw = query;
    [subj, st, typ].forEach((t) => {
      if (t) kw = kw.split(t).join("");
    });
    kw = kw
      .replace(
        /(我想|想要|想|请给我|请|帮我|给我|来点|来一?套|出一?套|出|生成|一套|一些|几道|\d+道|道|的|题目|试题|题|中考|高考|期末)/g,
        ""
      )
      .trim();
    const matched = all.filter(
      (r) =>
        (!subj || r.subject === subj) &&
        (!st || r.stage === st) &&
        (!typ || r.type === typ) &&
        (!kw || `${r.title}${r.point}`.includes(kw))
    );
    setAiMatched(new Set(matched.map((m) => m.key)));
    // 只列出，不自动勾选
    if (subj) setSubject(subj);
    if (st) {
      setStage(st);
      setGrade(gradesForStage(st)[0] || "");
    }
    notify(
      matched.length ? "success" : "info",
      matched.length
        ? `已按需求列出 ${matched.length} 道题，请在下方勾选`
        : "题库暂无匹配的题，可换个说法或先到「题目」里创建/生成"
    );
  }
  // 编辑：预选题干与现有 items 匹配的题
  const [selected, setSelected] = useState<number[]>(() => {
    if (!payload.items?.length) return [];
    const titles = new Set(payload.items.map((i) => i.title));
    return all.filter((q) => titles.has(q.title)).map((q) => q.key);
  });

  const rows = aiMatched
    ? all.filter((q) => aiMatched.has(q.key))
    : all.filter((q) => {
        if (!keyword.trim()) return true;
        const k = keyword.trim().toLowerCase();
        return `${q.title} ${q.point} ${q.source} ${q.subject || ""}`.toLowerCase().includes(k);
      });

  const columns: ColumnsType<Row> = [
    { title: "题目", dataIndex: "title", key: "title", render: (t, r) => (
      <div className="question-title-cell"><strong>{t}</strong><span>{r.point} · {r.source}</span></div>
    ) },
    { title: "题型", dataIndex: "type", key: "type", width: 90, render: (t) => <Tag>{t}</Tag>,
      filters: [
        { text: "单选题", value: "单选题" }, { text: "多选题", value: "多选题" },
        { text: "判断题", value: "判断题" }, { text: "填空题", value: "填空题" }, { text: "解答题", value: "解答题" },
      ], onFilter: (v, r) => r.type === v },
    { title: "学科", dataIndex: "subject", key: "subject", width: 80, render: (v) => v || "-" },
    { title: "知识点", dataIndex: "point", key: "point", width: 130 },
  ];

  const selectedScore = all
    .filter((q) => selected.includes(q.key))
    .reduce((sum, q) => sum + defScore(q.type), 0);

  function save() {
    if (!title.trim()) return notify("error", "请输入试卷名称");
    if (selected.length === 0) return notify("error", "请至少选择一道题");
    const picked = all.filter((q) => selected.includes(q.key));
    const items: PaperItem[] = picked.map((q, i) => ({
      no: i + 1,
      type: q.type,
      title: q.title,
      choices: q.choices,
      answer: q.answer || "",
      analysis: q.analysis,
      images: q.images,
      videoUrl: q.videoUrl,
      videoName: q.videoName,
      score: defScore(q.type),
      status: "未答",
    }));
    const paper: Paper = {
      id: payload.id || `paper-${Date.now()}`,
      title: title.trim(),
      exam: exam || "校本卷",
      subject,
      stage,
      grade,
      region: region || "校本",
      year: payload.year || new Date().getFullYear(),
      duration: Number(duration) || 45,
      score: items.reduce((sum, it) => sum + it.score, 0),
      questions: items.length,
      progress: 0,
      difficulty: payload.difficulty || "中等",
      sections: normalizePaperSections([], items),
      tags: ["题库组卷", "可发布"],
      visibility: visibility as Paper["visibility"],
      owner: currentProfile(s).name,
      source: "老师从题库组卷",
      sharedWith: [],
      items,
    };
    s.addPaper(paper); // 落库 MySQL
    notify("success", `试卷“${paper.title}”已保存，共 ${items.length} 题 / ${paper.score} 分`);
    s.closeModal();
  }

  function goNext() {
    if (!title.trim()) return notify("error", "请输入试卷名称");
    setStep(2);
  }

  const stepTitle = isEdit ? "编辑试卷" : "创建试卷";

  // 防误关：点遮罩/Esc 不关；点 X 或取消需二次确认，避免辛苦填的内容丢失。
  function confirmClose() {
    Modal.confirm({
      title: "确定关闭？",
      icon: <ExclamationCircleOutlined />,
      content: "当前试卷信息与已选题目尚未保存，关闭后将丢失。",
      okText: "关闭不保存",
      cancelText: "继续编辑",
      okButtonProps: { danger: true },
      onOk: () => s.closeModal(),
    });
  }

  return (
    <Modal
      open
      maskClosable={false}
      keyboard={false}
      title={`${stepTitle} · ${step === 1 ? "第 1 步：试卷信息" : "第 2 步：从题库选题"}`}
      width={step === 1 ? 620 : 920}
      onCancel={confirmClose}
      footer={
        step === 1
          ? [
              <Button key="cancel" onClick={s.closeModal}>取消</Button>,
              <Button key="next" type="primary" onClick={goNext}>下一步：选题</Button>,
            ]
          : [
              <Button key="back" onClick={() => setStep(1)}>上一步</Button>,
              <Button key="save" type="primary" onClick={save}>保存试卷</Button>,
            ]
      }
    >
      {step === 1 ? (
        <div className="paper-info-form">
          <label className="pif-field pif-full">
            <span>试卷名称</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：初三物理串并联专项测验" />
          </label>
          <label className="pif-field">
            <span>学科</span>
            <Select value={subject} onChange={setSubject} options={SUBJECTS.map((x) => ({ value: x, label: x }))} />
          </label>
          <label className="pif-field">
            <span>考试类型</span>
            <Input value={exam} onChange={(e) => setExam(e.target.value)} placeholder="校本卷 / 单元测 / 周测…" />
          </label>
          <label className="pif-field">
            <span>学段</span>
            <Select
              value={stage}
              onChange={(v) => { setStage(v); setGrade(gradesForStage(v)[0] || ""); }}
              options={STAGES.map((x) => ({ value: x, label: x }))}
            />
          </label>
          <label className="pif-field">
            <span>年级</span>
            <Select value={grade} onChange={setGrade} options={gradesForStage(stage).map((x) => ({ value: x, label: x }))} />
          </label>
          <label className="pif-field">
            <span>地区</span>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="校本 / 大连…" />
          </label>
          <label className="pif-field">
            <span>时长（分钟）</span>
            <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </label>
          <label className="pif-field pif-full">
            <span>试卷归属（可见范围）</span>
            <Select
              value={visibility}
              onChange={setVisibility}
              options={[
                { value: "teacher", label: "教师题库（所有老师可见）" },
                { value: "private", label: "教师私人库（仅自己，可共享）" },
                { value: "public", label: "公共库（含学生）" },
              ]}
            />
          </label>
        </div>
      ) : (
        <>
          <section className="bank-ai-console compose-ai-console">
            <div className="bank-ai-composer">
              <textarea
                rows={2}
                placeholder="用一句话从题库里挑题，如：我想出一套物理串并联的题 / 来点二次函数的单选题"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    runAiSelect(aiQuery);
                  }
                }}
              />
              <div className="bank-ai-composer-foot">
                <div className="composer-left" />
                <button
                  className="composer-send"
                  type="button"
                  aria-label="AI 检索"
                  title="从题库检索（回车）"
                  disabled={!aiQuery.trim()}
                  onClick={() => runAiSelect(aiQuery)}
                >
                  <ArrowUpOutlined />
                </button>
              </div>
            </div>
          </section>
          <Space style={{ margin: "4px 0 8px", justifyContent: "space-between", width: "100%" }}>
            <Input.Search
              allowClear
              placeholder="按关键词筛选（题干/知识点/来源）"
              onSearch={(v) => {
                setAiMatched(null);
                setKeyword(v);
              }}
              style={{ width: 320 }}
            />
            <span className="pill">已选 {selected.length} 题 · {selectedScore} 分</span>
          </Space>
          <Table<Row>
            rowKey="key"
            size="small"
            columns={columns}
            dataSource={rows}
            rowSelection={{
              selectedRowKeys: selected,
              onChange: (keys) => setSelected(keys as number[]),
            }}
            pagination={{ pageSize: 6, showTotal: (t) => `题库共 ${t} 题` }}
          />
        </>
      )}
    </Modal>
  );
}
