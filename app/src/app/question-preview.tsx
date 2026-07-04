import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { RichText } from "@/components/RichText";
import { colors, font, radius, space } from "@/theme/tokens";

// AI 出题预览：老师确认无误后勾选入库（不自动落库）。DeepSeek 失败则根本不会到这一步。
export default function QuestionPreview() {
  const router = useRouter();
  const s = useStore();
  const draft = s.draftQuestions;
  const [picked, setPicked] = useState<Set<number>>(() => new Set(draft.map((_, i) => i)));

  const allOn = useMemo(() => draft.length > 0 && picked.size === draft.length, [draft.length, picked.size]);

  function toggle(i: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }
  function toggleAll() {
    setPicked(allOn ? new Set() : new Set(draft.map((_, i) => i)));
  }
  function goBank() {
    router.replace("/(teacher)/bank" as any);
  }
  function save() {
    const chosen = draft.filter((_, i) => picked.has(i));
    if (!chosen.length) return Alert.alert("提示", "请至少勾选一道题入库");
    s.addQuestions(chosen);
    s.setDraftQuestions([]);
    Alert.alert("已入库", `已将 ${chosen.length} 道题存入题库`, [{ text: "好", onPress: goBank }]);
  }
  function discard() {
    Alert.alert("放弃这些题？", "生成的题目将不入库", [
      { text: "取消", style: "cancel" },
      { text: "放弃", style: "destructive", onPress: () => { s.setDraftQuestions([]); router.back(); } },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={discard} hitSlop={10}><Ionicons name="chevron-back" size={26} color={colors.ink} /></Pressable>
        <Text style={styles.headerTitle}>AI 出题预览（{draft.length}）</Text>
        <Pressable onPress={toggleAll} hitSlop={10}><Text style={{ color: colors.brand, fontWeight: "700", fontSize: font.sub }}>{allOn ? "取消全选" : "全选"}</Text></Pressable>
      </View>

      {!draft.length ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>没有可预览的题目</Text>
        </View>
      ) : (
        <>
          <Text style={{ color: colors.sub, fontSize: font.sub, paddingHorizontal: space.lg, paddingTop: 8 }}>
            请核对题目/答案无误后，勾选入库（已选 {picked.size}/{draft.length}）
          </Text>
          <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 40 }}>
            {draft.map((q, i) => {
              const on = picked.has(i);
              return (
                <Pressable key={i} onPress={() => toggle(i)} style={[styles.card, on && { borderColor: colors.brand, backgroundColor: colors.brandSoft }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name={on ? "checkbox" : "square-outline"} size={18} color={on ? colors.brand : colors.muted} />
                    <Text style={{ color: colors.muted, fontSize: font.cap }}>第 {i + 1} 题 · {q.type}{q.difficulty ? ` · ${q.difficulty}` : ""}</Text>
                  </View>
                  <RichText html={q.title} />
                  {(q.choices || []).map((c, j) => (
                    <Text key={j} style={{ color: colors.sub, fontSize: font.sub }}>{String.fromCharCode(65 + j)}. {c.replace(/<[^>]+>/g, "")}</Text>
                  ))}
                  {q.answer ? <Text style={{ color: colors.ok, fontSize: font.sub, marginTop: 2 }}>答案：{q.answer}</Text> : null}
                  {q.analysis ? <Text style={{ color: colors.sub, fontSize: font.cap, marginTop: 2 }}>解析：{String(q.analysis).replace(/<[^>]+>/g, "")}</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.footer}>
            <Pressable onPress={discard} style={[styles.btn, { borderColor: colors.line, backgroundColor: "#fff" }]}>
              <Text style={{ color: colors.sub, fontWeight: "700" }}>放弃</Text>
            </Pressable>
            <Pressable onPress={save} style={[styles.btn, { backgroundColor: colors.brand }]}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>确认入库（{picked.size}）</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 4 },
  footer: { flexDirection: "row", gap: 12, padding: space.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "#fff" },
  btn: { flex: 1, height: 50, borderRadius: radius.md, borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
});
