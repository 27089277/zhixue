import { useMemo } from "react";
import { useStore } from "../../store/useStore";
import { HtmlContent } from "../../components/common/RichText";

// 学生错题本（菁优网式）：从本人答卷推导做错的客观题，展示你的答案/正确答案/解析。
export default function MistakesView() {
  const s = useStore();
  const wrong = useMemo(() => {
    const me = s.currentUserPhone;
    const out: {
      key: string;
      paperTitle: string;
      stem: string;
      mine: string;
      answer: string;
      analysis?: string;
      point?: string;
    }[] = [];
    s.submissions
      .filter((x) => x.studentPhone === me)
      .forEach((sub) => {
        const paper = s.papers.find((p) => p.id === sub.paperId);
        if (!paper) return;
        paper.items.forEach((it) => {
          if (it.type === "解答题") return;
          const e = (sub.answers || {})[it.no] as any;
          const val = typeof e === "string" ? e : e?.value;
          if (val && String(val).trim() !== String(it.answer).trim()) {
            out.push({
              key: `${sub.id}-${it.no}`,
              paperTitle: paper.title,
              stem: it.title,
              mine: String(val),
              answer: it.answer,
              analysis: it.analysis,
              point: (it.knowledge || [])[0],
            });
          }
        });
      });
    // ② / ③ 自主练习 + AI 自练错题
    s.practiceWrong.forEach((w) =>
      out.push({
        key: w.key,
        paperTitle: w.origin === "student-ai" ? "AI 自练" : "自主练习",
        stem: w.stem,
        mine: w.mine,
        answer: w.answer,
        analysis: w.analysis,
        point: w.point,
      })
    );
    return out;
  }, [s.submissions, s.papers, s.currentUserPhone, s.practiceWrong]);

  return (
    <div className="mistakes-view">
      <div className="student-view-head">
        <h2>错题本</h2>
        <span className="muted">共 {wrong.length} 题 · 作业/真题/自主练习/AI 自练自动收录</span>
      </div>
      {wrong.length ? (
        <div className="mistake-list">
          {wrong.map((w) => (
            <article className="mistake-card" key={w.key}>
              <div className="mistake-meta">
                <span className="muted">{w.paperTitle}</span>
                {w.point ? <span className="kp-tag">{w.point}</span> : null}
              </div>
              <HtmlContent html={w.stem} className="mistake-stem" />
              <div className="mistake-ans">
                你的答案：<b className="wrong">{w.mine}</b>　正确答案：<b className="right">{w.answer}</b>
              </div>
              {w.analysis ? (
                <div className="mistake-analysis">
                  <strong>解析</strong>
                  <HtmlContent html={w.analysis} />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">暂无错题，交卷后做错的题会自动收录到这里</div>
      )}
    </div>
  );
}
