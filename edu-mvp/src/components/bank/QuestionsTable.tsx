import { useMemo, useState } from "react";
import { Input, Table, Space, Button, Popconfirm } from "antd";
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
import { HtmlContent, richTextToPlain } from "../common/RichText";
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

  const rows: Row[] = useMemo(() => {
    return visibleQuestions(s)
      .map((q) => ({ ...q, realIndex: s.questions.indexOf(q) }))
      .filter((q) => {
        if (!keyword.trim()) return true;
        const k = keyword.trim().toLowerCase();
        return `${richTextToPlain(q.title)} ${q.point} ${q.source}`.toLowerCase().includes(k);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.questions, s.role, keyword]);

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
    { title: "知识点", dataIndex: "point", key: "point", width: 130 },
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
      <div style={{ padding: "0 16px 16px" }}>
        <Table<Row>
          rowKey="realIndex"
          columns={columns}
          dataSource={rows}
          size="middle"
          pagination={{
            pageSize: 5,
            hideOnSinglePage: false,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20],
            showTotal: (t) => `共 ${t} 题`,
          }}
        />
      </div>
    </article>
  );
}
