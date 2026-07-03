import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { assemblePaper, generateQuestions } from "@/lib/aiGen";
import { useStore } from "@/store/useStore";
import { currentProfile, visibleQuestions } from "@/store/permissions";
import { normalizePaperSections } from "@/lib/papers";
import { difficultyLabel } from "@/lib/difficulty";
import type { Paper, PaperItem } from "@/types";
import { colors, font, radius, space } from "@/theme/tokens";

const SUBJECTS = ["数学", "物理", "语文", "英语", "化学"];
const TYPES = ["单选题", "填空题", "解答题"];
const DIFFS = ["容易", "中等", "较难"];

// 组卷中心 / AI 出题（菁优网式）：AI 生成 或 从题库按 知识点+题型+难度 抽题组卷。
export default function Compose() {
  const router = useRouter();
  const s = useStore();
  const { mode: initMode } = useLocalSearchParams<{ mode?: string }>();
  const isQuestions = initMode === "questions";

  // source: ai=AI生成新题 / bank=从题库抽题（仅组卷模式可选）
  const [source, setSource] = useState<"ai" | "bank">("ai");
  const [subject, setSubject] = useState("数学");
  const [point, setPoint] = useState("");
  const [type, setType] = useState("单选题");
  const [diff, setDiff] = useState("中等");
  const [count, setCount] = useState("6");
  const [busy, setBusy] = useState(false);

  const bankMatched = useMemo(() => {
    if (source !== "bank") return [];
    return visibleQuestions(s).filter(
      (q) =>
        q.subject === subject &&
        (!point.trim() || (q.point || "").includes(point.trim())) &&
        q.type === type &&
        difficultyLabel(q.difficulty) === diff
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, s.questions, subject, point, type, diff]);

  async function run() {
    const n = Number(count) || 6;
    if (isQuestions) {
      if (!point.trim()) return Alert.alert("提示", "请输入知识点");
      setBusy(true);
      try {
        const qs = await generateQuestions({ subject, knowledgePoint: point.trim(), type, difficulty: diff, count: n });
        Alert.alert("出题成功", `已生成 ${qs.length} 道题入库`, [{ text: "好", onPress: () => router.back() }]);
      } catch (e: any) {
        Alert.alert("失败", e?.message || "AI 生成失败");
      } finally {
        setBusy(false);
      }
      return;
    }
    // 组卷
    if (source === "ai") {
      if (!point.trim()) return Alert.alert("提示", "请输入知识点");
      setBusy(true);
      try {
        const p = await assemblePaper({ subject, knowledgePoint: point.trim(), type, difficulty: diff, count: n });
        Alert.alert("组卷成功", `已生成《${p.title}》`, [{ text: "好", onPress: () => router.back() }]);
      } catch (e: any) {
        Alert.alert("失败", e?.message || "AI 组卷失败");
      } finally {
        setBusy(false);
      }
    } else {
      // 从题库抽题
      const picked = bankMatched.slice(0, n);
      if (!picked.length) return Alert.alert("提示", "题库无符合条件的题，换条件或用 AI 生成");
      const items: PaperItem[] = picked.map((q, i) => ({
        no: i + 1,
        type: q.type,
        title: q.title,
        choices: q.choices,
        answer: q.answer || "",
        analysis: q.analysis,
        score: q.type === "解答题" ? 10 : 4,
        knowledge: [q.point].filter(Boolean),
        status: "未答",
      }));
      const score = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
      const title = `${subject}·${point.trim() || "综合"}组卷（${items.length}题）`;
      const paper: Paper = {
        id: `bank-paper-${Date.now()}`,
        title, exam: "题库组卷", subject, region: "校本", year: new Date().getFullYear(),
        duration: 45, score, questions: items.length, progress: 0, difficulty: diff,
        sections: normalizePaperSections([], items), tags: ["题库抽题", "待校对"],
        visibility: "teacher", owner: currentProfile(s).name, source: "题库抽题组卷", sharedWith: [], items,
      };
      s.addPaper(paper);
      Alert.alert("组卷成功", `已从题库抽 ${items.length} 题组成《${title}》`, [{ text: "好", onPress: () => router.back() }]);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Ionicons name="chevron-back" size={26} color={colors.ink} /></Pressable>
        <Text style={styles.headerTitle}>{isQuestions ? "AI 出题" : "组卷中心"}</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 40 }}>
        {!isQuestions && (
          <View style={styles.seg}>
            {(["ai", "bank"] as const).map((m) => (
              <Pressable key={m} onPress={() => setSource(m)} style={[styles.segBtn, source === m && styles.segOn]}>
                <Text style={{ color: source === m ? "#fff" : colors.sub, fontWeight: "700" }}>
                  {m === "ai" ? "AI 生成新题" : "从题库抽题"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <Field label="学科"><Chips value={subject} onChange={setSubject} options={SUBJECTS} /></Field>
        <Field label={source === "bank" ? "知识点（可留空=全部）" : "知识点"}>
          <TextInput style={styles.input} placeholder="如：电阻 / 二次函数" value={point} onChangeText={setPoint} />
        </Field>
        <Field label="题型"><Chips value={type} onChange={setType} options={TYPES} /></Field>
        <Field label="难度"><Chips value={diff} onChange={setDiff} options={DIFFS} /></Field>
        <Field label="题量"><TextInput style={styles.input} keyboardType="number-pad" value={count} onChangeText={setCount} /></Field>

        {!isQuestions && source === "bank" && (
          <Text style={{ color: colors.sub, fontSize: font.sub }}>
            题库命中 <Text style={{ color: colors.brand, fontWeight: "800" }}>{bankMatched.length}</Text> 题，抽取前 {Math.min(Number(count) || 6, bankMatched.length)} 题
          </Text>
        )}
        <Pressable disabled={busy} onPress={run} style={[styles.go, busy && { opacity: 0.6 }]}>
          <Ionicons name={source === "bank" ? "albums" : "sparkles"} size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>
            {busy ? "处理中…" : isQuestions ? "生成题目" : source === "bank" ? "从题库组卷" : "AI 一键组卷"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ gap: 8 }}><Text style={{ fontSize: font.sub, fontWeight: "700", color: colors.sub }}>{label}</Text>{children}</View>;
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
  seg: { flexDirection: "row", backgroundColor: "#eef2f0", borderRadius: radius.md, padding: 4 },
  segBtn: { flex: 1, height: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: colors.brand },
  input: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, fontSize: font.h3, color: colors.ink },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  go: { flexDirection: "row", gap: 8, height: 52, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
});
