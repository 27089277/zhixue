import { useStore } from "../../store/useStore";
import PaperLibrary from "./PaperLibrary";
import ExamView from "./ExamView";

// 学生端容器，移植自 legacy student-dock：题库 / 答题两态切换。
export default function StudentDock() {
  const mode = useStore((s) => s.exam.mode);
  const examActive = mode === "exam";

  return (
    <section className="student-dock">
      <div className="tablet">
        <div className={`student-body ${examActive ? "exam-active" : ""}`}>
          <div className="question-main">
            {examActive ? <ExamView /> : <PaperLibrary />}
          </div>
        </div>
      </div>
    </section>
  );
}
