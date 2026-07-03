import { useStore } from "../../store/useStore";
import StudentMessages from "./StudentMessages";

// 学生「作业」页：只展示老师发布给本人的作业（历史真题独立到 RealPapers）。
export default function PaperLibrary() {
  const s = useStore();

  function openStart(paperId: string) {
    const result = s.exam.submitted[paperId];
    if (result && !result.returned) {
      s.openModal("paperResult", { paperId });
    } else {
      s.openModal("paperStart", { paperId });
    }
  }

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
            <div className="empty-state">暂无老师发布的作业。历史真题 / 自主练习请到对应页面</div>
          )}
        </div>
      </div>
    </section>
  );
}
