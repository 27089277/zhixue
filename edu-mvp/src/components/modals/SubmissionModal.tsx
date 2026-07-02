import { useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import { ModalShell } from "./ModalHost";
import { useNotify } from "../../hooks/useNotify";
import { HtmlContent } from "../common/RichText";
import HandwritingCanvas, { type HandwritingHandle } from "../common/HandwritingCanvas";
import { uploadMedia } from "../../api/client";

const isImg = (v?: string) =>
  !!v && (v.startsWith("/api/media/") || v.startsWith("data:image"));

// 主观题批改弹窗：可在学生手写作答上批注，提交/退回落库。
export default function SubmissionModal() {
  const s = useStore();
  const notify = useNotify();
  const payload = s.activeModal!.payload;
  const readOnly = !!payload.readOnly; // 查看模式：只读，不可再批注/改分
  const record = s.submissions.find((x) => x.id === payload.submissionId);
  const paper = s.papers.find((p) => p.id === record?.paperId);
  const answers = (record?.answers || {}) as Record<number, { value?: string } | string>;
  const subjective = paper?.items.filter((it) => it.type === "解答题") ?? [];
  const maxManual = (paper?.score ?? 0) - (record?.objectiveTotal ?? 0);

  const answerValue = (no: number): string | undefined => {
    const e = answers[no];
    return typeof e === "string" ? e : e?.value;
  };

  const [manualScore, setManualScore] = useState(record?.manualScore ?? 0);
  const [feedback, setFeedback] = useState(
    record?.feedback || "请补充关键推理步骤，注意书写完整。"
  );
  const [busy, setBusy] = useState(false);
  const annoRefs = useRef<Record<number, HandwritingHandle | null>>({});

  if (!record || !paper) {
    return (
      <ModalShell eyebrow="批改" title="答卷详情" footer={<button className="primary" onClick={s.closeModal}>关闭</button>}>
        <div className="empty-state">找不到该答卷，可能已被删除。</div>
      </ModalShell>
    );
  }

  // 收集老师批注：导出有改动的批注画布 → 上传对象存储 → { 题号: 图片URL }
  async function collectAnnotations(): Promise<Record<number, string>> {
    const out: Record<number, string> = { ...(record?.annotations || {}) };
    for (const item of subjective) {
      const h = annoRefs.current[item.no];
      if (h && !h.isBlank()) {
        try {
          const blob = await (await fetch(h.getPng())).blob();
          const { url } = await uploadMedia(
            new File([blob], `anno-${record!.paperId}-${item.no}.png`, { type: "image/png" })
          );
          out[item.no] = url;
        } catch {
          /* 忽略单题批注上传失败 */
        }
      }
    }
    return out;
  }

  async function submit(returned: boolean) {
    setBusy(true);
    try {
      const annotations = await collectAnnotations();
      s.gradeSubmission(payload.submissionId, Number(manualScore) || 0, feedback, returned, annotations);
      s.closeModal();
      s.switchSection("grading");
      notify(
        returned ? "info" : "success",
        returned
          ? "答卷已退回学生修改"
          : `批改已提交，最终成绩 ${(record?.score ?? 0) + (Number(manualScore) || 0)} 分`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell
      eyebrow={readOnly ? "已批改详情" : "主观题批改"}
      title={`${paper.title} · ${record?.studentName || "学生"}`}
      footer={
        readOnly ? (
          <button className="primary" onClick={s.closeModal}>关闭</button>
        ) : (
          <>
            <button className="ghost" onClick={s.closeModal}>取消</button>
            <button className="ghost" disabled={busy} onClick={() => submit(true)}>退回修改</button>
            <button className="primary" disabled={busy} onClick={() => submit(false)}>
              {busy ? "提交中…" : "提交并返回学生"}
            </button>
          </>
        )
      }
    >
      <div className="submission-list">
        {subjective.map((item) => {
          const val = answerValue(item.no);
          return (
            <article key={item.no}>
              <strong>第 {item.no} 题 · {item.score} 分</strong>
              <HtmlContent html={item.title} />
              {readOnly ? (
                // 查看：直接展示已保存的批注图（含红笔），无则显示学生原作答
                isImg(record?.annotations?.[item.no]) || isImg(val) ? (
                  <div className="anno-block">
                    <p className="muted">批改结果（含老师批注）：</p>
                    <img
                      className="anno-view"
                      src={record?.annotations?.[item.no] || val}
                      alt={`第${item.no}题批改`}
                    />
                  </div>
                ) : (
                  <div className="student-answer">{val || "学生未作答"}</div>
                )
              ) : isImg(val) ? (
                <div className="anno-block">
                  <p className="muted">在学生手写作答上批注（红笔），提交时保存：</p>
                  <HandwritingCanvas
                    ref={(h) => (annoRefs.current[item.no] = h)}
                    variant="grading"
                    initialUrl={val}
                    width={620}
                    height={340}
                  />
                </div>
              ) : (
                <div className="student-answer">{val || "学生未作答"}</div>
              )}
            </article>
          );
        })}
      </div>
      <div className="form-grid">
        <label className="field full">
          <span>主观题得分（满分 {maxManual} 分）</span>
          <input
            type="number"
            min={0}
            max={maxManual}
            value={manualScore}
            disabled={readOnly}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return setManualScore(0);
              // 钳制到 0~满分，Number 归一化去掉前导零（"010" → 10）
              const n = Math.min(maxManual, Math.max(0, Number(raw) || 0));
              setManualScore(n);
            }}
          />
          <small className="field-hint">
            本卷客观题已得 {record?.score ?? 0} 分，主观题最高可给 {maxManual} 分
          </small>
        </label>
        <label className="field full">
          <span>老师评语</span>
          <textarea
            value={feedback}
            disabled={readOnly}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </label>
      </div>
    </ModalShell>
  );
}
