import { useState } from "react";
import { ArrowUpOutlined } from "@ant-design/icons";

// 试卷智能搜索框：与手动组卷的 GenAI 输入框同款（圆角框 + 文本域 + 右下角圆形发送）。
export default function PaperSearchBox({
  onSearch,
  busy = false,
  active = false,
  placeholder = "用一句话找试卷，如：物理中考真题 / 二次函数专项（GenAI 语义检索，回车）",
}: {
  onSearch: (query: string) => void;
  busy?: boolean;
  active?: boolean; // 是否处于检索结果态（显示“显示全部”）
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  function submit() {
    if (busy) return;
    onSearch(text.trim());
  }

  return (
    <section className="bank-ai-console">
      <div className={`bank-ai-composer ${busy ? "busy" : ""}`}>
        <textarea
          rows={2}
          placeholder={placeholder}
          value={text}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="bank-ai-composer-foot">
          <span className="composer-status">
            {busy ? (
              <>
                <span className="composer-dot-spin" />
                向量库检索中…
              </>
            ) : active ? (
              <button
                className="link-btn"
                onClick={() => {
                  setText("");
                  onSearch("");
                }}
              >
                ← 显示全部试卷
              </button>
            ) : (
              "回车用 DeepSeek 向量库检索"
            )}
          </span>
          <button
            className="composer-send"
            type="button"
            aria-label="检索"
            title="检索（回车）"
            disabled={busy || !text.trim()}
            onClick={submit}
          >
            <ArrowUpOutlined />
          </button>
        </div>
      </div>
    </section>
  );
}
