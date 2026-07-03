import { useMemo, useState } from "react";
import { Input, Table, Space, Button, Popconfirm, Tree, Tag, Modal, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useStore } from "../../store/useStore";
import {
  bankAssetScopeText,
  canOperateBankAsset,
  canShareBankAsset,
  currentProfile,
  questionStatus,
  visibleQuestions,
} from "../../store/permissions";
import { useNotify } from "../../hooks/useNotify";
import { aiPost } from "../../api/client";
import { HtmlContent, richTextToPlain } from "../common/RichText";
import { difficultyStars, starText, difficultyLabel } from "../../lib/difficulty";
import type { Question } from "../../types";

interface Row extends Question {
  realIndex: number;
}

// 题目库表格：AntD Table（列筛选）+ 回车搜索。
export default function QuestionsTable() {
  const s = useStore();
  const notify = useNotify();
  const profileName = currentProfile(s).name;
  const [keyword, setKeyword] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  // 相似题弹窗
  const [simOpen, setSimOpen] = useState(false);
  const [simBusy, setSimBusy] = useState(false);
  const [simBase, setSimBase] = useState<Question | null>(null);
  const [simList, setSimList] = useState<Question[]>([]);

  async function showSimilar(q: Row) {
    setSimBase(q);
    setSimOpen(true);
    setSimBusy(true);
    setSimList([]);
    try {
      const ai = await aiPost("/ai/search-questions", {
        query: `${richTextToPlain(q.title)} ${q.point || ""}`.trim(),
        k: 10,
      });
      const ids: string[] = (ai?.result?.ids || []).map(String);
      let list = s.questions.filter(
        (x) => x.id != null && ids.includes(String(x.id)) && x !== q
      );
      // 向量库无结果时兜底：同知识点其它题
      if (!list.length) {
        list = s.questions.filter((x) => x !== q && x.point && x.point === q.point).slice(0, 8);
      }
      setSimList(list.slice(0, 8));
    } catch {
      setSimList(s.questions.filter((x) => x !== q && x.point === q.point).slice(0, 8));
    } finally {
      setSimBusy(false);
    }
  }

  // 知识点体系树（菁优网式）：学科 → 知识点(题数)
  const knowledgeTree = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    visibleQuestions(s).forEach((q) => {
      const subj = q.subject || "综合";
      const pt = q.point || "未分类";
      if (!map.has(subj)) map.set(subj, new Map());
      const m = map.get(subj)!;
      m.set(pt, (m.get(pt) || 0) + 1);
    });
    return [...map.entries()].map(([subj, pts]) => ({
      title: subj,
      key: `subj::${subj}`,
      selectable: false,
      children: [...pts.entries()].map(([pt, n]) => ({
        title: `${pt}（${n}）`,
        key: `pt::${pt}`,
      })),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.questions, s.role]);

  const rows: Row[] = useMemo(() => {
    return visibleQuestions(s)
      .map((q) => ({ ...q, realIndex: s.questions.indexOf(q) }))
      .filter((q) => {
        if (selectedPoint && q.point !== selectedPoint) return false;
        if (!keyword.trim()) return true;
        const k = keyword.trim().toLowerCase();
        return `${richTextToPlain(q.title)} ${q.point} ${q.source}`.toLowerCase().includes(k);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.questions, s.role, keyword, selectedPoint]);

  function scopeCategory(r: Row): "public" | "mine" | "shared" {
    if (r.visibility !== "teacher") return "public";
    return r.owner === profileName ? "mine" : "shared";
  }

  const sources = Array.from(new Set(rows.map((r) => r.source).filter(Boolean)));

  const columns: ColumnsType<Row> = [
    {
      title: "题目",
      dataIndex: "title",
      key: "title",
      width: 320,
      render: (_, r) => (
        <div className="question-title-cell">
          <div className="question-title-rich">
            <HtmlContent html={r.title} />
            {(r.videoUrl || r.videoName) && (
              <button
                type="button"
                className="q-video-flag"
                title="预览讲解视频"
                onClick={(e) => {
                  e.stopPropagation();
                  s.openModal("videoPreview", {
                    url: r.videoUrl,
                    name: r.videoName,
                    title: richTextToPlain(r.title),
                  });
                }}
              >
                🎬 讲解视频
              </button>
            )}
          </div>
          <span>
            {r.origin || "题目"} · {r.source || "未标注来源"} · {bankAssetScopeText(s, r)}
          </span>
        </div>
      ),
    },
    {
      title: "题型",
      dataIndex: "type",
      key: "type",
      width: 110,
      filters: [
        { text: "单选题", value: "单选题" },
        { text: "多选题", value: "多选题" },
        { text: "填空题", value: "填空题" },
        { text: "解答题", value: "解答题" },
      ],
      onFilter: (v, r) => r.type === v,
      render: (t) => <span className="type-pill">{t}</span>,
    },
    { title: "知识点", dataIndex: "point", key: "point", width: 120 },
    {
      title: "难度",
      key: "difficulty",
      width: 110,
      render: (_, r) => (
        <span title={difficultyLabel(r.difficulty)} style={{ color: "#f5a623", letterSpacing: 1 }}>
          {starText(difficultyStars(r.difficulty))}
        </span>
      ),
    },
    {
      title: "库",
      key: "scope",
      width: 220,
      filters: [
        { text: "公共库", value: "public" },
        { text: "我的私人库", value: "mine" },
        { text: "共享给我", value: "shared" },
      ],
      onFilter: (v, r) => scopeCategory(r) === v,
      render: (_, r) => bankAssetScopeText(s, r),
    },
    {
      title: "来源",
      dataIndex: "source",
      key: "source",
      width: 170,
      filters: sources.map((src) => ({ text: src, value: src })),
      onFilter: (v, r) => r.source === v,
    },
    {
      title: "状态",
      key: "status",
      width: 120,
      filters: [
        { text: "公共可用", value: "公共可用" },
        { text: "教师可见", value: "教师可见" },
        { text: "仅自己", value: "仅自己" },
        { text: "已共享", value: "已共享" },
        { text: "共享给我", value: "共享给我" },
        { text: "学生可练", value: "学生可练" },
      ],
      onFilter: (v, r) => questionStatus(s, r) === v,
      render: (_, r) => (
        <span className={`bank-status ${r.visibility}`}>{questionStatus(s, r)}</span>
      ),
    },
    {
      title: "操作",
      key: "op",
      width: 200,
      render: (_, r) => {
        const editable = canOperateBankAsset(s, r);
        return (
          <Space size={4}>
            <Button
              size="small"
              type="text"
              onClick={() => s.openModal("question", { ...r, index: r.realIndex })}
            >
              {editable ? "编辑" : "查看"}
            </Button>
            <Button size="small" type="text" onClick={() => showSimilar(r)}>
              相似题
            </Button>
            {canShareBankAsset(s, r) && (
              <Button
                size="small"
                type="text"
                onClick={() =>
                  s.openModal("bankAccess", {
                    assetType: "question",
                    index: r.realIndex,
                    asset: r,
                  })
                }
              >
                可见范围
              </Button>
            )}
            {editable && r.owner === profileName && (
              <Popconfirm
                title="确认删除这道题？"
                description="删除后不可恢复。"
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={() => {
                  s.deleteQuestion(r.realIndex);
                  notify("success", "题目已删除");
                }}
              >
                <Button size="small" type="text" danger>
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <article className="panel bank-main">
      <div className="bank-panel-head">
        <div>
          <p>题目库</p>
          <h2>题目来源必须清楚：手写、AI 生成或来自某套试卷</h2>
        </div>
        <button className="primary small" onClick={() => s.openModal("question")}>
          自己编写题目
        </button>
      </div>
      <div style={{ padding: "4px 16px 12px" }}>
        <Input.Search
          allowClear
          placeholder="搜索题干、知识点、来源（回车搜索）"
          onSearch={(v) => setKeyword(v)}
          style={{ maxWidth: 360 }}
        />
      </div>
      <div className="bank-kp-layout" style={{ display: "flex", gap: 12, padding: "0 16px 16px", alignItems: "flex-start" }}>
        {/* 知识点体系树（菁优网式）*/}
        <div className="kp-tree" style={{ width: 230, flexShrink: 0 }}>
          <div className="kp-tree-head">知识点体系</div>
          {knowledgeTree.length ? (
            <Tree
              treeData={knowledgeTree}
              defaultExpandAll
              blockNode
              selectedKeys={selectedPoint ? [`pt::${selectedPoint}`] : []}
              onSelect={(keys) => {
                const k = String(keys[0] || "");
                setSelectedPoint(k.startsWith("pt::") ? k.slice(4) : null);
              }}
            />
          ) : (
            <div style={{ color: "#8a978f", fontSize: 12, padding: 8 }}>暂无题目</div>
          )}
          {selectedPoint && (
            <Tag
              closable
              color="green"
              style={{ marginTop: 8 }}
              onClose={() => setSelectedPoint(null)}
            >
              {selectedPoint}
            </Tag>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Table<Row>
            rowKey="realIndex"
            columns={columns}
            dataSource={rows}
            size="middle"
            scroll={{ x: 1180 }}
            pagination={{
              pageSize: 5,
              hideOnSinglePage: false,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20],
              showTotal: (t) => `共 ${t} 题`,
            }}
          />
        </div>
      </div>

      <Modal
        title={`相似题推荐${simBase ? " · " + (simBase.point || "") : ""}`}
        open={simOpen}
        onCancel={() => setSimOpen(false)}
        footer={null}
        width={640}
      >
        {simBusy ? (
          <div style={{ textAlign: "center", padding: 32 }}><Spin /> 向量库检索中…</div>
        ) : simList.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {simList.map((q, i) => (
              <div key={q.id ?? i} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ color: "#8a978f", fontSize: 12 }}>{q.type} · {q.point}</span>
                  <span style={{ color: "#f5a623", fontSize: 12 }}>{starText(difficultyStars(q.difficulty))}</span>
                </div>
                <HtmlContent html={q.title} />
                <Button
                  size="small"
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => {
                    setSimOpen(false);
                    s.openModal("question", { ...q, index: s.questions.indexOf(q) });
                  }}
                >
                  查看
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">未找到相似题（题库题目较少时可先多生成一些）</div>
        )}
      </Modal>
    </article>
  );
}
