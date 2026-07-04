import { useCallback, useRef } from "react";
import { useStore } from "../../store/useStore";
import { useExamClock } from "../../hooks/useExamClock";
import HandwritingCanvas, { type HandwritingHandle } from "../../components/common/HandwritingCanvas";
import { HtmlContent } from "../../components/common/RichText";
import { uploadMedia } from "../../api/client";

const isImageAnswer = (v?: string) =>
  !!v && (v.startsWith("/api/media/") || v.startsWith("data:image"));

// 学生答题视图，移植自 legacy paperExamView + renderPaperQuestion/Nav + 倒计时。
export default function ExamView() {
  const s = useStore();
  const paper = s.papers.find((p) => p.id === s.activePaperId) || s.papers[0];
  const current =
    paper.items.find((it) => it.no === s.exam.currentNo) || paper.items[0];
  const answers = s.exam.answers[paper.id] || {};
  const savedValue = answers[current.no]?.value || "";
  const handwritingRef = useRef<HandwritingHandle>(null);

  // 解答题：把学生手写导出为图片、上传对象存储，作为答案保存（老师批改时可见）
  async function captureHandwriting() {
    if (current.type !== "解答题") return;
    const h = handwritingRef.current;
    if (!h || h.isBlank()) return;
    try {
      const blob = await (await fetch(h.getPng())).blob();
      const { url } = await uploadMedia(new File([blob], `answer-${paper.id}-${current.no}.png`, { type: "image/png" }));
      s.saveAnswer(paper.id, current.no, url);
    } catch {
      /* 上传失败则保留原有答案 */
    }
  }

  const doSubmit = useCallback(
    async (auto = false) => {
      await captureHandwriting();
      const a = useStore.getState().exam.answers[paper.id] || {};
      const unanswered = paper.items.filter((it) => !a[it.no]?.value).length;
      if (!auto && unanswered > 0) {
        s.openModal("submitConfirm", { paperId: paper.id, unanswered });
        return;
      }
      s.submitPaper(paper.id);
      s.openModal("paperResult", { paperId: paper.id });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paper, s, current]
  );

  const clock = useExamClock(s.exam.endsAt, () => doSubmit(true));

  function setAnswer(value: string) {
    s.saveAnswer(paper.id, current.no, value);
  }

  async function go(delta: number) {
    await captureHandwriting();
    const idx = paper.items.findIndex((it) => it.no === current.no);
    const next = paper.items[idx + delta];
    if (next) s.selectQuestion(next.no);
  }

  const answeredCount = Object.values(answers).filter((x) => x.value).length;
  // 讲解视频只在交卷后可看（防止考试中看答案）
  const submitted = !!s.exam.submitted[paper.id];

  return (
    <>
      <div className="tablet-top">
        <button className="back" aria-label="返回试卷库" onClick={() => s.exitPaper()}>
          ‹
        </button>
        <div>
          <strong>{paper.title}</strong>
          <span>
            第 {current.no} / {paper.questions} 题 · 已自动保存
          </span>
        </div>
        <div className="exam-clock compact">
          <span>剩余</span>
          <strong>{s.exam.endsAt ? clock : "不限时"}</strong>
        </div>
      </div>
      <div className="student-progress">
        <i style={{ width: `${paper.progress}%` }} />
      </div>

      <div className="student-body exam-active" style={{ padding: 0 }}>
        <section className="paper-exam-view">
          <div className="paper-toolbar">
            <div>
              <p className="badge">
                第 {current.no} 题 · {current.type} · {current.score} 分
              </p>
              <HtmlContent html={current.title} className="exam-question-title-rich" />
            </div>
          </div>

          <div>
            {current.type === "单选题" || current.type === "判断题" ? (
              <div className="exam-options">
                {(current.choices || []).map((choice, index) => {
                  const value = String.fromCharCode(65 + index);
                  return (
                    <label key={value}>
                      <input
                        type="radio"
                        name="paperAnswer"
                        value={value}
                        checked={savedValue === value}
                        onChange={() => setAnswer(value)}
                      />
                      <b>{value}</b>
                      <HtmlContent html={choice} />
                    </label>
                  );
                })}
              </div>
            ) : current.type === "多选题" ? (
              <div className="exam-options">
                <div className="exam-answer-hint">多选题 · 可选多个选项</div>
                {(current.choices || []).map((choice, index) => {
                  const value = String.fromCharCode(65 + index);
                  const checked = savedValue.includes(value);
                  const toggle = () => {
                    const set = new Set(savedValue.split("").filter(Boolean));
                    set.has(value) ? set.delete(value) : set.add(value);
                    setAnswer(Array.from(set).sort().join(""));
                  };
                  return (
                    <label key={value}>
                      <input type="checkbox" checked={checked} onChange={toggle} />
                      <b>{value}</b>
                      <HtmlContent html={choice} />
                    </label>
                  );
                })}
              </div>
            ) : current.type === "填空题" ? (
              <label className="exam-answer">
                <span>答案</span>
                <input
                  value={savedValue}
                  placeholder="请输入答案"
                  autoComplete="off"
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </label>
            ) : (
              <div className="exam-answer-hint">
                请使用下方触控笔手写作答，切题或交卷时自动保存手写内容。
              </div>
            )}
          </div>

          {current.type === "解答题" && (
            <div className="handwriting-area">
              <h3>手写作答（支持触屏笔，切题/交卷自动保存）</h3>
              <HandwritingCanvas
                key={`hw-${paper.id}-${current.no}`}
                ref={handwritingRef}
                variant="student"
                answerMode
                initialUrl={isImageAnswer(savedValue) ? savedValue : undefined}
              />
            </div>
          )}

          {submitted && s.exam.submitted[paper.id]?.annotations?.[current.no] && (
            <div className="exam-anno">
              <h3>老师批注</h3>
              <img src={s.exam.submitted[paper.id]!.annotations![current.no]} alt="老师批注" />
            </div>
          )}

          {(current.videoUrl || current.videoName) &&
            (submitted ? (
              <div className="exam-video">
                <h3>讲解视频</h3>
                {current.videoUrl ? (
                  <video src={current.videoUrl} controls preload="metadata" />
                ) : (
                  <p className="muted">讲解视频：{current.videoName}</p>
                )}
              </div>
            ) : (
              <div className="exam-video locked">
                <span>🔒 本题含讲解视频，交卷后可观看</span>
              </div>
            ))}

          <div className="exam-actions">
            <button className="ghost" onClick={() => go(-1)}>
              上一题
            </button>
            <span>答案自动保存（{answeredCount}/{paper.questions}）</span>
            <button className="ghost" onClick={() => go(1)}>
              保存并下一题
            </button>
            <button className="primary" onClick={() => doSubmit(false)}>
              交卷
            </button>
          </div>
        </section>

        <aside className="student-side">
          <h3 className="exam-card-title">整卷题卡</h3>
          <div className="question-legend">
            <span>
              <i className="current"></i>当前
            </span>
            <span>
              <i className="done"></i>已答
            </span>
            <span>
              <i></i>未答
            </span>
          </div>
          <div className="paper-nav">
            {paper.items.map((item) => {
              const cls =
                item.no === current.no
                  ? "current"
                  : answers[item.no]?.value
                  ? "done"
                  : "todo";
              return (
                <button
                  key={item.no}
                  className={cls}
                  onClick={() => s.selectQuestion(item.no)}
                >
                  {item.no}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
