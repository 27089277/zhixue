import { useState } from "react";
import { ArrowUpOutlined } from "@ant-design/icons";

// 通用 AI 输入框：与试卷 GenAI 同款 composer 样式（圆角框 + 文本域 + 右下角圆形发送）。
export default function AiComposer({
  onSubmit,
  busy = false,
  placeholder = "问一句…",
  hint = "回车发送给 DeepSeek",
  rows = 2,
}: {
  onSubmit: (query: string) => void;
  busy?: boolean;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  const [text, setText] = useState("");
  function submit() {
    if (busy || !text.trim()) return;
    onSubmit(text.trim());
  }
  return (
    <section className="bank-ai-console">
      <div className={`bank-ai-composer ${busy ? "busy" : ""}`}>
        <textarea
          rows={rows}
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
                DeepSeek 分析中…
              </>
            ) : (
              hint
            )}
          </span>
          <button
            className="composer-send"
            type="button"
            aria-label="发送"
            title="发送（回车）"
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
