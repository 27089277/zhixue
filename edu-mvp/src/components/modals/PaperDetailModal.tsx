import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { currentProfile } from "../../store/permissions";
import { createBankQuestionFromPaperItem, normalizePaperSections } from "../../lib/papers";
import { useNotify } from "../../hooks/useNotify";
import { HtmlContent } from "../common/RichText";
import { ModalShell } from "./ModalHost";
import type { Paper, PaperItem } from "../../types";

// 整卷预览 / 整卷题卡，移植自 legacy paperDetail / paperOverview。
// 这是此前“导入试卷无法预览”bug 的核心；类型保证 items/sections 必为数组。
export default function PaperDetailModal() {
  const s = useStore();
  const modal = s.activeModal!;

  if (modal.type === "paperOverview") {
    const paper =
      s.papers.find((p) => p.id === s.activePaperId) || s.papers[0];
    return (
      <ModalShell
        eyebrow="整卷题卡"
        title={paper.title}
        footer={
          <>
            <button className="ghost" onClick={s.closeModal}>
              取消
            </button>
            <button className="primary" onClick={s.closeModal}>
              保存进度
            </button>
          </>
        }
      >
        <div className="metric-row">
          <div>
            <strong>{paper.questions}</strong>
            <span>题量</span>
          </div>
          <div>
            <strong>{paper.score}</strong>
            <span>总分</span>
          </div>
          <div>
            <strong>{paper.duration}</strong>
            <span>分钟</span>
          </div>
          <div>
            <strong>{paper.progress}%</strong>
            <span>进度</span>
          </div>
        </div>
        <table className="compact-table">
          <thead>
            <tr>
              <th>题号</th>
              <th>题型</th>
              <th>题目</th>
              <th>分值</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {paper.items.map((item) => (
              <tr key={item.no}>
                <td>{item.no}</td>
                <td>{item.type}</td>
                <td>{item.title}</td>
                <td>{item.score}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModalShell>
    );
  }

  return <PaperPreview paper={modal.payload as Paper} />;
}

const EDIT_TYPES = ["单选题", "多选题", "填空题", "判断题", "解答题"];

// 整卷预览/编辑：老师可勾选题目「存入题库」，也可「编辑」修正 AI 生成的题目。
function PaperPreview({ paper }: { paper: Paper }) {
  const s = useStore();
  const notify = useNotify();
  const me = currentProfile(s);
  const canPick = s.role === "teacher";
  const items = paper.items || [];
  const [picked, setPicked] = useState<Set<number>>(new Set());

  // 编辑态
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(paper.title);
  const [draftItems, setDraftItems] = useState<PaperItem[]>([]);

  function enterEdit() {
    setDraftTitle(paper.title);
    setDraftItems(items.map((it) => ({ ...it, choices: it.choices ? [...it.choices] : undefined })));
    setEditing(true);
  }
  function patchItem(idx: number, patch: Partial<PaperItem>) {
    setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function deleteItem(idx: number) {
    setDraftItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function addItem() {
    setDraftItems((prev) => [
      ...prev,
      { no: prev.length + 1, type: "单选题", title: "", choices: ["", "", "", ""], answer: "", score: 4, status: "未答" },
    ]);
  }
  function saveEdits() {
    const next: PaperItem[] = draftItems.map((it, i) => ({
      ...it,
      no: i + 1,
      title: (it.title || "").trim(),
      choices: it.choices?.map((c) => c.trim()).filter(Boolean),
      answer: (it.answer || "").trim(),
      score: Number(it.score) || 0,
    }));
    if (!next.length) return notify("info", "试卷至少保留 1 道题");
    if (next.some((it) => !it.title)) return notify("info", "有题目的题干为空，请填写或删除");
    const score = next.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
    const updated: Paper = {
      ...paper,
      title: draftTitle.trim() || paper.title,
      items: next,
      questions: next.length,
      score,
      sections: normalizePaperSections(paper.sections, next),
      tags: Array.from(new Set([...(paper.tags || []), "已校对"])),
    };
    s.addPaper(updated, { persist: paper.visibility !== "student" });
    setEditing(false);
    notify("success", "试卷修改已保存");
  }

  if (editing) {
    return (
      <ModalShell
        eyebrow="编辑试卷"
        title={draftTitle || "编辑试卷"}
        footer={
          <>
            <button className="ghost" onClick={() => setEditing(false)}>取消</button>
            <button className="primary" onClick={saveEdits}>保存修改</button>
          </>
        }
      >
        <div className="paper-edit-form" style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#5b6b64", fontWeight: 600 }}>试卷名称</span>
            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
          </label>
          {draftItems.map((it, idx) => (
            <div key={idx} style={{ border: "1px solid #e6ece9", borderRadius: 10, padding: 12, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>第 {idx + 1} 题</b>
                <button className="ghost small" onClick={() => deleteItem(idx)}>删除</button>
              </div>
              <select value={it.type} onChange={(e) => patchItem(idx, { type: e.target.value })}>
                {EDIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea rows={2} placeholder="题干" value={it.title} onChange={(e) => patchItem(idx, { title: e.target.value })} />
              {(it.type === "单选题" || it.type === "多选题" || it.type === "判断题") && (
                <textarea
                  rows={4}
                  placeholder={"选项，每行一个\nA\nB\nC\nD"}
                  value={(it.choices || []).join("\n")}
                  onChange={(e) => patchItem(idx, { choices: e.target.value.split("\n") })}
                />
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <label style={{ flex: 1, display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 12, color: "#5b6b64" }}>答案</span>
                  <input value={it.answer} onChange={(e) => patchItem(idx, { answer: e.target.value })} placeholder="如 A / 42 / 见解析" />
                </label>
                <label style={{ width: 90, display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 12, color: "#5b6b64" }}>分值</span>
                  <input type="number" value={it.score} onChange={(e) => patchItem(idx, { score: Number(e.target.value) || 0 })} />
                </label>
              </div>
              <textarea rows={2} placeholder="解析（可选）" value={it.analysis || ""} onChange={(e) => patchItem(idx, { analysis: e.target.value })} />
            </div>
          ))}
          <button className="ghost" onClick={addItem}>＋ 添加题目</button>
        </div>
      </ModalShell>
    );
  }

  const allPicked = useMemo(
    () => items.length > 0 && picked.size === items.length,
    [items.length, picked.size]
  );

  function toggle(no: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(no)) next.delete(no);
      else next.add(no);
      return next;
    });
  }
  function toggleAll() {
    setPicked(allPicked ? new Set() : new Set(items.map((it) => it.no)));
  }
  function saveToBank() {
    const chosen = items.filter((it) => picked.has(it.no));
    if (!chosen.length) {
      notify("info", "请先勾选要存入题库的题目");
      return;
    }
    const questions = chosen.map((item, index) => ({
      ...createBankQuestionFromPaperItem(item, paper, index, me.name),
      // 存入我的教师题库，创建者为当前老师
      owner: me.name,
      visibility: "teacher" as const,
      origin: "试卷选入",
      subject: paper.subject,
      answer: item.answer,
      analysis: item.analysis,
      choices: item.choices?.length ? item.choices : undefined,
      sharedWith: [],
    }));
    s.addQuestions(questions);
    notify("success", `已将 ${questions.length} 道题存入教师题库`);
    setPicked(new Set());
  }

  return (
    <ModalShell
      eyebrow="整卷预览"
      title={paper.title || "试卷详情"}
      footer={
        <>
          {canPick && items.length > 0 && (
            <>
              <button className="ghost" onClick={enterEdit}>
                编辑试卷
              </button>
              <button className="ghost" onClick={toggleAll}>
                {allPicked ? "取消全选" : "全选"}
              </button>
              <button className="primary" disabled={!picked.size} onClick={saveToBank}>
                存入题库{picked.size ? `（${picked.size}）` : ""}
              </button>
            </>
          )}
          <button className="ghost" onClick={s.closeModal}>
            关闭预览
          </button>
        </>
      }
    >
      <div className="exam-paper-preview">
        <header>
          <p>
            {paper.exam || "试卷"} ·{" "}
            {paper.visibility === "teacher" ? `${paper.owner} 私人库` : "公共库"}
          </p>
          <h1>{paper.title || "未命名试卷"}</h1>
          <div>
            <span>科目：{paper.subject || "-"}</span>
            <span>地区：{paper.region || "-"}</span>
            <span>年份：{paper.year || "-"}</span>
            <span>满分：{paper.score || 0}</span>
            <span>时间：{paper.duration || 0} 分钟</span>
          </div>
        </header>
        {canPick && items.length > 0 && (
          <section className="exam-paper-notice pick-hint">
            <strong>勾选题目存入题库</strong>
            <span>选中下方题目后点「存入题库」，可挑选整卷中的题加入你的教师题库。</span>
          </section>
        )}
        <section className="exam-paper-notice">
          <strong>试卷结构</strong>
          <span>{(paper.sections || []).join(" / ") || "待 AI 解析"}</span>
        </section>
        <div className="paper-question-preview-list exam-style">
          {items.length ? (
            items.map((item) => (
              <article
                className={`paper-question-preview ${picked.has(item.no) ? "picked" : ""}`}
                key={item.no}
              >
                <header>
                  {canPick && (
                    <label className="pq-pick">
                      <input
                        type="checkbox"
                        checked={picked.has(item.no)}
                        onChange={() => toggle(item.no)}
                      />
                    </label>
                  )}
                  <span>第 {item.no} 题</span>
                  <b>{item.type}</b>
                  <em>{item.score || 0} 分</em>
                </header>
                <HtmlContent html={item.title} className="paper-question-title-rich" />
                {item.images?.length ? (
                  <div className="paper-q-images">
                    {item.images.map((src, i) => (
                      <img key={i} src={src} alt={`配图${i + 1}`} />
                    ))}
                  </div>
                ) : null}
                {item.videoUrl ? (
                  <video
                    className="paper-q-video"
                    src={item.videoUrl}
                    controls
                    preload="metadata"
                  />
                ) : item.videoName ? (
                  <div className="paper-q-videoname">🎬 讲解视频：{item.videoName}</div>
                ) : null}
                {item.choices?.length ? (
                  <ol>
                    {item.choices.map((choice, index) => (
                      <li key={index}>
                        <b>{String.fromCharCode(65 + index)}</b>
                        <HtmlContent html={choice} />
                      </li>
                    ))}
                  </ol>
                ) : null}
                <div className="paper-answer-preview">
                  <span>答案：{item.answer || "待校对"}</span>
                  {item.analysis ? (
                    <HtmlContent html={item.analysis} />
                  ) : (
                    <p>暂无解析，老师可在校对后补充。</p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">这张试卷还没有题目，请重新通过 AI 导入整卷。</div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
