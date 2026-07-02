import { useEffect, useMemo, useState } from "react";
import { Checkbox, InputNumber, DatePicker } from "antd";
import dayjs from "dayjs";
import PageShell from "../components/common/PageShell";
import PaperSearchBox from "../components/bank/PaperSearchBox";
import { useStore } from "../store/useStore";
import { visibleClasses, canViewBankAsset } from "../store/permissions";
import { useNotify } from "../hooks/useNotify";
import { aiPost } from "../api/client";

// 发布中心，移植自 legacy homeworkPage + publishAssignmentFromPage。
export default function Homework() {
  const s = useStore();
  const notify = useNotify();
  const classes = visibleClasses(s);

  const [title, setTitle] = useState("");
  // 标题是否被用户手动改过：未改过时随所选试卷名自动同步
  const [titleDirty, setTitleDirty] = useState(false);
  const [kind, setKind] = useState("作业");
  const [className, setClassName] = useState(classes[0]?.name || "");
  const [deadline, setDeadline] = useState("2026-07-01T22:00");
  const [mode, setMode] = useState<"paper" | "new">("paper");
  // 答题限制：默认限时 45 分钟、交卷后统一出分、不允许重做
  const [unlimited, setUnlimited] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(45);
  const [allowRedo, setAllowRedo] = useState(false);
  const [paperId, setPaperId] = useState(s.activePaperId || s.papers[0]?.id);
  // 手动组卷后（addPaper 会设置 activePaperId），自动选中新试卷并切到整卷发布
  useEffect(() => {
    if (s.activePaperId && s.activePaperId !== paperId) {
      setPaperId(s.activePaperId);
      setMode("paper");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.activePaperId]);

  // 试卷智能搜索（GenAI 向量检索，与试卷库一致），单输入框
  const [paperIds, setPaperIds] = useState<Set<string> | null>(null);
  const [searchBusy, setSearchBusy] = useState(false);
  const visiblePapers = useMemo(
    () => s.papers.filter((p) => canViewBankAsset(s, p)),
    [s]
  );
  const shownPapers = useMemo(
    () => (paperIds ? visiblePapers.filter((p) => paperIds.has(p.id)) : visiblePapers),
    [visiblePapers, paperIds]
  );
  const selectedPaper = useMemo(
    () => s.papers.find((p) => p.id === paperId),
    [s.papers, paperId]
  );
  // 标题默认取所选试卷名称：用户未手动改过时，随选卷自动填入/更新
  useEffect(() => {
    if (mode === "paper" && !titleDirty && selectedPaper) {
      setTitle(selectedPaper.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedPaper?.id, titleDirty]);

  async function searchPapers(q: string) {
    const query = q.trim();
    if (!query) {
      setPaperIds(null);
      return;
    }
    setSearchBusy(true);
    try {
      const ai = await aiPost("/ai/search-papers", { query, k: 30 });
      const ids: string[] = (ai?.result?.ids || []).map(String);
      const known = ids.filter((id) => s.papers.some((p) => p.id === id));
      if (known.length) {
        setPaperIds(new Set(known));
        return;
      }
    } catch {
      /* 兜底：本地关键词过滤 */
    } finally {
      setSearchBusy(false);
    }
    const k = query.toLowerCase();
    setPaperIds(
      new Set(
        s.papers
          .filter((p) => `${p.title} ${p.subject} ${p.region} ${p.exam}`.toLowerCase().includes(k))
          .map((p) => p.id)
      )
    );
  }

  function publish() {
    if (!title.trim()) return notify("error", "请输入发布标题");
    if (!className) return notify("error", "当前没有可发布的授权班级");
    if (mode === "paper" && !paperId) return notify("error", "请选择要发布的试卷");
    s.addAssignment({
      id: `hw-${Date.now()}`,
      title,
      kind,
      mode,
      paperId,
      className,
      deadline: deadline || "2026-07-01T22:00",
      status: "进行中",
      createdAt: Date.now(),
      timeLimit: unlimited ? null : timeLimit,
      allowRedo,
    });
    notify("success", `${kind}“${title}”已发布到 ${className}`);
  }

  const myAssignments = s.assignments.filter((a) =>
    classes.some((c) => c.name === a.className)
  );

  return (
    <PageShell
      eyebrow="发布中心"
      title="发布作业、测验或考试"
      actions={
        <div className="page-actions">
          <button className="ghost small" onClick={() => s.openModal("question")}>
            新增题目
          </button>
          <button className="primary small" onClick={publish}>
            确认发布
          </button>
        </div>
      }
    >
      <div className="publish-page">
        <article className="publish-hero">
          <div>
            <p>只可发布到授权班级</p>
            <h2>从整卷、题库或临时题快速发布</h2>
          </div>
          <div className="publish-steps">
            <span className="active">1 设置</span>
            <span>2 选内容</span>
            <span>3 发布</span>
          </div>
        </article>

        <section className="publish-layout">
          <article className="panel publish-card">
            <div className="panel-head">
              <div>
                <p>发布信息</p>
                <h2>对象与规则</h2>
              </div>
            </div>
            <div className="publish-grid compact">
              <label className="field">
                <span>类型</span>
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option>作业</option>
                  <option>测验</option>
                  <option>考试</option>
                </select>
              </label>
              <label className="field">
                <span>班级</span>
                <select value={className} onChange={(e) => setClassName(e.target.value)}>
                  {classes.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="field full">
                <span>标题</span>
                <input
                  value={title}
                  placeholder="默认取所选试卷名称"
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleDirty(true);
                  }}
                />
              </label>
              <div className="field full">
                <span>截止时间</span>
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  value={deadline ? dayjs(deadline) : null}
                  onChange={(d) => setDeadline(d ? d.format("YYYY-MM-DDTHH:mm") : "")}
                  placeholder="选择截止日期与时间"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="field full">
                <span>答题限制</span>
                <div className="answer-limit">
                  <Checkbox checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)}>
                    不限时
                  </Checkbox>
                  <span className="answer-limit-time">
                    时长
                    <InputNumber
                      min={1}
                      max={300}
                      value={unlimited ? null : timeLimit}
                      disabled={unlimited}
                      onChange={(v) => setTimeLimit(Number(v) || 45)}
                      addonAfter="分钟"
                      style={{ width: 130 }}
                    />
                  </span>
                  <Checkbox checked={allowRedo} onChange={(e) => setAllowRedo(e.target.checked)}>
                    允许重做
                  </Checkbox>
                  <span className="answer-limit-note">交卷后统一出分（默认）</span>
                </div>
              </div>
            </div>
            <div className="publish-rules clean">
              <label>
                <input type="checkbox" defaultChecked /> 触屏笔手写过程
              </label>
              <label>
                <input type="checkbox" defaultChecked /> 批改后显示解析
              </label>
              <label>
                <input type="checkbox" defaultChecked /> 自动进入错题本
              </label>
              <label>
                <input type="checkbox" /> 通知家长端
              </label>
            </div>
          </article>

          <article className="panel publish-card span-2">
            <div className="panel-head">
              <div>
                <p>内容来源</p>
                <h2>整卷发布</h2>
              </div>
              <div className="content-source-actions">
                <button className="ghost small" onClick={() => s.openModal("paperCreator")}>
                  ＋ 手动组卷
                </button>
              </div>
            </div>
            <div className="publish-mode refined">
              {(
                [
                  ["paper", "整卷发布", "从试卷库选择一张试卷，学生按整卷答题。"],
                  ["new", "临时新增题", "现场新增题目，可选择是否沉淀到题库。"],
                ] as const
              ).map(([val, t, d]) => (
                <label className="mode-card" key={val}>
                  <input
                    type="radio"
                    name="publishMode"
                    checked={mode === val}
                    onChange={() => setMode(val)}
                  />{" "}
                  <strong>{t}</strong>
                  <span>{d}</span>
                </label>
              ))}
            </div>

            {mode === "paper" ? (
              <>
                <PaperSearchBox onSearch={searchPapers} busy={searchBusy} active={!!paperIds} />
                <div className="paper-choice-list">
                  {shownPapers.length === 0 && (
                    <div className="empty-state">没有匹配的试卷，换个说法或点「＋ 手动组卷」</div>
                  )}
                  {shownPapers.map((paper) => (
                    <label className="paper-choice" key={paper.id}>
                      <input
                        type="radio"
                        name="homeworkPaperRadio"
                        checked={paper.id === paperId}
                        onChange={() => setPaperId(paper.id)}
                      />
                      <span>
                        <strong>{paper.title}</strong>
                        <small>
                          {paper.exam} · {paper.questions} 题 · {paper.score} 分 · {paper.duration} 分钟
                        </small>
                      </span>
                      <button
                        type="button"
                        className="ghost small"
                        onClick={(e) => {
                          e.preventDefault();
                          s.openModal("paperDetail", paper);
                        }}
                      >
                        预览
                      </button>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="publish-newq-hint">
                <p>临时新增题：先到「题库 → 自己编写题目」创建，再回来用「整卷发布 / 手动组卷」发布。</p>
                <button className="primary small" onClick={() => s.openModal("question")}>
                  新增题目
                </button>
              </div>
            )}
          </article>
        </section>

        <section className="panel publish-records">
          <div className="panel-head">
            <div>
              <p>发布记录</p>
              <h2>我发布的作业、测验和考试</h2>
            </div>
          </div>
          <table className="compact-table modern-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>班级</th>
                <th>内容</th>
                <th>截止时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {myAssignments.map((item) => {
                const paper =
                  s.papers.find((p) => p.id === item.paperId) || s.papers[0];
                const paperSubs = s.submissions.filter((x) => x.paperId === item.paperId);
                const hasPending = paperSubs.some((x) => !x.gradedAt);
                return (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.kind || "作业"}</td>
                    <td>{item.className}</td>
                    <td>
                      {item.mode === "questions"
                        ? `${item.questionCount || s.selectedQuestions} 道题`
                        : paper?.title}
                    </td>
                    <td>{item.deadline.replace("T", " ")}</td>
                    <td>
                      {paperSubs.length
                        ? hasPending
                          ? `待批改（${paperSubs.length}份）`
                          : `已批改（${paperSubs.length}份）`
                        : item.status}
                    </td>
                    <td>
                      <button
                        className="ghost small"
                        onClick={() => s.switchSection(paperSubs.length ? "grading" : "homework")}
                      >
                        {paperSubs.length ? "去批改" : "查看进度"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </PageShell>
  );
}
