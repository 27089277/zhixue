import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import PageShell from "../components/common/PageShell";
import EChart from "../components/common/EChart";
import { useStore } from "../store/useStore";
import { knowledgeBarOption } from "../lib/charts";
import { aiPost } from "../api/client";
import { visibleClasses } from "../store/permissions";
import AiComposer from "../components/common/AiComposer";
import type { AiInsight } from "../api/ai";
import type { SubmissionRecord } from "../types";

const SAMPLE_QUESTIONS = [
  "这次作业哪些学生需要重点辅导？",
  "哪些知识点最薄弱，怎么讲评？",
  "按薄弱点给出一份分层练习建议",
  "整体情况如何，有什么风险？",
];

// 分数段分布图（按传入答卷得分率计算）
function distOption(pcts: number[]): EChartsOption {
  const buckets = ["<60", "60-70", "70-80", "80-90", "90-100"];
  const counts = [0, 0, 0, 0, 0];
  pcts.forEach((p) => {
    const i = p < 60 ? 0 : p < 70 ? 1 : p < 80 ? 2 : p < 90 ? 3 : 4;
    counts[i]++;
  });
  return {
    tooltip: {},
    grid: { left: 36, right: 16, top: 16, bottom: 28 },
    xAxis: { type: "category", data: buckets },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      { type: "bar", data: counts, itemStyle: { color: "#087c59", borderRadius: [6, 6, 0, 0] }, barWidth: 26 },
    ],
  };
}

