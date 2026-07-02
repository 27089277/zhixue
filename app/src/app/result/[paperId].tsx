import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { RichText } from "@/components/RichText";
import { Card } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

export default function ResultScreen() {
  const { paperId } = useLocalSearchParams<{ paperId: string }>();
  const router = useRouter();
  const s = useStore();
  const paper = useMemo(() => s.papers.find((p) => p.id === paperId), [s.papers, paperId]);
  const result = paperId ? s.exam.submitted[paperId] : undefined;
  const answers = paperId ? s.exam.answers[paperId] || {} : {};

  if (!paper || !result) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20, color: colors.muted }}>暂无交卷记录</Text>
      </SafeAreaView>
    );
  }

  const objItems = paper.items.filter((it) => it.type !== "解答题");
  const correct = objItems.filter(
    (it) => String(answers[it.no]?.value || "").trim() === String(it.answer).trim()
  ).length;
  const finalScore = result.finalScore ?? result.score;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/(student)")} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{paper.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40, gap: space.md }}>
        {/* 分数卡 */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreNum}>{finalScore}</Text>
          <Text style={styles.scoreTotal}>/ {paper.score} 分</Text>
          <Text style={styles.scoreSub}>
            客观题答对 {correct}/{objItems.length}
            {result.pendingManual ? ` · ${result.pendingManual} 道主观题待老师批改` : ""}
          </Text>
        </View>

        <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink }}>逐题解析</Text>
        {paper.items.map((it) => {
          const mine = answers[it.no]?.value || "";
          const isObj = it.type !== "解答题";
          const ok = isObj && String(mine).trim() === String(it.answer).trim();
          return (
            <Card key={it.no} style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "800", color: colors.ink }}>第 {it.no} 题 · {it.type}</Text>
                {isObj ? (
                  <Text style={{ color: ok ? colors.ok : colors.danger, fontWeight: "700", fontSize: font.sub }}>
                    {ok ? "✓ 正确" : "✕ 错误"}
                  </Text>
                ) : (
                  <Text style={{ color: colors.warn, fontSize: font.sub }}>待批改</Text>
                )}
              </View>
              <RichText html={it.title} />
              {isObj ? (
                <View style={{ gap: 2 }}>
                  <Text style={{ color: colors.sub, fontSize: font.sub }}>你的答案：<Text style={{ color: ok ? colors.ok : colors.danger }}>{mine || "未作答"}</Text></Text>
                  <Text style={{ color: colors.sub, fontSize: font.sub }}>正确答案：<Text style={{ color: colors.ok }}>{it.answer}</Text></Text>
                </View>
              ) : null}
              {it.analysis ? (
                <View style={styles.analysis}>
                  <Text style={{ color: colors.sub, fontSize: font.cap, fontWeight: "700", marginBottom: 2 }}>解析</Text>
                  <RichText html={it.analysis} style={{ fontSize: font.sub }} />
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink, textAlign: "center" },
  scoreCard: { backgroundColor: colors.brand, borderRadius: radius.lg, padding: space.xl, alignItems: "center" },
  scoreNum: { color: "#fff", fontSize: 48, fontWeight: "900" },
  scoreTotal: { color: "rgba(255,255,255,0.9)", fontSize: font.h3, marginTop: -4 },
  scoreSub: { color: "rgba(255,255,255,0.9)", fontSize: font.sub, marginTop: 8 },
  analysis: { backgroundColor: colors.brandSoft, borderRadius: radius.sm, padding: 10, marginTop: 2 },
});
