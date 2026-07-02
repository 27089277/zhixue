import { useStore } from "../../store/useStore";
import StudentMessages from "./StudentMessages";

// 学生试卷库，移植自 legacy renderStudentAssignments + renderStudentPapers。
const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "中考真题", label: "中考" },
  { key: "高考模拟", label: "高考" },
  { key: "unfinished", label: "未完成" },
];

export default function PaperLibrary() {
  const s = useStore();
  const { type, search, year, region } = s.paperFilters;

  function openStart(paperId: string) {
    const result = s.exam.submitted[paperId];
    if (result && !result.returned) {
      s.openModal("paperResult", { paperId });
    } else {
      s.openModal("paperStart", { paperId });
    }
  }

  const papers = s.papers.filter((paper) => {
    const typeMatch =
      type === "all"
        ? true
        : type === "unfinished"
        ? paper.progress < 100
        : paper.exam === type;
    const q = search.toLowerCase();
    const searchMatch =
      !q || `${paper.title} ${paper.region} ${paper.year}`.toLowerCase().includes(q);
    const yearMatch = !year || String(paper.year) === year;
    const regionMatch = !region || paper.region === region;
    return typeMatch && searchMatch && yearMatch && regionMatch;
  });

  return (
    <section className="paper-library">
      <StudentMessages />
      <div className="assignment-section">
        <div className="panel-head">
          <div>
            <p>老师发布</p>
            <h2>我的作业</h2>
          </div>
        </div>
        <div className="assignment-list">
          {s.assignments.length ? (
            s.assignments.map((assignment) => {
              const paper = s.papers.find((p) => p.id === assignment.paperId);
              const result = s.exam.submitted[assignment.paperId];
              const needsRedo = result?.returned;
              if (!paper) return null;
              return (
                <article className="assignment-row" key={assignment.id}>
                  <div>
                    <strong>{assignment.title}</strong>
                    <span>
                      {paper.title} · 截止 {assignment.deadline.replace("T", " ")}
                    </span>
                  </div>
                  <em className={result && !needsRedo ? "done" : ""}>
                    {needsRedo ? "老师退回" : result ? "已提交" : assignment.status}
                  </em>
                  <button
                    className={`${result && !needsRedo ? "ghost" : "primary"} small`}
                    onClick={() => openStart(paper.id)}
                  >
                    {needsRedo ? "修改后重交" : result ? "查看结果" : "开始作业"}
                  </button>
                </article>
              );
            })
          ) : (
            <div className="empty-state">暂无老师发布的作业</div>
          )}
        </div>
      </div>

      <div className="panel-head">
        <div>
          <p>历史真题 / 自主练习</p>
          <h2>选择一整张试卷开始练习</h2>
        </div>
        <div className="subnav">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={type === f.key ? "active" : ""}
              onClick={() => s.setPaperFilters({ type: f.key })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="paper-filter-bar">
        <input
          placeholder="搜索试卷名称、地区或年份"
          value={search}
          onChange={(e) => s.setPaperFilters({ search: e.target.value })}
        />
        <select value={year} onChange={(e) => s.setPaperFilters({ year: e.target.value })}>
          <option value="">全部年份</option>
          <option>2025</option>
          <option>2024</option>
          <option>2023</option>
        </select>
        <select
          value={region}
          onChange={(e) => s.setPaperFilters({ region: e.target.value })}
        >
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
                  {paper.region} · {paper.year} · {paper.questions} 题 · {paper.score} 分 ·{" "}
                  {paper.duration} 分钟
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
                    {result?.returned
                      ? "老师已退回修改"
                      : result
                      ? `已交卷 · ${result.score} 分`
                      : paper.progress
                      ? `已完成 ${paper.progress}%`
                      : "尚未开始"}
                  </small>
                  <button className="primary small" onClick={() => openStart(paper.id)}>
                    {result?.returned
                      ? "修改后重交"
                      : result
                      ? "查看结果"
                      : paper.progress
                      ? "继续答题"
                      : "开始答题"}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-state">没有符合条件的试卷</div>
        )}
      </div>
    </section>
  );
}
