import { useStore } from "../../store/useStore";
import { ModalShell } from "./ModalHost";

// 学生考试流程弹窗：考试须知 / 交卷确认 / 交卷结果。
// 移植自 legacy showPaperStart / submitCurrentPaper 确认 / showPaperResult。
export default function ExamFlowModals() {
  const s = useStore();
  const modal = s.activeModal!;
  const paperId = modal.payload?.paperId as string;
  const paper = s.papers.find((p) => p.id === paperId) || s.papers[0];

  if (modal.type === "paperStart") {
    return (
      <ModalShell
        eyebrow="考试须知"
        title={paper.title}
        footer={
          <>
            <button className="ghost" onClick={s.closeModal}>
              取消
            </button>
            <button
              className="primary"
              onClick={() => {
                s.closeModal();
                s.startPaper(paper.id);
              }}
            >
              {paper.progress ? "继续答题" : "开始答题"}
            </button>
          </>
        }
      >
        <div className="exam-brief">
          <div>
            <strong>{paper.questions}</strong>
            <span>题目</span>
          </div>
          <div>
            <strong>{paper.score}</strong>
            <span>总分</span>
          </div>
          <div>
            <strong>{paper.duration}</strong>
            <span>分钟</span>
          </div>
        </div>
        <div className="notice-list">
          <p>答题过程中自动保存，刷新页面后可继续。</p>
          <p>客观题交卷后自动判分，主观题进入老师批改队列。</p>
          <p>支持键盘输入和触屏笔手写；交卷前可通过题卡检查漏题。</p>
        </div>
      </ModalShell>
    );
  }

  if (modal.type === "submitConfirm") {
    const unanswered = modal.payload?.unanswered ?? 0;
    return (
      <ModalShell
        eyebrow="交卷确认"
        title={`还有 ${unanswered} 题未作答`}
        footer={
          <>
            <button className="ghost" onClick={s.closeModal}>
              继续检查
            </button>
            <button
              className="primary"
              onClick={() => {
                s.submitPaper(paper.id);
                s.openModal("paperResult", { paperId: paper.id });
              }}
            >
              确认交卷
            </button>
          </>
        }
      >
        <div className="notice-list">
          <p>交卷后不能继续修改答案。</p>
          <p>客观题将立即判分，主观题会进入老师批改队列。</p>
        </div>
      </ModalShell>
    );
  }

  // paperResult
  const result = s.exam.submitted[paperId];
  if (!result) {
    return (
      <ModalShell
        eyebrow="交卷结果"
        title={paper.title}
        footer={
          <button className="primary" onClick={s.closeModal}>
            关闭
          </button>
        }
      >
        <div className="empty-state">暂无提交记录</div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      eyebrow="交卷结果"
      title={paper.title}
      footer={
        <>
          <button
            className="ghost"
            onClick={() => {
              s.closeModal();
              s.exitPaper();
            }}
          >
            返回试卷库
          </button>
          <button
            className="primary"
            onClick={() => {
              s.closeModal();
              s.startPaper(paperId);
            }}
          >
            查看答题卡
          </button>
        </>
      }
    >
      <div className="result-score">
        <strong>{result.finalScore ?? result.score}</strong>
        <span>
          {result.finalScore !== undefined
            ? `/ ${paper.score} 最终成绩`
            : `/ ${result.objectiveTotal} 客观题得分`}
        </span>
      </div>
      <div className="student-summary">
        <div>
          <strong>{paper.questions - result.unanswered}</strong>
          <span>已作答</span>
        </div>
        <div>
          <strong>{result.unanswered}</strong>
          <span>未作答</span>
        </div>
        <div>
          <strong>{result.pendingManual}</strong>
          <span>{result.pendingManual ? "待老师批改" : "批改完成"}</span>
        </div>
      </div>
      <p className="result-note">
        {result.feedback
          ? `老师评语：${result.feedback}`
          : "客观题已自动判分；主观题批改完成后将生成最终成绩、解析和错题本。"}
      </p>
    </ModalShell>
  );
}
