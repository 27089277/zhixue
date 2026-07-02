import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import BankAiConsole from "../components/bank/BankAiConsole";
import QuestionsTable from "../components/bank/QuestionsTable";
import PapersPanel from "../components/bank/PapersPanel";
import { useStore } from "../store/useStore";
import type { BankView } from "../types";

// 题库管理：题目 / 试卷 两个子视图。
export default function Bank() {
  const s = useStore();
  const { view: viewParam } = useParams();

  const view = (viewParam as BankView) || "questions";
  // URL → store.bankView 同步。
  useEffect(() => {
    if (s.bankView !== view) s.setBankView(view);
  }, [view, s]);

  return (
    <PageShell>
      <div className="bank-module">
        <div className="bank-page single">
          {/* AI 控制台：题目=生成/导入；试卷=找真题导入/AI 组卷/上传试卷解析 */}
          <BankAiConsole />
          {view !== "papers" && <QuestionsTable />}
          {view === "papers" && <PapersPanel />}
        </div>
      </div>
    </PageShell>
  );
}
