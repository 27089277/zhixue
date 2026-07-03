import { useMemo, useState } from "react";
import { Modal, Select, Input, InputNumber, Button, Segmented } from "antd";
import { executeSmartAiRequest } from "../../api/ai";
import { useStore } from "../../store/useStore";
import { currentProfile, visibleQuestions } from "../../store/permissions";
import { normalizePaperSections } from "../../lib/papers";
import { difficultyLabel } from "../../lib/difficulty";
import { useNotify } from "../../hooks/useNotify";
import type { Paper, PaperItem } from "../../types";

const SUBJECTS = ["数学", "物理", "语文", "英语", "化学", "生物", "历史", "地理", "政治"];
const TYPES = ["单选题", "填空题", "解答题"];
const DIFFS = ["容易", "中等", "较难"];

// 组卷中心（菁优网式）：AI 生成 / 从题库按 知识点+题型+难度 抽题组卷。
export default function ComposeCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const notify = useNotify();
  const busy = useStore((st) => st.aiBusy);
  const [mode, setMode] = useState<"ai" | "bank">("ai");

  const [subject, setSubject] = useState("数学");
  const [point, setPoint] = useState("");
  const [type, setType] = useState("单选题");
  const [diff, setDiff] = useState("中等");
  const [count, setCount] = useState(6);

  // 从题库抽题：命中的题
  const bankMatched = useMemo(() => {
    if (mode !== "bank") return [];
    return visibleQuestions(s).filter(
      (q) =>
        q.subject === subject &&
        (!point.trim() || (q.point || "").includes(point.trim())) &&
        q.type === type &&
        difficultyLabel(q.difficulty) === diff
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, s.questions, subject, point, type, diff]);

  async function runAI() {
    if (!point.trim()) return notify("info", "请输入知识点");
    const diffWord = diff === "容易" ? "基础" : diff === "较难" ? "较难" : "中档";
    const query = `生成一套${subject}关于${point.trim()}的测验，共${count}道${type}，${diffWord}`;
    await executeSmartAiRequest(query, { mode: "assemble", notify });
    onClose();
  }

  function runBank() {
    const picked = bankMatched.slice(0, count);
    if (!picked.length) return notify("error", "题库中没有符合条件的题，换条件或用「AI 生成」");
    const items: PaperItem[] = picked.map((q, i) => ({
      no: i + 1,
      type: q.type,
      title: q.title,
      choices: q.choices,
      answer: q.answer || "",
      analysis: q.analysis,
      score: q.type === "解答题" ? 10 : 4,
      knowledge: [q.point].filter(Boolean),
      status: "未答",
    }));
    const score = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
    const title = `${subject}·${point.trim() || "综合"}组卷（${items.length}题）`;
    const paper: Paper = {
      id: `bank-paper-${Date.now()}`,
      title,
      exam: "题库组卷",
      subject,
      region: "校本",
      year: new Date().getFullYear(),
      duration: 45,
      score,
      questions: items.length,
      progress: 0,
      difficulty: diff,
      sections: normalizePaperSections([], items),
      tags: ["题库抽题", "待校对"],
      visibility: "teacher",
      owner: currentProfile(s).name,
      source: "题库抽题组卷",
      sharedWith: [],
      items,
    };
    s.addPaper(paper);
    notify("success", `已从题库抽 ${items.length} 题组成《${title}》`);
    onClose();
  }

  return (
    <Modal title="组卷中心" open={open} onCancel={onClose} footer={null} destroyOnClose width={480}>
      <Segmented
        block
        value={mode}
        onChange={(v) => setMode(v as "ai" | "bank")}
        options={[
          { label: "AI 生成新题", value: "ai" },
          { label: "从题库抽题", value: "bank" },
        ]}
        style={{ margin: "8px 0 16px" }}
      />
      <div style={{ display: "grid", gap: 12 }}>
        <Field label="学科">
          <Select value={subject} onChange={setSubject} options={SUBJECTS.map((v) => ({ value: v, label: v }))} style={{ width: "100%" }} />
        </Field>
        <Field label={mode === "bank" ? "知识点（可留空=全部）" : "知识点"}>
          <Input value={point} onChange={(e) => setPoint(e.target.value)} placeholder="如：电阻 / 二次函数" />
        </Field>
        <Field label="题型">
          <Select value={type} onChange={setType} options={TYPES.map((v) => ({ value: v, label: v }))} style={{ width: "100%" }} />
        </Field>
        <Field label="难度">
          <Select value={diff} onChange={setDiff} options={DIFFS.map((v) => ({ value: v, label: v }))} style={{ width: "100%" }} />
        </Field>
        <Field label="题量">
          <InputNumber min={1} max={30} value={count} onChange={(v) => setCount(Number(v) || 6)} style={{ width: "100%" }} />
        </Field>

        {mode === "bank" ? (
          <>
            <div style={{ color: "#5b6b64", fontSize: 13 }}>
              题库命中 <b style={{ color: "#0c8a5b" }}>{bankMatched.length}</b> 题，将抽取前 {Math.min(count, bankMatched.length)} 题组卷
            </div>
            <Button type="primary" size="large" disabled={!bankMatched.length} onClick={runBank}>
              从题库组卷
            </Button>
          </>
        ) : (
          <>
            <Button type="primary" size="large" loading={busy} onClick={runAI}>
              AI 一键组卷
            </Button>
            <div style={{ color: "#8a978f", fontSize: 12, textAlign: "center" }}>
              DeepSeek 生成真题，放入教师库，可预览后勾选入题库
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#5b6b64", fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}
