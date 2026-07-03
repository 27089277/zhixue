import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { HtmlContent } from "../../components/common/RichText";
import { publicBankQuestions, publicRealPapers, wrongKey } from "../../lib/practice";
import { generateStudentPractice } from "../../lib/studentAi";
import { useNotify } from "../../hooks/useNotify";

interface DrillQ {
  subject: string;
  point: string;
  type: string;
  title: string;
  choices?: string[];
  answer?: string;
  analysis?: string;
  origin: "bank" | "paper" | "student-ai";
}

// 自主练习：题源只来自 公共题库 + 公开真题卷 + 学生自己的 AI 私有题。
// 顶部一句话 AI 出题（生成学生私有题）→ 刷题；错题进自己的错题本。
export default function DrillView() {
  const s = useStore();
  const notify = useNotify();
  const busy = useStore((st) => st.aiBusy);

  const pool = useMemo<DrillQ[]>(() => {
    const out: DrillQ[] = [];
    const seen = new Set<string>();
    const push = (q: DrillQ) => {
      const k = q.title.slice(0, 40);
      if (seen.has(k)) return;
      seen.add(k);
      out.push(q);
    };
    s.myPracticeQuestions.forEach((q) =>
      push({ subject: q.subject || "综合", point: q.point || "未分类", type: q.type, title: q.title, choices: q.choices, answer: q.answer, analysis: q.analysis, origin: "student-ai" })
    );
    publicBankQuestions(s.questions).forEach((q) =>
      push({ subject: q.subject || "综合", point: q.point || "未分类", type: q.type, title: q.title, choices: q.choices, answer: q.answer, analysis: q.analysis, origin: "bank" })
    );
    publicRealPapers(s.papers).forEach((p) =>
      (p.items || []).forEach((it) =>
        push({ subject: p.subject || "综合", point: (it.knowledge || [])[0] || p.subject || "未分类", type: it.type, title: it.title, choices: it.choices, answer: it.answer, analysis: it.analysis, origin: "paper" })
      )
    );
    return out;
  }, [s.myPracticeQuestions, s.questions, s.papers]);

  const byPoint = useMemo(() => {
    const m = new Map<string, number>();
    pool.forEach((q) => m.set(q.point, (m.get(q.point) || 0) + 1));
    return [...m.entries()];
  }, [pool]);

  const [point, setPoint] = useState<string | null>(null);
  const [nl, setNl] = useState("");
  const list = useMemo(() => (point ? pool.filter((q) => q.point === point) : []), [pool, point]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const q = list[i];

  function choose(p: string | null) {
    setPoint(p);
    setI(0);
    setPicked(null);
  }

  async function runAi() {
    if (!nl.trim()) return notify("info", "说一句你想练什么，如：给我来 5 道二次函数的中档单选题");
    try {
      s.setAiBusy(true);
      const qs = await generateStudentPractice(nl.trim());
      setNl("");
      notify("success", `AI 为你出了 ${qs.length} 道题（仅你可见）`);
      choose(qs[0]?.point || null);
    } catch (e: any) {
      notify("error", e?.message || "AI 出题失败");
    } finally {
      s.setAiBusy(false);
    }
  }

  function pick(label: string) {
    if (picked !== null || !q) return;
    setPicked(label);
    if (String(q.answer).trim() !== label) {
      s.logPracticeWrong({
        key: wrongKey(q.subject, q.title),
        subject: q.subject,
        point: q.point,
        type: q.type,
        stem: q.title,
        choices: q.choices,
        mine: label,
        answer: String(q.answer || ""),
        analysis: q.analysis,
        origin: q.origin === "student-ai" ? "student-ai" : "practice",
        at: Date.now(),
      });
    }
  }

  if (!point) {
    return (
      <div>
        <div className="student-view-head">
          <h2>自主练习</h2>
          <span className="muted">公共题库 · 公开真题 · 你的 AI 自练</span>
        </div>
        {/* 一句话 AI 出题 */}
        <div className="drill-ai-box" style={{ display: "flex", gap: 8, margin: "12px 0 16px" }}>
          <input
            style={{ flex: 1, padding: "10px 12px", border: "1px solid #e6ece9", borderRadius: 10 }}
            placeholder="AI 出题：给我来 5 道二次函数的中档单选题（仅自己可见）"
            value={nl}
            disabled={busy}
            onChange={(e) => setNl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAi()}
          />
          <button className="primary" disabled={busy} onClick={runAi}>
            {busy ? "AI 出题中…" : "AI 出题"}
          </button>
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
          <div className="empty-state">公共题库暂无可练题目，先用上面的「AI 出题」出几道，或让老师把真题设为公开</div>
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
          <div className="muted" style={{ fontSize: 12 }}>{q.type} · {q.point}{q.origin === "student-ai" ? " · AI 自练" : ""}</div>
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
                    onClick={() => pick(label)}
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
