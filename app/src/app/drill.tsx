import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { buildPool } from "@/lib/pool";
import { RichText } from "@/components/RichText";
import { colors, font, radius, space } from "@/theme/tokens";

// 专题练习（菁优网式）：按知识点刷题，选项即时判对错 + 看解析。
export default function Drill() {
  const router = useRouter();
  const { subject, point } = useLocalSearchParams<{ subject?: string; point?: string }>();
  const questions = useStore((s) => s.questions);
  const papers = useStore((s) => s.papers);
  const pool = useMemo(() => buildPool(questions, papers), [questions, papers]);

  const list = useMemo(
    () =>
      pool.filter(
        (q) => (!subject || q.subject === subject) && (!point || q.point === point)
      ),
    [pool, subject, point]
  );

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const q = list[i];

  function reset() {
    setPicked(null);
    setRevealed(false);
  }
  function next() {
    if (i < list.length - 1) {
      setI(i + 1);
      reset();
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{point || subject || "专题练习"}</Text>
        <Text style={{ color: colors.muted, fontSize: font.sub }}>{list.length ? `${i + 1}/${list.length}` : ""}</Text>
      </View>

      {!q ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>该知识点暂无题目</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 40 }}>
          <Text style={{ color: colors.muted, fontSize: font.cap }}>{q.type} · {q.point}</Text>
          <RichText html={q.title} style={{ fontSize: font.h3 }} />

          {(q.choices || []).length ? (
            <View style={{ gap: 10 }}>
              {(q.choices || []).map((c, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isCorrect = String(q.answer).trim() === label;
                const sel = picked === label;
                const showState = revealed && (isCorrect || sel);
                return (
                  <Pressable
                    key={idx}
                    onPress={() => { if (!revealed) { setPicked(label); setRevealed(true); } }}
                    style={[
                      styles.option,
                      showState && (isCorrect ? styles.ok : styles.bad),
                    ]}
                  >
                    <View style={styles.badge}><Text style={{ fontWeight: "700", color: colors.sub }}>{label}</Text></View>
                    <RichText html={c} style={{ flex: 1 }} />
                    {showState ? (
                      <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={20} color={isCorrect ? colors.ok : colors.danger} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Pressable onPress={() => setRevealed(true)} style={styles.revealBtn}>
              <Text style={{ color: colors.brand, fontWeight: "700" }}>{revealed ? "答案已显示" : "查看答案"}</Text>
            </Pressable>
          )}

          {revealed ? (
            <View style={styles.analysis}>
              <Text style={{ color: colors.ok, fontWeight: "700", marginBottom: 4 }}>答案：{q.answer}</Text>
              {q.analysis ? <RichText html={q.analysis} style={{ fontSize: font.sub }} /> : null}
            </View>
          ) : null}
        </ScrollView>
      )}

      {q ? (
        <View style={styles.footer}>
          <Pressable onPress={next} disabled={i >= list.length - 1} style={[styles.nextBtn, i >= list.length - 1 && { opacity: 0.5 }]}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>下一题</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink },
  option: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14 },
  ok: { borderColor: colors.ok, backgroundColor: colors.brandSoft },
  bad: { borderColor: colors.danger, backgroundColor: "#fdecea" },
  badge: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#eef2f0", alignItems: "center", justifyContent: "center" },
  revealBtn: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand },
  analysis: { backgroundColor: "#fff", borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  footer: { padding: space.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "#fff" },
  nextBtn: { height: 48, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
});
