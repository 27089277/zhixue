import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { useNotify } from "../../hooks/useNotify";
import { publicRealPapers } from "../../lib/practice";
import { importRealPaperFromWeb } from "../../lib/studentAi";

// 历史真题（AI 搜索）：先在【公共题库真题】里找；找不到再用 GenAI【联网检索】导入。
// 题库命中的可直接练习；联网导入的为「学生私有卷」，也可直接作答。错题进自己的错题本。
export default function RealPapers() {
  const s = useStore();
  const notify = useNotify();
  const [kw, setKw] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [searched, setSearched] = useState(false);
  const [resultIds, setResultIds] = useState<string[]>([]);

  const bank = useMemo(() => publicRealPapers(s.papers), [s.papers]);
  const results = useMemo(
    () => resultIds.map((id) => s.papers.find((p) => p.id === id)).filter(Boolean),
    [resultIds, s.papers]
  );

  function openStart(paperId: string) {
    const result = s.exam.submitted[paperId];
    if (result && !result.returned) s.openModal("paperResult", { paperId });
    else s.openModal("paperStart", { paperId });
  }

  function matchBank(q: string) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return bank.filter((p) => {
      const hay = `${p.title} ${p.subject} ${p.year} ${p.region} ${p.exam}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  async function search() {
    const q = kw.trim();
    if (!q) return notify("info", "输入你想找的真题，如：2024 大连中考数学");
    setSearched(true);
    const hits = matchBank(q);
    if (hits.length) {
      setResultIds(hits.map((p) => p.id));
      setNote(`题库找到 ${hits.length} 套，可直接练习`);
      return;
    }
    setBusy(true);
    setNote("题库暂无，正在联网检索真题…");
    try {
      const p = await importRealPaperFromWeb(q);
      setResultIds([p.id]);
      setNote("题库没有，已从网络导入 1 套（我的私有卷）");
    } catch (e: any) {
      setResultIds([]);
      setNote("");
      notify("error", e?.message || "联网检索失败，换个说法或年份再试");
    } finally {
      setBusy(false);
    }
  }

  async function searchMoreOnline() {
    const q = kw.trim();
    if (!q) return;
    setBusy(true);
    try {
      const p = await importRealPaperFromWeb(q);
      setResultIds((prev) => [p.id, ...prev]);
      setNote("已再从网络导入 1 套");
    } catch (e: any) {
      notify("error", e?.message || "联网检索失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="paper-library">
      <div className="panel-head">
        <div>
          <p>历史真题 · AI 搜索</p>
          <h2>先搜公共题库，找不到自动联网检索</h2>
        </div>
        <span className="pill">公共 {bank.length} 套</span>
      </div>

      <div className="ai-search-box" style={{ display: "grid", gap: 10, background: "#fff", border: "1px solid #e6ece9", borderRadius: 12, padding: 12 }}>
        <textarea
          rows={2}
          disabled={busy}
          placeholder="用一句话描述你要找的真题，如：2024 年大连中考数学卷 / 人教版八年级物理期末真题"
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          style={{ resize: "vertical", border: "1px solid #e6ece9", borderRadius: 8, padding: 10, fontSize: 15 }}
        />
        <button className="primary" disabled={busy} onClick={search}>
          {busy ? "检索中…" : "🔍 搜索真题"}
        </button>
      </div>

      {note && <p style={{ color: "#5b6b64", fontSize: 13, margin: "8px 0" }}>{note}</p>}

      <div className="paper-list">
        {results.map((paper) => {
          if (!paper) return null;
          const result = s.exam.submitted[paper.id];
          const online = (paper.tags || []).includes("我的私有");
          return (
            <article className="paper-card" key={paper.id}>
              <div className="paper-card-head">
                <span>{online ? "网络导入 · 仅你可见" : paper.exam}</span>
                <em>{paper.difficulty}</em>
              </div>
              <strong>{paper.title}</strong>
              <span>
                {paper.region} · {paper.year} · {paper.questions} 题 · {paper.score} 分 · {paper.duration} 分钟
              </span>
              <div className="tag-row">
                {(paper.tags || []).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="paper-card-actions">
                <small>
                  {result?.returned ? "老师已退回修改" : result ? `已交卷 · ${result.score} 分` : paper.progress ? `已完成 ${paper.progress}%` : "尚未开始"}
                </small>
                <button className="primary small" onClick={() => openStart(paper.id)}>
                  {result?.returned ? "修改后重交" : result ? "查看结果" : paper.progress ? "继续答题" : "开始练习"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {searched && !busy && (
        <button className="ghost" onClick={searchMoreOnline} style={{ marginTop: 8 }}>
          🌐 {results.length ? "没找到想要的？再联网搜一套" : "联网搜索真题"}
        </button>
      )}
      {!searched && (
        <p style={{ color: "#8a978f", fontSize: 13, marginTop: 12 }}>
          输入后点「搜索真题」：题库有就直接练，没有就自动联网找。
        </p>
      )}
    </section>
  );
}
