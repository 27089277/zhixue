import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// 手写画布组件，移植自 legacy setupCanvas：PointerEvent 绘制、DPI 缩放、
// 画笔/橡皮/网格/颜色、最多 18 步撤销、清空，批改卡预置批注 / 学生卡提示。
type Variant = "grading" | "student";

export interface HandwritingHandle {
  getPng: () => string; // 导出为 PNG data URL（白底）
  isBlank: () => boolean;
}

interface Props {
  variant: Variant;
  width?: number;
  height?: number;
  answerMode?: boolean; // 学生作答：白底、无示例文字，用于导出成答案图片
  initialUrl?: string; // 载入历史作答图片
}

const SWATCHES: Record<Variant, { color: string; label?: string }[]> = {
  grading: [
    { color: "#e3342f" },
    { color: "#2364d2" },
    { color: "#0c8a5b" },
  ],
  student: [
    { color: "#111827" },
    { color: "#2364d2" },
    { color: "#0c8a5b" },
  ],
};

const HandwritingCanvas = forwardRef<HandwritingHandle, Props>(function HandwritingCanvas({
  variant,
  width = variant === "grading" ? 620 : 650,
  height = 360,
  answerMode = false,
  initialUrl,
}: Props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null); // 学生作答底层（批改时锁定，不可编辑）
  // 批改且有学生作答图片时：学生作答固定为底层，老师只在上方透明层批注
  const lockedBg = variant === "grading" && !!initialUrl;
  const historyRef = useRef<ImageData[]>([]);
  const drawingRef = useRef(false);
  const dirtyRef = useRef(false);
  const colorRef = useRef(variant === "grading" ? "#e3342f" : "#111827");
  const toolRef = useRef<"pen" | "eraser">("pen");
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(colorRef.current);
  const [grid, setGrid] = useState(false);

  useImperativeHandle(ref, () => ({
    getPng: () => {
      const draw = canvasRef.current;
      if (!draw) return "";
      // 批改分层：把学生作答底层 + 老师批注层合成后导出（保留学生原作答）
      if (lockedBg && bgRef.current) {
        const out = document.createElement("canvas");
        out.width = draw.width;
        out.height = draw.height;
        const c = out.getContext("2d")!;
        c.fillStyle = "#ffffff";
        c.fillRect(0, 0, out.width, out.height);
        c.drawImage(bgRef.current, 0, 0);
        c.drawImage(draw, 0, 0);
        return out.toDataURL("image/png");
      }
      return draw.toDataURL("image/png");
    },
    isBlank: () => !dirtyRef.current,
  }));

  function ctxOf() {
    return canvasRef.current!.getContext("2d")!;
  }

  function save() {
    const canvas = canvasRef.current!;
    const ctx = ctxOf();
    try {
      historyRef.current.push(
        ctx.getImageData(0, 0, canvas.width, canvas.height)
      );
      if (historyRef.current.length > 18) historyRef.current.shift();
    } catch (e) {
      console.warn(e);
    }
  }

  function seed() {
    const canvas = canvasRef.current!;
    const ctx = ctxOf();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (answerMode) {
      // 学生作答：白底，便于导出为图片提交
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (initialUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          historyRef.current = [];
          save();
        };
        img.src = initialUrl;
      }
      historyRef.current = [];
      save();
      return;
    }
    if (variant === "grading") {
      // 批改：学生作答画在锁定底层(bg)，老师批注层(main)保持透明——
      // 这样清空/橡皮只作用于批注层，绝不擦除学生原作答。
      if (lockedBg && bgRef.current) {
        const bg = bgRef.current;
        const bctx = bg.getContext("2d")!;
        bctx.clearRect(0, 0, bg.width, bg.height);
        bctx.fillStyle = "#ffffff";
        bctx.fillRect(0, 0, bg.width, bg.height);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => bctx.drawImage(img, 0, 0, bg.width, bg.height);
        img.src = initialUrl!;
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.fillStyle = "#1f2925";
      ctx.font = "22px serif";
      ctx.fillText("请用触屏笔写出推理过程，也可以画辅助线。", 34, 60);
    }
    historyRef.current = [];
    save();
  }

  useEffect(() => {
    seed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = true;
    const ctx = ctxOf();
    const p = point(e);
    canvasRef.current!.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = ctxOf();
    const p = point(e);
    ctx.globalCompositeOperation =
      toolRef.current === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth =
      toolRef.current === "eraser" ? 18 : e.pointerType === "pen" ? 3 : 4;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function endStroke() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    dirtyRef.current = true;
    ctxOf().globalCompositeOperation = "source-over";
    save();
  }

  function pickTool(t: "pen" | "eraser") {
    toolRef.current = t;
    setTool(t);
  }
  function pickColor(c: string) {
    colorRef.current = c;
    setColor(c);
    toolRef.current = "pen";
    setTool("pen");
  }
  function undo() {
    const h = historyRef.current;
    if (h.length > 1) {
      h.pop();
      ctxOf().putImageData(h[h.length - 1], 0, 0);
    }
  }
  function clear() {
    const canvas = canvasRef.current!;
    ctxOf().clearRect(0, 0, canvas.width, canvas.height);
    save();
  }

  return (
    <div>
      <div className={`hw-stack ${lockedBg ? "locked" : ""}`}>
        {lockedBg && (
          <canvas
            ref={bgRef}
            width={width}
            height={height}
            className="handwriting-canvas hw-bg"
            aria-hidden="true"
          />
        )}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`handwriting-canvas ${lockedBg ? "hw-anno" : ""}`}
          style={grid ? { backgroundSize: "12px 12px" } : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onPointerLeave={endStroke}
          aria-label="手写画布"
        />
      </div>
      <div className="pen-toolbar">
        <button
          className={`tool ${tool === "pen" ? "active" : ""}`}
          onClick={() => pickTool("pen")}
        >
          画笔
        </button>
        <button
          className={`tool ${tool === "eraser" ? "active" : ""}`}
          onClick={() => pickTool("eraser")}
        >
          橡皮
        </button>
        {variant === "student" && (
          <button className="tool" onClick={() => setGrid((g) => !g)}>
            页面网格
          </button>
        )}
        {SWATCHES[variant].map((s) => (
          <button
            key={s.color}
            className={`swatch ${color === s.color ? "active" : ""}`}
            style={{ background: s.color }}
            onClick={() => pickColor(s.color)}
            aria-label={`颜色 ${s.color}`}
          />
        ))}
        <button className="ghost small" onClick={undo}>
          撤销
        </button>
        <button className="ghost small" onClick={clear}>
          清空
        </button>
      </div>
    </div>
  );
});

export default HandwritingCanvas;
