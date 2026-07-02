import { useEffect, useRef, useState } from "react";
import katex from "katex";
import DrawingBoard from "./DrawingBoard";

// 渲染富文本中的 LaTeX：行内 \( ... \)，独立 \[ ... \]
export function renderMath(html = ""): string {
  const render = (tex: string, display: boolean) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: display, throwOnError: false });
    } catch {
      return tex;
    }
  };
  return html
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, tex) => render(tex, true))
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, tex) => render(tex, false));
}

const ALLOWED_TAGS = new Set([
  "B",
  "BR",
  "DIV",
  "EM",
  "I",
  "IMG",
  "LI",
  "OL",
  "P",
  "SPAN",
  "STRONG",
  "SUB",
  "SUP",
  "U",
  "UL",
]);

const ALLOWED_ATTRS = new Set(["alt", "class", "src", "style"]);

export function sanitizeRichText(html = "") {
  if (typeof window === "undefined") return html;
  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("*").forEach((node) => {
    if (!ALLOWED_TAGS.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || !ALLOWED_ATTRS.has(attr.name)) {
        node.removeAttribute(attr.name);
      }
    });
    if (node.tagName === "IMG") {
      const src = node.getAttribute("src") || "";
      if (!src.startsWith("/api/media/") && !src.startsWith("data:image/") && !src.startsWith("http")) {
        node.remove();
        return;
      }
      node.setAttribute("alt", node.getAttribute("alt") || "题目图片");
      node.setAttribute("class", "rich-text-image");
    }
  });

  return template.innerHTML.trim();
}

export function richTextToPlain(html = "") {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ");
  const div = document.createElement("div");
  div.innerHTML = sanitizeRichText(html);
  return (div.textContent || "").replace(/\s+/g, " ").trim();
}

export function isRichTextEmpty(html = "") {
  return !richTextToPlain(html) && !/<img[\s>]/i.test(html);
}

export function HtmlContent({ html, className = "" }: { html?: string; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={`rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: renderMath(sanitizeRichText(html)) }}
    />
  );
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  compact?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  minHeight = 150,
  compact,
  onImageUpload,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);

  async function insertDataUrlImage(dataUrl: string) {
    if (disabled) return;
    setDrawOpen(false);
    let url = dataUrl;
    if (onImageUpload) {
      setUploading(true);
      try {
        const blob = await (await fetch(dataUrl)).blob();
        url = await onImageUpload(new File([blob], "drawing.png", { type: "image/png" }));
      } finally {
        setUploading(false);
      }
    }
    editorRef.current?.focus();
    document.execCommand("insertImage", false, url);
    sync();
  }

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const next = sanitizeRichText(value);
    if (editor.innerHTML !== next) editor.innerHTML = next;
  }, [value]);

  function sync() {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(sanitizeRichText(editor.innerHTML));
  }

  function command(name: string, arg?: string) {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(name, false, arg);
    sync();
  }

  async function insertImage(file: File) {
    if (!onImageUpload || disabled) return;
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      editorRef.current?.focus();
      document.execCommand("insertImage", false, url);
      sync();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className={`rich-editor ${compact ? "compact" : ""} ${disabled ? "disabled" : ""}`}>
      {!disabled && (
        <div className="rich-toolbar" aria-label="富文本工具栏">
          <button type="button" onClick={() => command("bold")}>加粗</button>
          <button type="button" onClick={() => command("underline")}>下划线</button>
          <button type="button" onClick={() => command("insertUnorderedList")}>列表</button>
          <button type="button" onClick={() => command("subscript")}>下标</button>
          <button type="button" onClick={() => command("superscript")}>上标</button>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={!onImageUpload || uploading}>
            {uploading ? "上传中…" : "插入图片"}
          </button>
          <button type="button" onClick={() => setDrawOpen(true)} disabled={uploading}>
            手绘
          </button>
          <button
            type="button"
            onClick={() => {
              const tex = window.prompt("输入 LaTeX 公式（无需写 \\( \\)），如 x^2+\\frac{1}{2}", "");
              if (tex && tex.trim()) command("insertText", ` \\(${tex.trim()}\\) `);
            }}
          >
            公式
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) insertImage(file);
            }}
          />
        </div>
      )}
      <div
        ref={editorRef}
        className="rich-input"
        contentEditable={!disabled}
        data-placeholder={placeholder || "请输入内容"}
        style={{ minHeight }}
        onInput={sync}
        onBlur={sync}
        onPaste={(event) => {
          const image = Array.from(event.clipboardData.files || []).find((file) =>
            file.type.startsWith("image/")
          );
          if (image && onImageUpload) {
            event.preventDefault();
            insertImage(image);
          }
        }}
        suppressContentEditableWarning
      />
      <DrawingBoard open={drawOpen} onCancel={() => setDrawOpen(false)} onDone={insertDataUrlImage} />
    </div>
  );
}
