import { useState } from "react";
import { useStore } from "../../store/useStore";
import PaperLibrary from "./PaperLibrary";
import ExamView from "./ExamView";
import MistakesView from "./MistakesView";
import DrillView from "./DrillView";

type StudentView = "library" | "mistakes" | "drill";

// 学生端容器：题库/作业 · 错题本 · 专题练习（菁优网式）；答题时全屏 ExamView。
export default function StudentDock() {
  const mode = useStore((s) => s.exam.mode);
  const examActive = mode === "exam";
  const [view, setView] = useState<StudentView>("library");

  const tabs: { key: StudentView; label: string }[] = [
    { key: "library", label: "作业 / 试卷" },
    { key: "drill", label: "专题练习" },
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
            ) : (
              <PaperLibrary />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
