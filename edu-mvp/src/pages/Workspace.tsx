import { useStore } from "../store/useStore";
import { currentProfile, visibleClasses } from "../store/permissions";
import EChart from "../components/common/EChart";
import { scoreTrendOption, submitDonutOption } from "../lib/charts";

// 工作台，移植自 legacy roleWorkspacePage（老师/管理员两种），含 3 个仪表盘图表。
export default function Workspace() {
  const s = useStore();
  const profile = currentProfile(s);

  if (s.role === "admin") {
    return (
      <section className="flow-home admin-flow">
        <article className="flow-hero">
          <div>
            <p>管理员工作台 · 光明中学</p>
            <h2>先把学校、账号和权限边界配置清楚</h2>
            <span>当前原型只保留 1 名管理员、1 名老师、1 名学生，方便完整跑通流程。</span>
          </div>
          <button className="primary small" onClick={() => s.switchSection("admin")}>
            进入后台管理
          </button>
        </article>
        <div className="flow-steps">
          <button className="step-card" onClick={() => s.switchSection("org")}>
            <em>01</em>
            <strong>组织结构</strong>
            <span>光明中学 / 初三(1)班 / 1 名学生</span>
          </button>
          <button className="step-card" onClick={() => s.switchSection("admin")}>
            <em>02</em>
            <strong>账号角色</strong>
            <span>管理员、老师、学生各 1 个账号</span>
          </button>
          <button className="step-card" onClick={() => s.switchSection("admin")}>
            <em>03</em>
            <strong>登录与 SSO</strong>
            <span>手机验证码、密码、登录状态记忆</span>
          </button>
        </div>
      </section>
    );
  }

  const classes = visibleClasses(s);
  const teacherAssignments = s.assignments.filter((a) =>
    classes.some((c) => c.name === a.className)
  );
  const studentCount = classes.reduce((sum, c) => sum + c.count, 0);
  // 教师侧统计基于全量 submissions（多学生×多卷）
  const teacherPaperIds = new Set(teacherAssignments.map((a) => a.paperId));
  const teacherSubs = s.submissions.filter((x) => teacherPaperIds.has(x.paperId));
  const pendingGrading = teacherSubs.filter((x) => !x.gradedAt).length;
  const submittedCount = teacherSubs.length;
  const weak = [...s.knowledge].sort((x, y) => x.mastery - y.mastery)[0];

  const kpis = [
    { label: "待批改", value: pendingGrading, hint: "主观题待人工批改", to: "grading" as const, accent: pendingGrading > 0 },
    { label: "进行中作业", value: teacherAssignments.length, hint: "已发布的作业/测验", to: "homework" as const },
    { label: "我的学生", value: studentCount, hint: classes.map((c) => c.name).join(" / ") || "暂无班级", to: "org" as const },
    { label: "风险学生", value: s.risk.length, hint: "需重点关注", to: "analytics" as const, accent: s.risk.length > 0 },
  ];

  return (
    <section className="dash">
      <article className="dash-hero">
        <div>
          <p>你好，{profile.name}</p>
          <h2>今天有 {pendingGrading} 项待批改、{teacherAssignments.length} 个进行中作业</h2>
          <span>{profile.scope}</span>
        </div>
        <div className="dash-hero-actions">
          <button className="ghost small" onClick={() => s.switchSection("bank")}>AI 出题</button>
          <button className="ghost small" onClick={() => s.switchSection("homework")}>组卷发布</button>
          <button className="primary small" onClick={() => s.switchSection("grading")}>去批改</button>
        </div>
      </article>

      <div className="dash-kpis">
        {kpis.map((k) => (
          <button key={k.label} className={`dash-kpi ${k.accent ? "accent" : ""}`} onClick={() => s.switchSection(k.to)}>
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            <em>{k.hint}</em>
          </button>
        ))}
      </div>

      <div className="dash-grid">
        <article className="panel">
          <div className="panel-head">
            <div><p>待办 / 近期</p><h2>作业与考试</h2></div>
            <button className="ghost small" onClick={() => s.switchSection("homework")}>发布</button>
          </div>
          {teacherAssignments.length ? (
            <table className="compact-table modern-table">
              <thead>
                <tr><th>名称</th><th>班级</th><th>截止</th><th>状态</th><th>操作</th></tr>
              </thead>
              <tbody>
                {teacherAssignments.slice(0, 6).map((a) => {
                  const rs = s.submissions.filter((x) => x.paperId === a.paperId);
                  const pending = rs.filter((x) => !x.gradedAt).length;
                  const status = !rs.length ? "待提交" : pending > 0 ? "待批改" : "已完成";
                  return (
                    <tr key={a.id}>
                      <td>{a.title}</td>
                      <td>{a.className}</td>
                      <td>{(a.deadline || "").replace("T", " ")}</td>
                      <td>
                        <span className={`status-pill ${status === "待批改" ? "warn" : status === "已完成" ? "ok" : ""}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="ghost small"
                          onClick={() => s.switchSection(pending ? "grading" : "analytics")}
                        >
                          {pending ? "去批改" : "看学情"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">还没有发布作业，去「作业与考试」发布一份</div>
          )}
        </article>

        <article className="panel">
          <div className="panel-head">
            <div><p>学情速览</p><h2>薄弱点与风险</h2></div>
            <button className="ghost small" onClick={() => s.switchSection("analytics")}>详情</button>
          </div>
          <div className="dash-weak">
            <div className="dash-weak-title">薄弱知识点</div>
            {s.knowledge.slice(0, 3).map((k) => (
              <div className="dash-weak-row" key={k.name}>
                <span>{k.name}</span>
                <i><b style={{ width: `${k.mastery}%` }} /></i>
                <em>{k.mastery}%</em>
              </div>
            ))}
          </div>
          <div className="info-list" style={{ marginTop: 10 }}>
            {s.risk.map((r) => (
              <div className="info-row" key={r.name}>
                <strong>{r.name}</strong>
                <span>{r.point} · {r.risk}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="dash-grid">
        <article className="panel">
          <div className="panel-head"><div><p>成绩趋势</p><h2>班级 vs 学生</h2></div></div>
          <EChart option={scoreTrendOption} height={240} />
        </article>
        <article className="panel">
          <div className="panel-head">
            <div><p>提交分布</p><h2>已交 {submittedCount} / 学生 {studentCount}</h2></div>
          </div>
          <EChart option={submitDonutOption} height={240} />
        </article>
      </div>

      <div className="dash-cta">
        <span>薄弱点「{weak?.name || "—"}」掌握率 {weak?.mastery ?? "--"}%，可一键分层练习</span>
        <button className="primary small" onClick={() => s.switchSection("analytics")}>去学情分析</button>
      </div>
    </section>
  );
}
