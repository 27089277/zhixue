import { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";
import Svg, { Path } from "react-native-svg";
import { colors, font, radius } from "../theme/tokens";

// 手写作答（Expo Go 兼容：手势 + SVG 轨迹）。撤销/清空。
// 导出为 PNG 上传对象存储将在 EAS dev build 阶段用 react-native-skia/view-shot 接入。
export interface HandwritingRef {
  isBlank: () => boolean;
  strokes: () => string[];
}

export const Handwriting = forwardRef<HandwritingRef, { height?: number }>(
  function Handwriting({ height = 260 }, ref) {
    const [paths, setPaths] = useState<string[]>([]);
    const [current, setCurrent] = useState<string>("");

    useImperativeHandle(ref, () => ({
      isBlank: () => paths.length === 0 && !current,
      strokes: () => paths,
    }));

    const begin = (x: number, y: number) => setCurrent(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
    const move = (x: number, y: number) =>
      setCurrent((c) => (c ? `${c} L ${x.toFixed(1)} ${y.toFixed(1)}` : c));
    const end = () =>
      setCurrent((c) => {
        if (c) setPaths((p) => [...p, c]);
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
              {paths.map((d, i) => (
                <Path key={i} d={d} stroke={colors.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {current ? (
                <Path d={current} stroke={colors.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
            </Svg>
            {paths.length === 0 && !current ? (
              <Text style={styles.hint}>用触控笔/手指在此作答</Text>
            ) : null}
          </View>
        </GestureDetector>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable style={styles.tool} onPress={() => setPaths((p) => p.slice(0, -1))}>
            <Text style={styles.toolText}>撤销</Text>
          </Pressable>
          <Pressable style={styles.tool} onPress={() => { setPaths([]); setCurrent(""); }}>
            <Text style={styles.toolText}>清空</Text>
          </Pressable>
        </View>
      </View>
    );
  }
);

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
