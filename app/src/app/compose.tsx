import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { assemblePaper, generateQuestions } from "@/lib/aiGen";
import { colors, font, radius, space } from "@/theme/tokens";

const SUBJECTS = ["数学", "物理", "语文", "英语", "化学"];
const TYPES = ["单选题", "填空题", "解答题"];
const DIFFS = ["容易", "中等", "较难"];

// 组卷中心 / AI 出题（融合菁优网结构化组卷）。mode=paper 组卷 / mode=questions 出题。
export default function Compose() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isPaper = mode !== "questions";

  const [subject, setSubject] = useState("数学");
  const [point, setPoint] = useState("");
  const [type, setType] = useState("单选题");
  const [diff, setDiff] = useState("中等");
  const [count, setCount] = useState("6");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!point.trim()) return Alert.alert("提示", "请输入知识点");
    setBusy(true);
    try {
      const params = { subject, knowledgePoint: point.trim(), type, difficulty: diff, count: Number(count) || 6 };
      if (isPaper) {
        const p = await assemblePaper(params);
        Alert.alert("组卷成功", `已生成《${p.title}》`, [{ text: "好", onPress: () => router.back() }]);
      } else {
        const qs = await generateQuestions(params);
        Alert.alert("出题成功", `已生成 ${qs.length} 道题目并入库`, [{ text: "好", onPress: () => router.back() }]);
      }
    } catch (e: any) {
      Alert.alert("失败", e?.message || "AI 生成失败，请检查后端与网络");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{isPaper ? "组卷中心" : "AI 出题"}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 40 }}>
        <Field label="学科">
          <Chips value={subject} onChange={setSubject} options={SUBJECTS} />
        </Field>
        <Field label="知识点">
          <TextInput style={styles.input} placeholder="如：电阻 / 二次函数 / 文言文" value={point} onChangeText={setPoint} />
        </Field>
        <Field label="题型">
          <Chips value={type} onChange={setType} options={TYPES} />
        </Field>
        <Field label="难度">
          <Chips value={diff} onChange={setDiff} options={DIFFS} />
        </Field>
        <Field label="数量">
          <TextInput style={styles.input} keyboardType="number-pad" value={count} onChangeText={setCount} />
        </Field>

        <Pressable disabled={busy} onPress={run} style={[styles.go, busy && { opacity: 0.6 }]}>
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>
            {busy ? "AI 生成中…" : isPaper ? "一键组卷" : "生成题目"}
          </Text>
        </Pressable>
        <Text style={{ color: colors.muted, fontSize: font.cap, textAlign: "center" }}>
          由 DeepSeek 生成真题（需后端已配置 Key）
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: font.sub, fontWeight: "700", color: colors.sub }}>{label}</Text>
      {children}
    </View>
  );
}
function Chips({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.chip, on && styles.chipOn]}>
            <Text style={{ color: on ? "#fff" : colors.sub, fontWeight: "600" }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink, textAlign: "center" },
  input: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, fontSize: font.h3, color: colors.ink },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  go: { flexDirection: "row", gap: 8, height: 52, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", marginTop: space.sm },
});
