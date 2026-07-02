import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore";
import { ModalShell } from "./ModalHost";
import { useNotify } from "../../hooks/useNotify";
import { aiSceneNames, fetchAiInsight, type AiInsight } from "../../api/ai";
import { aiPost } from "../../api/client";
import type { StudentDetail } from "../../types";

// 信息型弹窗集合：AI 分析、通知、学生画像、安全/审计/存储等。
export default function InfoModals() {
  const s = useStore();
  const notify = useNotify();
  const { type, payload } = s.activeModal!;
  const close = s.closeModal;

  const closeFooter = (
    <button className="primary" onClick={close}>
      关闭
    </button>
  );

  if (type === "aiInsight") return <AiInsightModal scene={payload?.scene || "workspace"} />;

  if (type === "videoPreview") {
    return (
      <ModalShell eyebrow="讲解视频" title={payload?.title || "讲解视频"} footer={closeFooter}>
        {payload?.url ? (
          <video
            src={payload.url}
            controls
            autoPlay
            preload="metadata"
            style={{ width: "100%", maxHeight: 420, borderRadius: 8, background: "#000" }}
          />
        ) : (
          <div className="empty-state">
            该讲解视频仅记录了文件名「{payload?.name || "未命名"}」，未提供可播放链接。
            <br />
            请在题目编辑里粘贴视频链接或上传小视频文件。
          </div>
        )}
      </ModalShell>
    );
  }

  if (type === "studentDetail") {
    return <StudentDetailModal stu={payload as StudentDetail} />;
  }

  if (type === "notifications") {
    return (
      <ModalShell
        eyebrow="消息中心"
        title="待处理通知"
        footer={
          <button
            className="primary"
            onClick={() => {
              notify("success", "全部已标为已读");
              close();
            }}
          >
            全部标为已读
          </button>
        }
      >
        <div className="timeline">
          <div className="timeline-item">
            <time>作业</time>
            <div>
              <strong>王子涵待提交</strong>
              <p className="muted">初三(1)班大连中考物理真题练习，建议课前提醒。</p>
            </div>
          </div>
          <div className="timeline-item">
            <time>题库</time>
            <div>
              <strong>28 道题待审核</strong>
              <p className="muted">包含中考真题标签补全和解析审核。</p>
            </div>
          </div>
          <div className="timeline-item">
            <time>视频</time>
            <div>
              <strong>2 个视频转码完成</strong>
              <p className="muted">可以关联作业和题目后发布给班级。</p>
            </div>
          </div>
        </div>
      </ModalShell>
    );
  }

  const STATIC: Record<string, { eyebrow: string; title: string; rows: [string, string][] }> = {
    wrongPractice: {
      eyebrow: "错题巩固",
      title: "自动生成错题练习",
      rows: [
        ["相似三角形", "3 道错题 · 推荐 6 道同类题"],
        ["二次函数", "2 道错题 · 推荐讲题视频 1 个"],
        ["计算规范", "老师批注 2 条 · 建议重写过程"],
      ],
    },
    videoLearning: {
      eyebrow: "视频学习",
      title: "老师推荐讲题视频",
      rows: [
        ["二次函数压轴题讲解", "12 分钟 · 已看 40%"],
        ["相似三角形判定", "8 分钟 · 未开始"],
        ["错题讲评：第 12 题", "5 分钟 · 关联当前作业"],
      ],
    },
    reply: {
      eyebrow: "视频答疑",
      title: "回复学生问题",
      rows: [
        ["学生问题", "第 3 分钟这里为什么要先看判别式？"],
        ["建议回复", "先看判别式可直接判断根的情况，可回看 02:48。"],
      ],
    },
    security: {
      eyebrow: "安全策略",
      title: "登录与账号安全配置",
      rows: [
        ["验证码有效期", "10 分钟 · 60 秒重发"],
        ["密码策略", "最少 8 位 · 5 次错误锁定 30 分钟"],
        ["二次验证", "管理员异地登录需短信验证"],
      ],
    },
    audit: {
      eyebrow: "审计日志",
      title: "登录与权限操作日志",
      rows: [
        ["今天 10:12 · 赵管理员", "修改教师权限 · 成功"],
        ["今天 09:44 · 张老师", "验证码登录 · 成功"],
        ["昨天 18:20 · 张老师", "智能搜索导入试卷 · 成功"],
      ],
    },
    storage: {
      eyebrow: "存储配置",
      title: "视频、图片、手写附件存储",
      rows: [
        ["对象存储", "MinIO 私有化"],
        ["视频转码", "720p + 1080p"],
        ["附件保留", "随课程保留 / 180 天"],
      ],
    },
    import: {
      eyebrow: "批量导入",
      title: "导入题目、学生或组织数据",
      rows: [
        ["导入类型", "题库 Excel / 学生名单 / 试卷 Word·PDF"],
        ["导入策略", "新增并提交审核"],
        ["校验规则", "查重 · 答案完整性 · 知识点匹配"],
      ],
    },
    search: {
      eyebrow: "全局搜索",
      title: `搜索：${payload?.keyword || "全部"}`,
      rows: [
        ["学生", "王子涵 / 初三(1)班 / 正确率 72%"],
        ["题目", "欧姆定律计算 / 2025 大连中考真题"],
        ["视频", "电学计算真题讲解 / 已关联 1 套作业"],
      ],
    },
    studentReport: {
      eyebrow: "学生端报告",
      title: "本次作业报告",
      rows: [
        ["客观题", "已自动判分"],
        ["主观题", "等待老师批改"],
        ["薄弱点", "欧姆定律、实验表达"],
      ],
    },
  };

  const cfg = STATIC[type];
  if (cfg) {
    return (
      <ModalShell eyebrow={cfg.eyebrow} title={cfg.title} footer={closeFooter}>
        <div className="info-list">
          {cfg.rows.map(([t, d]) => (
            <div className="info-row" key={t}>
              <strong>{t}</strong>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </ModalShell>
    );
  }

  // 兜底
  return (
    <ModalShell eyebrow="提示" title="功能预览" footer={closeFooter}>
      <div className="empty-state">该功能为原型占位。</div>
    </ModalShell>
  );
}

function StudentDetailModal({ stu }: { stu: StudentDetail }) {
  const s = useStore();
  const close = s.closeModal;
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(false);

  // 该生最近的答卷成绩（来自教师侧全量 submissions，按学生手机号/姓名匹配）
  const records = s.submissions
    .filter((sub) =>
      stu.phone ? sub.studentPhone === stu.phone : sub.studentName === stu.name
    )
    .map((sub) => ({ paper: s.papers.find((p) => p.id === sub.paperId), r: sub }))
    .sort((a, b) => (b.r.submittedAt || 0) - (a.r.submittedAt || 0));

  async function analyze() {
    setLoading(true);
    try {
      const ctx = {
        name: stu.name,
        className: stu.className,
        recentScore: stu.score,
        completion: stu.completion,
        weakPoint: stu.weakPoint,
        risk: stu.risk,
        exams: records.map((x) => ({
          paper: x.paper?.title ?? x.r.paperId,
          score: x.r.finalScore ?? x.r.score,
          total: x.paper?.score ?? x.r.objectiveTotal,
          unanswered: x.r.unanswered,
        })),
      };
      const ai = await aiPost("/ai/analyze", {
        scene: "学生学情画像",
        question: `分析学生「${stu.name}」的学习情况，指出薄弱知识点、进步/风险，并给出可执行的分层练习与跟进建议。`,
        context: ctx,
      });
      setInsight(ai.result as AiInsight);
    } catch {
      setInsight(mockStudentInsight(stu));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell
      eyebrow="学生画像"
      title={`${stu.name} · ${stu.className}`}
      footer={<button className="primary" onClick={close}>关闭</button>}
    >
      <div className="metric-row">
        <div><strong>{stu.score}</strong><span>最近成绩</span></div>
        <div><strong>{stu.completion}%</strong><span>作业完成率</span></div>
        <div><strong>{stu.risk}</strong><span>风险等级</span></div>
        <div><strong>{stu.account}</strong><span>账号状态</span></div>
      </div>

      <div className="info-list">
        <div className="info-row"><strong>手机号</strong><span>{stu.phone}</span></div>
        <div className="info-row"><strong>家长电话</strong><span>{stu.parentPhone}</span></div>
        <div className="info-row"><strong>薄弱点</strong><span>{stu.weakPoint}</span></div>
        <div className="info-row"><strong>最近登录</strong><span>{stu.lastLogin}</span></div>
      </div>

      <div className="panel-head" style={{ padding: "6px 0 0" }}>
        <div><p>近期答卷</p><h2 style={{ fontSize: 16 }}>考试与练习成绩</h2></div>
      </div>
      {records.length ? (
        <table className="compact-table">
          <thead><tr><th>试卷</th><th>得分</th><th>满分</th><th>未答</th><th>状态</th></tr></thead>
          <tbody>
            {records.map((x) => (
              <tr key={x.r.id}>
                <td>{x.paper?.title ?? x.r.paperId}</td>
                <td><strong>{x.r.finalScore ?? x.r.score}</strong></td>
                <td>{x.paper?.score ?? x.r.objectiveTotal}</td>
                <td>{x.r.unanswered}</td>
                <td>{!x.r.gradedAt ? "待批改" : x.r.returned ? "已退回" : "已批改"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">暂无答卷记录</div>
      )}

      <div className="ai-analyze-block">
        <button className="primary small" onClick={analyze} disabled={loading}>
          {loading ? "DeepSeek 分析中…" : "AI 学情分析"}
        </button>
        {insight && (
          <div className="ai-insight">
            <p className="ai-insight-summary">{insight.summary}</p>
            {insight.insights?.map((it, i) => (
              <div key={i} className="ai-insight-item">
                <b>{it.title}</b>
                <span>{it.detail}</span>
              </div>
            ))}
            {!!insight.risks?.length && (
              <div className="ai-insight-risks">
                {insight.risks.map((r, i) => (
                  <div key={i}>⚠️ {r.name}：{r.suggestion}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function mockStudentInsight(stu: StudentDetail): AiInsight {
  return {
    summary: `${stu.name} 当前薄弱点为「${stu.weakPoint || "综合应用"}」，建议分层跟进。`,
    insights: [
      { title: "重点建议", detail: `针对「${stu.weakPoint || "薄弱知识点"}」推送 5-8 道分层练习。`, priority: "高" },
      { title: "补充观察", detail: "关注主观题书写规范，安排一次讲评。", priority: "中" },
    ],
    actions: [],
    risks: stu.risk && stu.risk !== "正常" ? [{ name: stu.risk, reason: "近期成绩波动", suggestion: "加入本周跟进名单" }] : [],
  };
}

function AiInsightModal({ scene }: { scene: string }) {
  const s = useStore();
  const [data, setData] = useState<AiInsight | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAiInsight(scene).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [scene]);

  return (
    <ModalShell
      eyebrow="AI 分析"
      title={`${aiSceneNames[scene] || "当前页面"} · 智能建议`}
      footer={
        <button className="primary" onClick={s.closeModal}>
          保存 AI 建议
        </button>
      }
    >
      {!data ? (
        <div className="empty-state">AI 正在整理当前模块建议…</div>
      ) : (
        <div className="ai-insight-view">
          <div className="ai-summary">
            <span>结论</span>
            <strong>{data.summary}</strong>
          </div>
          <div className="ai-insight-grid">
            {data.insights.map((item, i) => (
              <article key={i}>
                <b>{item.priority || "中"}</b>
                <strong>{item.title || "建议"}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="profile-content-grid">
            <section className="profile-section">
              <div className="profile-section-head">
                <span>建议动作</span>
                <strong>下一步可以做什么</strong>
              </div>
              <div className="info-list">
                {data.actions.map((item, i) => (
                  <div className="info-row" key={i}>
                    <strong>{item.label}</strong>
                    <span>{item.reason}</span>
                    <button
                      className="ghost small"
                      onClick={() => {
                        s.closeModal();
                        s.switchSection((item.target_module as any) || "workspace");
                      }}
                    >
                      前往
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section className="profile-section">
              <div className="profile-section-head">
                <span>风险提示</span>
                <strong>需要人工确认</strong>
              </div>
              <div className="info-list">
                {data.risks.map((item, i) => (
                  <div className="info-row" key={i}>
                    <strong>{item.name}</strong>
                    <span>
                      {item.reason} · {item.suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
