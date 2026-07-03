import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { visibleQuestions } from "@/store/permissions";
import { aiPost } from "@/api/client";
import { RichText } from "@/components/RichText";
import { difficultyStars, starText } from "@/lib/difficulty";
import { colors, font, radius, space } from "@/theme/tokens";
import type { Question } from "@/types";

// 题库浏览（菁优网式）：知识点筛选 + 难度星级 + 相似题推荐（向量检索）。
export default function BankQuestions() {
  const router = useRouter();
  const s = useStore();
  const all = useMemo(() => visibleQuestions(s), [s.questions, s.role]);

  const points = useMemo(() => {
    const m = new Map<string, number>();
    all.forEach((q) => m.set(q.point || "未分类", (m.get(q.point || "未分类") || 0) + 1));
    return [...m.entries()];
  }, [all]);

  const [point, setPoint] = useState<string | null>(null);
  const list = useMemo(() => (point ? all.filter((q) => (q.point || "未分类") === point) : all), [all, point]);

  const [simOpen, setSimOpen] = useState(false);
  const [simBusy, setSimBusy] = useState(false);
  const [simList, setSimList] = useState<Question[]>([]);

  async function showSimilar(q: Question) {
    setSimOpen(true); setSimBusy(true); setSimList([]);
    try {
      const ai = await aiPost("/ai/search-questions", { query: `${q.title} ${q.point || ""}`, k: 10 });
      const ids: string[] = (ai?.result?.ids || []).map(String);
      let r = s.questions.filter((x) => x.id != null && ids.includes(String(x.id)) && x !== q);
      if (!r.length) r = s.questions.filter((x) => x !== q && x.point && x.point === q.point);
      setSimList(r.slice(0, 8));
    } catch {
      setSimList(s.questions.filter((x) => x !== q && x.point === q.point).slice(0, 8));
    } finally { setSimBusy(false); }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Ionicons name="chevron-back" size={26} color={colors.ink} /></Pressable>
        <Text style={styles.headerTitle}>题库浏览</Text>
        <Text style={{ color: colors.muted, fontSize: font.sub }}>{list.length} 题</Text>
      </View>

      {/* 知识点筛选 */}
      <View style={styles.kpBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: space.lg }}>
          <Chip label="全部" on={!point} onPress={() => setPoint(null)} />
          {points.map(([pt, n]) => <Chip key={pt} label={`${pt}·${n}`} on={point === pt} onPress={() => setPoint(pt)} />)}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 40 }}>
        {list.length ? list.map((q, i) => (
          <View key={q.id ?? i} style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: colors.muted, fontSize: font.cap }}>{q.type} · {q.point || "未分类"}</Text>
              <Text style={{ color: colors.star, fontSize: font.cap }}>{starText(difficultyStars(q.difficulty))}</Text>
            </View>
            <RichText html={q.title} />
            {q.answer ? <Text style={{ color: colors.ok, fontSize: font.sub }}>答案：{q.answer}</Text> : null}
            <Pressable onPress={() => showSimilar(q)} style={{ alignSelf: "flex-start" }}>
              <Text style={{ color: colors.brand, fontWeight: "700", fontSize: font.sub }}>相似题 →</Text>
            </Pressable>
          </View>
        )) : <Text style={{ color: colors.muted, textAlign: "center", marginTop: 40 }}>题库暂无题目，去「组卷中心/AI 出题」生成</Text>}
      </ScrollView>

      <Modal visible={simOpen} animationType="slide" onRequestClose={() => setSimOpen(false)} presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>相似题推荐</Text>
            <Pressable onPress={() => setSimOpen(false)} hitSlop={10}><Ionicons name="close" size={26} color={colors.ink} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
            {simBusy ? <View style={{ alignItems: "center", padding: 40 }}><ActivityIndicator color={colors.brand} /><Text style={{ color: colors.muted, marginTop: 8 }}>向量库检索中…</Text></View>
              : simList.length ? simList.map((q, i) => (
                <View key={q.id ?? i} style={styles.card}>
                  <Text style={{ color: colors.muted, fontSize: font.cap }}>{q.type} · {q.point}</Text>
                  <RichText html={q.title} />
                  {q.answer ? <Text style={{ color: colors.ok, fontSize: font.sub }}>答案：{q.answer}</Text> : null}
                </View>
              )) : <Text style={{ color: colors.muted, textAlign: "center", marginTop: 40 }}>未找到相似题（题库题目较少）</Text>}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={{ color: on ? "#fff" : colors.sub, fontSize: font.sub, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink },
  kpBar: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  card: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 6 },
});
