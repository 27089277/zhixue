import { useEffect, useRef, useState } from "react";
import { Modal, Button } from "antd";

// 手绘画板弹窗：老师出题时画几何图/示意图，确定后导出 PNG（data URL）交由上层上传并插入。
const COLORS = ["#111827", "#e3342f", "#2364d2", "#0c8a5b"];

export default function DrawingBoard({
  open,
  onCancel,
  onDone,
  width = 720,
  height = 420,
}: {
  open: boolean;
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const colorRef = useRef(COLORS[0]);
  const toolRef = useRef<"pen" | "eraser">("pen");
  const historyRef = useRef<ImageData[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  useEffect(() => {
    if (!open) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    historyRef.current = [ctx.getImageData(0, 0, c.width, c.height)];
  }, [open]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    canvasRef.current!.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.globalCompositeOperation = toolRef.current === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = toolRef.current === "eraser" ? 20 : e.pointerType === "pen" ? 2.5 : 3;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    historyRef.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
  }
  function undo() {
    const h = historyRef.current;
    if (h.length > 1) {
      h.pop();
      canvasRef.current!.getContext("2d")!.putImageData(h[h.length - 1], 0, 0);
    }
  }
  function clear() {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    historyRef.current = [ctx.getImageData(0, 0, c.width, c.height)];
  }

  return (
    <Modal
      open={open}
      title="手绘插图"
      width={width + 60}
      onCancel={onCancel}
      okText="插入图片"
      cancelText="取消"
      onOk={() => onDone(canvasRef.current!.toDataURL("image/png"))}
    >
      <div className="draw-toolbar">
        <button type="button" className={tool === "pen" ? "active" : ""} onClick={() => { toolRef.current = "pen"; setTool("pen"); }}>画笔</button>
        <button type="button" className={tool === "eraser" ? "active" : ""} onClick={() => { toolRef.current = "eraser"; setTool("eraser"); }}>橡皮</button>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`draw-swatch ${color === c ? "active" : ""}`}
            style={{ background: c }}
            onClick={() => { colorRef.current = c; setColor(c); toolRef.current = "pen"; setTool("pen"); }}
          />
        ))}
        <Button size="small" onClick={undo}>撤销</Button>
        <Button size="small" onClick={clear}>清空</Button>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="draw-canvas"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
      />
    </Modal>
  );
}
