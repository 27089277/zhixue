import { useState } from "react";
import { useStore } from "../../store/useStore";
import PaperLibrary from "./PaperLibrary";
import RealPapers from "./RealPapers";
import ExamView from "./ExamView";
import MistakesView from "./MistakesView";
import DrillView from "./DrillView";

type StudentView = "library" | "real" | "mistakes" | "drill";

// 学生端容器：作业 · 历史真题 · 自主练习 · 错题本；答题时全屏 ExamView。
export default function StudentDock() {
  const mode = useStore((s) => s.exam.mode);
  const examActive = mode === "exam";
  const [view, setView] = useState<StudentView>("library");

  const tabs: { key: StudentView; label: string }[] = [
    { key: "library", label: "作业" },
    { key: "real", label: "历史真题" },
    { key: "drill", label: "自主练习" },
    { key: "mistakes", label: "错题本" },
  ];

  return (
    <section className="student-dock">
      <div className="tablet">
        {!examActive && (
          <div className="student-tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`student-tab ${view === t.key ? "active" : ""}`}
                onClick={() => setView(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div className={`student-body ${examActive ? "exam-active" : ""}`}>
          <div className="question-main">
            {examActive ? (
              <ExamView />
            ) : view === "mistakes" ? (
              <MistakesView />
            ) : view === "drill" ? (
              <DrillView />
            ) : view === "real" ? (
              <RealPapers />
            ) : (
              <PaperLibrary />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
