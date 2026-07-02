import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { currentProfile } from "../../store/permissions";
import { createBankQuestionFromPaperItem } from "../../lib/papers";
import { useNotify } from "../../hooks/useNotify";
import { HtmlContent } from "../common/RichText";
import { ModalShell } from "./ModalHost";
import type { Paper } from "../../types";

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

// 整卷预览：老师可勾选题目「存入题库」（不再自动把题塞进题库）。
function PaperPreview({ paper }: { paper: Paper }) {
  const s = useStore();
  const notify = useNotify();
  const me = currentProfile(s);
  const canPick = s.role === "teacher";
  const items = paper.items || [];
  const [picked, setPicked] = useState<Set<number>>(new Set());

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
