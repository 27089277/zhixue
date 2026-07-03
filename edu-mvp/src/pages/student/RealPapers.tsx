import { useMemo } from "react";
import { useStore } from "../../store/useStore";
import { publicRealPapers } from "../../lib/practice";

// 历史真题（整套试卷练习）：题源只来自「公开真题卷」（老师/管理员公开 + AI 网络导入 + 预置）。
const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "中考真题", label: "中考" },
  { key: "高考模拟", label: "高考" },
  { key: "unfinished", label: "未完成" },
];

export default function RealPapers() {
  const s = useStore();
  const { type, search, year, region } = s.paperFilters;

  function openStart(paperId: string) {
    const result = s.exam.submitted[paperId];
    if (result && !result.returned) s.openModal("paperResult", { paperId });
    else s.openModal("paperStart", { paperId });
  }

  const papers = useMemo(() => {
    return publicRealPapers(s.papers).filter((paper) => {
      const typeMatch =
        type === "all"
          ? true
          : type === "unfinished"
          ? paper.progress < 100
          : paper.exam === type;
      const q = search.toLowerCase();
      const searchMatch = !q || `${paper.title} ${paper.region} ${paper.year}`.toLowerCase().includes(q);
      const yearMatch = !year || String(paper.year) === year;
      const regionMatch = !region || paper.region === region;
      return typeMatch && searchMatch && yearMatch && regionMatch;
    });
  }, [s.papers, type, search, year, region]);

  return (
    <section className="paper-library">
      <div className="panel-head">
        <div>
          <p>历史真题</p>
          <h2>选择一整张真题试卷开始练习</h2>
        </div>
        <div className="subnav">
          {FILTERS.map((f) => (
            <button key={f.key} className={type === f.key ? "active" : ""} onClick={() => s.setPaperFilters({ type: f.key })}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="paper-filter-bar">
        <input placeholder="搜索试卷名称、地区或年份" value={search} onChange={(e) => s.setPaperFilters({ search: e.target.value })} />
        <select value={year} onChange={(e) => s.setPaperFilters({ year: e.target.value })}>
          <option value="">全部年份</option>
          <option>2025</option>
          <option>2024</option>
          <option>2023</option>
        </select>
        <select value={region} onChange={(e) => s.setPaperFilters({ region: e.target.value })}>
          <option value="">全部地区</option>
          <option>大连</option>
          <option>上海</option>
          <option>江苏</option>
        </select>
      </div>

      <div className="paper-list">
        {papers.length ? (
          papers.map((paper) => {
            const result = s.exam.submitted[paper.id];
            return (
              <article className="paper-card" key={paper.id}>
                <div className="paper-card-head">
                  <span>{paper.exam}</span>
                  <em>{paper.difficulty}</em>
                </div>
                <strong>{paper.title}</strong>
                <span>
                  {paper.region} · {paper.year} · {paper.questions} 题 · {paper.score} 分 · {paper.duration} 分钟
                </span>
                <div className="progress">
                  <i style={{ width: `${paper.progress}%` }} />
                </div>
                <div className="tag-row">
                  {paper.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="paper-card-actions">
                  <small>
                    {result?.returned ? "老师已退回修改" : result ? `已交卷 · ${result.score} 分` : paper.progress ? `已完成 ${paper.progress}%` : "尚未开始"}
                  </small>
                  <button className="primary small" onClick={() => openStart(paper.id)}>
                    {result?.returned ? "修改后重交" : result ? "查看结果" : paper.progress ? "继续答题" : "开始答题"}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-state">暂无公开真题：老师/管理员把试卷「设为公共真题」或用 AI 联网导入后即可练习</div>
        )}
      </div>
    </section>
  );
}
