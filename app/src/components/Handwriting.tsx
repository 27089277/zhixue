import { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";
import Svg, { Path } from "react-native-svg";
import { colors, font, radius } from "../theme/tokens";

// 手写轨迹以 SVG path 字符串数组表示，序列化为 "hw:" + JSON 存入答案/批注。
// 跨端（iOS/Android/Web）纯 JS/SVG 实现，无需 Skia；导出=文本，直接进后端 answers/annotations。
export function serializeStrokes(strokes: string[]): string {
  return "hw:" + JSON.stringify(strokes);
}
export function parseStrokes(value?: string): string[] {
  if (!value || !value.startsWith("hw:")) return [];
  try {
    const arr = JSON.parse(value.slice(3));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
export const isHandwriting = (v?: string) => !!v && v.startsWith("hw:");

export interface HandwritingRef {
  isBlank: () => boolean;
  strokes: () => string[];
  serialized: () => string;
}

// 只读渲染：底层墨迹 + 可选红笔批注
export function HandwritingView({
  ink = [],
  red = [],
  height = 220,
}: {
  ink?: string[];
  red?: string[];
  height?: number;
}) {
  return (
    <View style={[styles.canvas, { height }]}>
      <Svg width="100%" height="100%">
        {ink.map((d, i) => (
          <Path key={`i${i}`} d={d} stroke={colors.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {red.map((d, i) => (
          <Path key={`r${i}`} d={d} stroke={colors.danger} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
      {ink.length + red.length === 0 ? <Text style={styles.hint}>（无手写内容）</Text> : null}
    </View>
  );
}

// 可编辑：background=锁定底层(如学生作答，供老师批注)，penColor=画笔色
export const Handwriting = forwardRef<
  HandwritingRef,
  {
    height?: number;
    background?: string[];
    penColor?: string;
    initial?: string[];
    onChange?: (strokes: string[]) => void;
  }
>(function Handwriting({ height = 260, background = [], penColor = colors.ink, initial = [], onChange }, ref) {
  const [paths, setPaths] = useState<string[]>(initial);
  const [current, setCurrent] = useState<string>("");
  const emit = (next: string[]) => onChange?.(next);

  useImperativeHandle(ref, () => ({
    isBlank: () => paths.length === 0 && !current,
    strokes: () => paths,
    serialized: () => serializeStrokes(paths),
  }));

  const begin = (x: number, y: number) => setCurrent(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
  const move = (x: number, y: number) =>
    setCurrent((c) => (c ? `${c} L ${x.toFixed(1)} ${y.toFixed(1)}` : c));
  const end = () =>
    setCurrent((c) => {
      if (c) setPaths((p) => { const n = [...p, c]; emit(n); return n; });
      return "";
    });

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => runOnJS(begin)(e.x, e.y))
    .onUpdate((e) => runOnJS(move)(e.x, e.y))
    .onEnd(() => runOnJS(end)())
    .onFinalize(() => runOnJS(end)());

  return (
    <View style={{ gap: 8 }}>
      <GestureDetector gesture={pan}>
        <View style={[styles.canvas, { height }]}>
          <Svg width="100%" height="100%">
            {background.map((d, i) => (
              <Path key={`bg${i}`} d={d} stroke={colors.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {paths.map((d, i) => (
              <Path key={i} d={d} stroke={penColor} strokeWidth={penColor === colors.ink ? 2.5 : 3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {current ? (
              <Path d={current} stroke={penColor} strokeWidth={penColor === colors.ink ? 2.5 : 3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
          </Svg>
          {paths.length === 0 && !current && background.length === 0 ? (
            <Text style={styles.hint}>用触控笔/手指在此作答</Text>
          ) : null}
        </View>
      </GestureDetector>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable style={styles.tool} onPress={() => setPaths((p) => { const n = p.slice(0, -1); emit(n); return n; })}>
          <Text style={styles.toolText}>撤销</Text>
        </Pressable>
        <Pressable style={styles.tool} onPress={() => { setPaths([]); setCurrent(""); emit([]); }}>
          <Text style={styles.toolText}>清空</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { position: "absolute", color: colors.muted, fontSize: font.sub },
  tool: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  toolText: { color: colors.sub, fontSize: font.sub },
});
