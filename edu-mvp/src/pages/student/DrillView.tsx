import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { visibleQuestions } from "../../store/permissions";
import { HtmlContent } from "../../components/common/RichText";

// 专题练习（菁优网式）：按知识点选题刷题，点选选项即时判对错 + 看解析。
export default function DrillView() {
  const s = useStore();
  const all = useMemo(() => visibleQuestions(s), [s.questions, s.role]);

  const byPoint = useMemo(() => {
    const m = new Map<string, number>();
    all.forEach((q) => m.set(q.point || "未分类", (m.get(q.point || "未分类") || 0) + 1));
    return [...m.entries()];
  }, [all]);

  const [point, setPoint] = useState<string | null>(null);
  const list = useMemo(() => (point ? all.filter((q) => (q.point || "未分类") === point) : []), [all, point]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const q = list[i];

  function choose(p: string | null) {
    setPoint(p);
    setI(0);
    setPicked(null);
  }

  if (!point) {
    return (
      <div>
        <div className="student-view-head">
          <h2>专题练习</h2>
          <span className="muted">选一个知识点开始刷题</span>
        </div>
        {byPoint.length ? (
          <div className="drill-points">
            {byPoint.map(([pt, n]) => (
              <button key={pt} className="drill-point-chip" onClick={() => choose(pt)}>
                {pt} <em>{n}</em>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">题库暂无可练习的题目</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="student-view-head">
        <button className="ghost small" onClick={() => choose(null)}>← 知识点</button>
        <h2 style={{ margin: 0 }}>{point}</h2>
        <span className="muted">{list.length ? `${i + 1}/${list.length}` : ""}</span>
      </div>
      {q ? (
        <article className="drill-card">
          <div className="muted" style={{ fontSize: 12 }}>{q.type} · {q.point}</div>
          <HtmlContent html={q.title} className="drill-stem" />
          {(q.choices || []).length ? (
            <ol className="drill-options">
              {(q.choices || []).map((c, idx) => {
                const label = String.fromCharCode(65 + idx);
                const correct = String(q.answer).trim() === label;
                const show = picked !== null && (correct || picked === label);
                return (
                  <li
                    key={idx}
                    className={`drill-opt ${show ? (correct ? "ok" : picked === label ? "bad" : "") : ""}`}
                    onClick={() => picked === null && setPicked(label)}
                  >
                    <b>{label}</b>
                    <HtmlContent html={c} />
                  </li>
                );
              })}
            </ol>
          ) : (
            <button className="ghost small" onClick={() => setPicked("show")}>查看答案</button>
          )}
          {picked !== null ? (
            <div className="drill-analysis">
              <strong>答案：{q.answer}</strong>
              {q.analysis ? <HtmlContent html={q.analysis} /> : null}
            </div>
          ) : null}
          <div className="drill-foot">
            <button className="ghost small" disabled={i <= 0} onClick={() => { setI(i - 1); setPicked(null); }}>上一题</button>
            <button className="primary small" disabled={i >= list.length - 1} onClick={() => { setI(i + 1); setPicked(null); }}>下一题</button>
          </div>
        </article>
      ) : (
        <div className="empty-state">该知识点暂无题目</div>
      )}
    </div>
  );
}
