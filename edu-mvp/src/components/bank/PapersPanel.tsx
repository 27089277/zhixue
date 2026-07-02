import { useMemo, useState } from "react";
import { Popconfirm } from "antd";
import { useStore } from "../../store/useStore";
import PaperSearchBox from "./PaperSearchBox";
import {
  bankAssetScopeText,
  canOperateBankAsset,
  canShareBankAsset,
  canViewBankAsset,
} from "../../store/permissions";
import { aiPost } from "../../api/client";
import { useNotify } from "../../hooks/useNotify";

const PAGE = 8;

// 试卷库：搜索 + GenAI 语义检索（向量库）+ 可见范围 + 加载更多分页。
export default function PapersPanel() {
  const s = useStore();
  const notify = useNotify();
  const [keyword, setKeyword] = useState("");
  const [aiIds, setAiIds] = useState<Set<string> | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const visiblePapers = useMemo(
    () => s.papers.filter((p) => canViewBankAsset(s, p)),
    [s]
  );

  const filtered = useMemo(() => {
    let list = visiblePapers;
    if (aiIds) {
      list = list.filter((p) => aiIds.has(p.id));
    } else if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      list = list.filter((p) =>
        `${p.title} ${p.subject} ${p.region} ${p.exam} ${p.tags.join(" ")}`
          .toLowerCase()
          .includes(k)
      );
    }
    return list;
  }, [visiblePapers, keyword, aiIds]);

  const shown = filtered.slice(0, limit);

  // 智能搜索：先走向量库语义检索（GenAI），无命中/失败则本地关键词过滤。
  async function smartSearch(q: string) {
    const query = q.trim();
    setLimit(PAGE);
    if (!query) {
      setAiIds(null);
      setKeyword("");
      return;
    }
    setAiBusy(true);
    try {
      const ai = await aiPost("/ai/search-papers", { query, k: 30 });
      const ids: string[] = (ai?.result?.ids || []).map(String);
      const known = ids.filter((id) => visiblePapers.some((p) => p.id === id));
      if (known.length) {
        setAiIds(new Set(known));
        setKeyword("");
        notify("success", `向量库检索到 ${known.length} 套相关试卷`);
        return;
      }
    } catch {
      /* 走本地兜底 */
    } finally {
      setAiBusy(false);
    }
    // 兜底：关键词过滤
    setAiIds(null);
    setKeyword(query);
  }

  return (
    <article className="panel bank-paper-panel">
      <PaperSearchBox onSearch={smartSearch} busy={aiBusy} active={!!aiIds} />
      <div className="paper-lib-toolbar">
        <span className="muted">共 {filtered.length} 套</span>
      </div>

      <div className="paper-asset-grid">
        {shown.length === 0 && <div className="empty-state">没有符合条件的试卷</div>}
        {shown.map((paper) => (
          <article className="paper-asset-card" key={paper.id}>
            <div className="pac-badges">
              <span className="pac-badge exam">{paper.exam}</span>
              <span className="pac-badge">{paper.subject}</span>
              {paper.stage && (
                <span className="pac-badge soft">
                  {paper.stage}
                  {paper.grade || ""}
                </span>
              )}
            </div>
            <strong className="pac-title">{paper.title}</strong>
            <div className="pac-meta">
              <span>{paper.region}</span>
              <span>{paper.year}</span>
              <span>{paper.questions} 题</span>
              <span>{paper.score} 分</span>
              <span>{paper.duration} 分钟</span>
            </div>
            <div className="pac-scope">{bankAssetScopeText(s, paper)}</div>
            <div className="pac-sections">{paper.sections.join(" / ")}</div>
            <footer className="pac-footer">
              <div className="pac-secondary-actions">
                <button className="ghost small" onClick={() => s.openModal("paperDetail", paper)}>
                  查看
                </button>
                {canOperateBankAsset(s, paper) && (
                  <button className="ghost small" onClick={() => s.openModal("paperCreator", paper)}>
                    编辑
                  </button>
                )}
                {canShareBankAsset(s, paper) && (
                  <button
                    className="ghost small"
                    onClick={() =>
                      s.openModal("bankAccess", { assetType: "paper", index: paper.id, asset: paper })
                    }
                  >
                    可见范围
                  </button>
                )}
                {canOperateBankAsset(s, paper) && (
                  <Popconfirm
                    title="确认删除这套试卷？"
                    description="删除后不可恢复。"
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => {
                      s.deletePaper(paper.id);
                      notify("success", "试卷已删除");
                    }}
                  >
                    <button className="ghost small danger-text">删除</button>
                  </Popconfirm>
                )}
              </div>
              <button
                className="primary small pac-publish"
                onClick={() => {
                  s.setActivePaper(paper.id);
                  s.switchSection("homework");
                }}
              >
                发布
              </button>
            </footer>
          </article>
        ))}
      </div>

      {shown.length < filtered.length && (
        <div className="paper-lib-more">
          <button className="ghost" onClick={() => setLimit((n) => n + PAGE)}>
            加载更多（还有 {filtered.length - shown.length} 套）
          </button>
        </div>
      )}
    </article>
  );
}
