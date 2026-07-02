import { useState } from "react";
import { Modal, Select, Input, InputNumber, Button } from "antd";
import { executeSmartAiRequest } from "../../api/ai";
import { useStore } from "../../store/useStore";
import { useNotify } from "../../hooks/useNotify";

const SUBJECTS = ["数学", "物理", "语文", "英语", "化学", "生物", "历史", "地理", "政治"];
const TYPES = ["单选题", "填空题", "解答题"];
const DIFFS = ["容易", "中等", "较难"];

// 组卷中心（菁优网式结构化组卷）：学科 + 知识点 + 题型 + 难度 + 数量 → 复用 AI 组卷生成整卷。
export default function ComposeCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const notify = useNotify();
  const busy = useStore((s) => s.aiBusy);
  const [subject, setSubject] = useState("数学");
  const [point, setPoint] = useState("");
  const [type, setType] = useState("单选题");
  const [diff, setDiff] = useState("中等");
  const [count, setCount] = useState(6);

  async function run() {
    if (!point.trim()) return notify("info", "请输入知识点");
    const diffWord = diff === "容易" ? "基础" : diff === "较难" ? "较难" : "中档";
    const query = `生成一套${subject}关于${point.trim()}的测验，共${count}道${type}，${diffWord}`;
    await executeSmartAiRequest(query, { mode: "assemble", notify });
    onClose();
  }

  return (
    <Modal
      title="组卷中心 · 按知识点结构化组卷"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={460}
    >
      <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
        <Field label="学科">
          <Select value={subject} onChange={setSubject} options={SUBJECTS.map((v) => ({ value: v, label: v }))} style={{ width: "100%" }} />
        </Field>
        <Field label="知识点">
          <Input value={point} onChange={(e) => setPoint(e.target.value)} placeholder="如：电阻 / 二次函数 / 文言文阅读" />
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
        <Button type="primary" size="large" loading={busy} onClick={run} style={{ marginTop: 4 }}>
          一键组卷
        </Button>
        <div style={{ color: "#8a978f", fontSize: 12, textAlign: "center" }}>
          由 DeepSeek 生成真题组卷，放入教师库，可预览后勾选题目入题库
        </div>
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
