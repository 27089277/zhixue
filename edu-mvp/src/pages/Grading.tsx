import { useMemo, useState } from "react";
import { Pagination, Popconfirm } from "antd";
import dayjs from "dayjs";
import PageShell from "../components/common/PageShell";
import { useStore } from "../store/useStore";
import { useNotify } from "../hooks/useNotify";

const PAGE = 8;

// 批改与评价：待批改队列 + 已批改列表，按「学生×试卷」的单条 submission 运作，均整宽、可搜索、分页。
export default function Grading() {
  const s = useStore();
  const notify = useNotify();

  const [queueKw, setQueueKw] = useState("");
  const [queuePage, setQueuePage] = useState(1);
  const [gradedKw, setGradedKw] = useState("");
  const [gradedPage, setGradedPage] = useState(1);

  // 每条 submission 关联到试卷，便于显示标题/满分
  const rows = useMemo(
    () =>
      s.submissions.map((sub) => ({
        sub,
        paper: s.papers.find((p) => p.id === sub.paperId),
      })),
    [s.submissions, s.papers]
  );

  const match = (title: string, name: string | undefined, kw: string) => {
    const k = kw.trim().toLowerCase();
    if (!k) return true;
    return `${title} ${name || ""}`.toLowerCase().includes(k);
  };

  const queue = useMemo(
    () =>
      rows
        .filter(
          ({ sub, paper }) =>
            !sub.gradedAt &&
            match(paper?.title || sub.paperId, sub.studentName, queueKw)
        )
        .sort((a, b) => (b.sub.submittedAt ?? 0) - (a.sub.submittedAt ?? 0)),
    [rows, queueKw]
  );

  const graded = useMemo(
    () =>
      rows
        .filter(
          ({ sub, paper }) =>
            sub.gradedAt &&
            match(paper?.title || sub.paperId, sub.studentName, gradedKw)
        )
        .sort((a, b) => (b.sub.gradedAt ?? 0) - (a.sub.gradedAt ?? 0)),
    [rows, gradedKw]
  );

  const queueItems = queue.slice((queuePage - 1) * PAGE, queuePage * PAGE);
  const gradedItems = graded.slice((gradedPage - 1) * PAGE, gradedPage * PAGE);

  return (
    <PageShell
      eyebrow="批改 / 评分点 / 批注 / 退回重做"
      title="批改与评价中心"
      actions={
        <button className="primary small" onClick={() => s.openModal("rubric")}>
          配置评分标准
        </button>
      }
    >
      <div className="module-grid">
        {/* 批改队列（整宽 + 搜索 + 分页） */}
        <article className="panel wide">
          <div className="panel-head">
            <div>
              <p>批改队列</p>
              <h2>按题批改更快</h2>
            </div>
            <div className="panel-tools">
              <input
                className="grading-search"
                placeholder="搜索试卷 / 学生"
                value={queueKw}
                onChange={(e) => {
                  setQueueKw(e.target.value);
                  setQueuePage(1);
                }}
              />
              <span className="muted">待批改 {queue.length}</span>
            </div>
          </div>

          {queue.length ? (
            <>
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>学生</th>
                    <th>试卷</th>
                    <th>状态</th>
                    <th>客观分</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {queueItems.map(({ sub, paper }) => (
                    <tr key={sub.id}>
                      <td>{sub.studentName || "学生"}</td>
                      <td>{paper?.title || sub.paperId}</td>
                      <td>
                        {sub.returned
                          ? "已退回待重做"
                          : `${sub.pendingManual} 道主观题待批`}
                      </td>
                      <td>
                        {sub.score}/{sub.objectiveTotal}
                      </td>
                      <td className="table-actions">
                        <button
                          className="ghost small"
                          onClick={() =>
                            s.openModal("submission", { submissionId: sub.id })
                          }
                        >
                          进入批改
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {queue.length > PAGE && (
                <div className="table-pager">
                  <Pagination
                    current={queuePage}
                    pageSize={PAGE}
                    total={queue.length}
                    showSizeChanger={false}
                    onChange={setQueuePage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              {queueKw ? "没有匹配的待批答卷" : "暂无待批提交"}
            </div>
          )}
        </article>

        {/* 已批改（整宽 + 搜索 + 分页） */}
        <article className="panel wide">
          <div className="panel-head">
            <div>
              <p>已批改</p>
              <h2>批改记录</h2>
            </div>
            <div className="panel-tools">
              <input
                className="grading-search"
                placeholder="搜索试卷 / 学生"
                value={gradedKw}
                onChange={(e) => {
                  setGradedKw(e.target.value);
                  setGradedPage(1);
                }}
              />
              <span className="muted">共 {graded.length} 份</span>
            </div>
          </div>

          {graded.length ? (
            <>
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>学生</th>
                    <th>试卷</th>
                    <th>客观分</th>
                    <th>主观分</th>
                    <th>最终分</th>
                    <th>批改时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {gradedItems.map(({ sub, paper }) => (
                    <tr key={sub.id}>
                      <td>{sub.studentName || "学生"}</td>
                      <td>{paper?.title || sub.paperId}</td>
                      <td>
                        {sub.score}/{sub.objectiveTotal}
                      </td>
                      <td>{sub.manualScore ?? 0}</td>
                      <td>
                        <strong>{sub.finalScore ?? sub.score}</strong> /{" "}
                        {paper?.score ?? "-"}
                      </td>
                      <td>
                        {sub.gradedAt ? dayjs(sub.gradedAt).format("MM-DD HH:mm") : "-"}
                      </td>
                      <td className="table-actions">
                        <button
                          className="ghost small"
                          onClick={() =>
                            s.openModal("submission", {
                              submissionId: sub.id,
                              readOnly: true,
                            })
                          }
                        >
                          查看
                        </button>
                        <button
                          className="ghost small"
                          onClick={() =>
                            s.openModal("submission", { submissionId: sub.id })
                          }
                        >
                          编辑
                        </button>
                        <Popconfirm
                          title="删除这份批改记录？"
                          description="删除后该学生答卷/批改将被移除，不可恢复。"
                          okText="删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => {
                            s.deleteSubmission(sub.id);
                            notify("success", "批改记录已删除");
                            const total = graded.length - 1;
                            const maxPage = Math.max(1, Math.ceil(total / PAGE));
                            if (gradedPage > maxPage) setGradedPage(maxPage);
                          }}
                        >
                          <button className="ghost small danger-text">删除</button>
                        </Popconfirm>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {graded.length > PAGE && (
                <div className="table-pager">
                  <Pagination
                    current={gradedPage}
                    pageSize={PAGE}
                    total={graded.length}
                    showSizeChanger={false}
                    onChange={setGradedPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              {gradedKw ? "没有匹配的已批改答卷" : "还没有已批改的答卷"}
            </div>
          )}
        </article>
      </div>
    </PageShell>
  );
}