// 学情分析：按测验汇总 + 下钻（分数段分布 / 学生排名）。数据源为教师侧全量 submissions。
export default function Analytics() {
  const s = useStore();
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  const studentCount = visibleClasses(s).reduce((n, c) => n + c.count, 0);

  // 每份答卷 → 得分率
  const pctOf = (sub: SubmissionRecord, paperScore?: number) => {
    const total = paperScore || sub.objectiveTotal || 0;
    const got = sub.finalScore ?? sub.score;
    return total ? Math.round((got / total) * 100) : 0;
  };

  // 按测验（paperId）聚合
  const tests = useMemo(() => {
    const byPaper = new Map<string, SubmissionRecord[]>();
    s.submissions.forEach((sub) => {
      const list = byPaper.get(sub.paperId) || [];
      list.push(sub);
      byPaper.set(sub.paperId, list);
    });
    return [...byPaper.entries()]
      .map(([paperId, subs]) => {
        const paper = s.papers.find((p) => p.id === paperId);
        const pcts = subs.map((sub) => pctOf(sub, paper?.score));
        const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
        const pass = pcts.length ? Math.round((pcts.filter((p) => p >= 60).length / pcts.length) * 100) : 0;
        return {
          paperId,
          title: paper?.title || paperId,
          paperScore: paper?.score,
          count: subs.length,
          avg,
          pass,
          best: pcts.length ? Math.max(...pcts) : 0,
          worst: pcts.length ? Math.min(...pcts) : 0,
          subs,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [s.submissions, s.papers]);

  // 顶部总览
  const totalSubs = s.submissions.length;
  const allPcts = useMemo(
    () =>
      s.submissions.map((sub) =>
        pctOf(sub, s.papers.find((p) => p.id === sub.paperId)?.score)
      ),
    [s.submissions, s.papers]
  );
  const avgAll = allPcts.length ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : 0;
  const passAll = allPcts.length ? Math.round((allPcts.filter((p) => p >= 60).length / allPcts.length) * 100) : 0;

  // 下钻：选中测验的分数段分布 + 学生排名（未选中则展示全部聚合分布）
  const selected = tests.find((t) => t.paperId === selectedPaperId) || null;
  const drillPcts = selected
    ? selected.subs.map((sub) => pctOf(sub, selected.paperScore))
    : allPcts;
  const ranking = useMemo(() => {
    const subs = selected ? selected.subs : s.submissions;
    return subs
      .map((sub) => {
        const paper = s.papers.find((p) => p.id === sub.paperId);
        return {
          id: sub.id,
          name: sub.studentName || "学生",
          paper: paper?.title || sub.paperId,
          score: sub.finalScore ?? sub.score,
          total: paper?.score ?? sub.objectiveTotal,
          pct: pctOf(sub, paper?.score),
        };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [selected, s.submissions, s.papers]);

  async function analyzeClass(question: string) {
    setLoading(true);
    try {
      const ai = await aiPost("/ai/analyze", {
        scene: "班级学情分析",
        question:
          question ||
          "基于班级作答数据分析整体情况、薄弱知识点、需要关注的学生，并给出讲评与分层练习建议。",
        context: {
          studentCount,
          answered: totalSubs,
          avgPercent: avgAll,
          passRate: passAll,
          tests: tests.map((t) => ({ title: t.title, count: t.count, avg: t.avg, pass: t.pass })),
          weakPoints: s.knowledge,
          risks: s.risk,
        },
      });
      setInsight(ai.result as AiInsight);
    } catch {
      setInsight({
        summary: `全班共 ${totalSubs} 份答卷、平均得分率 ${avgAll}%，薄弱点集中在「${[...s.knowledge].sort((a, b) => a.mastery - b.mastery)[0]?.name || "综合"}」。`,
        insights: [{ title: "讲评建议", detail: "优先讲解掌握率最低的知识点，并对风险学生分层跟进。", priority: "高" }],
        actions: [],
        risks: s.risk.map((r) => ({ name: r.name, reason: r.point, suggestion: "加入本周跟进" })),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="学情分析"
      actions={
        <button className="primary small" onClick={() => s.openModal("report")}>
          生成报告
        </button>
      }
    >
      {/* 全班总览（自适应 KPI 卡） */}
      <div className="analytics-kpis">
        <div className="analytics-kpi"><span>学生</span><strong>{studentCount}</strong><em>可见班级学生数</em></div>
        <div className="analytics-kpi"><span>测验场次</span><strong>{tests.length}</strong><em>有答卷的试卷</em></div>
        <div className="analytics-kpi"><span>答卷份数</span><strong>{totalSubs}</strong><em>累计提交</em></div>
        <div className="analytics-kpi"><span>平均得分率</span><strong>{avgAll}%</strong><em>全部答卷</em></div>
        <div className={`analytics-kpi ${passAll < 60 ? "warn" : ""}`}><span>及格率</span><strong>{passAll}%</strong><em>≥60% 视为及格</em></div>
      </div>

      {/* AI 学情问答 */}
      <div style={{ marginTop: 12 }}>
        <AiComposer
          onSubmit={analyzeClass}
          busy={loading}
          placeholder="问一句班级学情，如：这次作业哪些学生需要重点辅导 / 哪些知识点最薄弱怎么讲评"
          hint="AI 学情分析 · 基于本班真实作答数据，回车发送"
        />
        <div className="ai-sample-chips">
          {SAMPLE_QUESTIONS.map((q) => (
            <button key={q} disabled={loading} onClick={() => analyzeClass(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {insight && (
        <div className="ai-insight" style={{ marginTop: 12 }}>
          <p className="ai-insight-summary">🤖 {insight.summary}</p>
          {insight.insights?.map((it, i) => (
            <div key={i} className="ai-insight-item"><b>{it.title}</b><span>{it.detail}</span></div>
          ))}
          {!!insight.risks?.length && (
            <div className="ai-insight-risks">
              {insight.risks.map((r, i) => <div key={i}>⚠️ {r.name}：{r.suggestion}</div>)}
            </div>
          )}
        </div>
      )}

      {/* 各测验汇总 */}
      <article className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <div><p>各测验</p><h2>成绩汇总</h2></div>
          <span className="muted">共 {tests.length} 场</span>
        </div>
        {tests.length ? (
          <div className="table-scroll">
          <table className="compact-table">
            <thead>
              <tr>
                <th>测验 / 试卷</th><th>参与</th><th>平均得分率</th><th>及格率</th><th>最高</th><th>最低</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.paperId} className={selectedPaperId === t.paperId ? "row-active" : ""}>
                  <td>{t.title}</td>
                  <td>{t.count}</td>
                  <td><span className={`status-pill ${t.avg >= 60 ? "ok" : "warn"}`}>{t.avg}%</span></td>
                  <td>{t.pass}%</td>
                  <td>{t.best}%</td>
                  <td>{t.worst}%</td>
                  <td className="table-actions">
                    <button
                      className="ghost small"
                      onClick={() =>
                        setSelectedPaperId((cur) => (cur === t.paperId ? null : t.paperId))
                      }
                    >
                      {selectedPaperId === t.paperId ? "收起" : "下钻"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="empty-state">暂无答卷数据</div>
        )}
      </article>

      {/* 下钻明细：分数段分布 + 学生排名 */}
      <div className="analytics-2col" style={{ marginTop: 12 }}>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p>分数段分布</p>
              <h2>{selected ? selected.title : "全部答卷"}</h2>
            </div>
          </div>
          {drillPcts.length ? <EChart option={distOption(drillPcts)} height={220} /> : <div className="empty-state">暂无答卷数据</div>}
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p>学生成绩</p>
              <h2>{selected ? `${selected.title} · 排名` : "全部答卷排名"}</h2>
            </div>
          </div>
          {ranking.length ? (
            <div className="table-scroll analytics-rank">
            <table className="compact-table modern-table">
              <thead><tr><th>学生</th>{!selected && <th>试卷</th>}<th>得分率</th><th>得分</th></tr></thead>
              <tbody>
                {ranking.map((x) => (
                  <tr key={x.id}>
                    <td>{x.name}</td>
                    {!selected && <td>{x.paper}</td>}
                    <td><span className={`status-pill ${x.pct >= 60 ? "ok" : "warn"}`}>{x.pct}%</span></td>
                    <td>{x.score}/{x.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <div className="empty-state">还没有学生交卷</div>
          )}
        </article>

        <article className="panel">
          <div className="panel-head"><div><p>知识点掌握</p><h2>Top 薄弱点</h2></div></div>
          <EChart option={knowledgeBarOption(s.knowledge)} height={180} />
          <div className="info-list">
            {s.knowledge.map((item) => (
              <div className="info-row" key={item.name}>
                <strong>{item.name}</strong>
                <span>掌握率 {item.mastery}% · {item.count} 题样本</span>
                <button className="ghost small" onClick={() => s.openModal("wrongPractice")}>专项练习</button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head"><div><p>学生风险</p><h2>需重点关注</h2></div></div>
          <div className="risk-list">
            {s.risk.map((item) => (
              <div className="risk-item" key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.point}</span>
                <em>{item.risk}</em>
              </div>
            ))}
          </div>
        </article>
      </div>
    </PageShell>
  );
}
