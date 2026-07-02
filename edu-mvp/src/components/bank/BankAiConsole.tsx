import { useRef, useState } from "react";
import { ArrowUpOutlined, PaperClipOutlined, CloseCircleFilled } from "@ant-design/icons";
import { useStore } from "../../store/useStore";
import { executeSmartAiRequest } from "../../api/ai";
import { useNotify } from "../../hooks/useNotify";
import type { BankView } from "../../types";

const PLACEHOLDER: Record<BankView, string> = {
  questions: "例如：帮我生成 6 道初三物理欧姆定律中档题，含答案解析，保存到张老师私人库",
  papers:
    "例如：上传试卷文件后描述“导入为整卷”；或“找 2025 大连中考物理真题导入”；或“从题库里组一套二次函数测验”；或“生成一套 45 分钟数学周测卷”",
  videos: "例如：根据 2025 大连中考物理卷第 6 题，生成 8 分钟讲解视频脚本和知识点标签",
};

// AI 控制台：回车发送；papers 视图支持上传试卷文件后描述导入；发送中可点击停止。
export default function BankAiConsole() {
  const bankView = useStore((s) => s.bankView);
  const aiBusy = useStore((s) => s.aiBusy);
  const notify = useNotify();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");
  const ctrlRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allowUpload = bankView === "papers";

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => setFileText(String(reader.result || "").slice(0, 20000));
    reader.onerror = () => {
      setFileText("");
      notify("info", "该文件无法读取文本，将仅按描述导入");
    };
    reader.readAsText(f);
  }
  function clearFile() {
    setFileName("");
    setFileText("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    if (aiBusy) return;
    if (!text.trim() && !fileText) return;
    const controller = new AbortController();
    ctrlRef.current = controller;
    // 模式判定：
    // 视频视图 → 生成视频脚本；
    // 试卷视图 → 始终产出「一套试卷」（有文件走解析导入，提到真题/联网走联网导入，否则 AI 组卷）；
    // 题目视图 → 默认生成题目，但明确说“试卷/组卷/整卷”时也产出整卷。
    const wantsPaper = /试卷|组卷|整卷|套卷|测验卷|考卷|卷子|一套.*卷/.test(text);
    const wantsImport = /真题|联网|网上|上网|从网络/.test(text);
    let finalMode: string;
    if (bankView === "videos") {
      finalMode = "video";
    } else if (bankView === "papers") {
      finalMode = fileText ? "import" : wantsImport ? "web" : "assemble";
    } else {
      finalMode = fileText ? "import" : wantsPaper ? "assemble" : "generate";
    }
    await executeSmartAiRequest(text.trim() || "导入上传的试卷", {
      mode: finalMode,
      rawText: fileText || undefined,
      notify,
      signal: controller.signal,
    });
    setText("");
    clearFile();
  }

  function stop() {
    ctrlRef.current?.abort();
    useStore.getState().setAiBusy(false);
  }

  return (
    <section className="bank-ai-console">
      <div className={`bank-ai-composer ${aiBusy ? "busy" : ""}`} data-ai-ready="true">
        <textarea
          rows={3}
          placeholder={aiBusy ? "AI 正在处理，请稍候…" : PLACEHOLDER[bankView]}
          value={text}
          disabled={aiBusy}
          readOnly={aiBusy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />

        {allowUpload && fileName && (
          <div className="composer-file">
            <PaperClipOutlined />
            <span>{fileName}</span>
            <CloseCircleFilled onClick={clearFile} />
          </div>
        )}

        <div className="bank-ai-composer-foot">
          <div className="composer-left">
            {allowUpload && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  accept=".txt,.md,.csv,.json,.doc,.docx,.pdf"
                  onChange={onPickFile}
                />
                <button
                  type="button"
                  className="composer-attach"
                  title="上传试卷文件"
                  disabled={aiBusy}
                  onClick={() => fileRef.current?.click()}
                >
                  <PaperClipOutlined /> 上传试卷
                </button>
              </>
            )}
            {aiBusy && (
              <span className="composer-status">
                <span className="composer-dot-spin" />
                AI 正在生成…
              </span>
            )}
          </div>
          {aiBusy ? (
            <button
              className="composer-send composer-stop"
              type="button"
              aria-label="停止"
              title="停止生成"
              onClick={stop}
            >
              <span className="composer-spinner" />
              <span className="composer-stop-square" />
            </button>
          ) : (
            <button
              className="composer-send"
              type="button"
              aria-label="发送给 AI"
              title="发送（回车）"
              disabled={!text.trim() && !fileText}
              onClick={submit}
            >
              <ArrowUpOutlined />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
