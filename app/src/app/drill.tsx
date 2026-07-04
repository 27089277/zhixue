import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { buildPool } from "@/lib/pool";
import { isObjectiveCorrect } from "@/lib/papers";
import { publicBankQuestions, publicRealPapers, wrongKey } from "@/lib/practice";
import { RichText } from "@/components/RichText";
import { difficultyStars, starText } from "@/lib/difficulty";
import { playSfx } from "@/lib/sound";
import { colors, font, radius, space } from "@/theme/tokens";

// 专题练习（菁优网式）：按知识点刷题，选项即时判对错 + 看解析。
// 题源只来自 公共题库 + 公开真题卷 + 学生私有 AI 题；错题写入自己的错题本。
export default function Drill() {
  const router = useRouter();
  const { subject, point, mine: mineParam } = useLocalSearchParams<{ subject?: string; point?: string; mine?: string }>();
  const questions = useStore((s) => s.questions);
  const papers = useStore((s) => s.papers);
  const mine = useStore((s) => s.myPracticeQuestions);
  const logPracticeWrong = useStore((s) => s.logPracticeWrong);
  const pool = useMemo(
    () => buildPool(publicBankQuestions(questions), publicRealPapers(papers), mine),
    [questions, papers, mine]
  );

  const list = useMemo(
    () =>
      pool.filter(
        (q) =>
          (mineParam ? q.origin === "student-ai" : true) &&
          (!subject || q.subject === subject) &&
          (!point || q.point === point)
      ),
    [pool, subject, point, mineParam]
  );

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string>("");
  const [revealed, setRevealed] = useState(false);
  const q = list[i];
  const isMulti = q?.type === "多选题";

  function reset() {
    setPicked("");
    setRevealed(false);
  }
  function next() {
    if (i < list.length - 1) {
      setI(i + 1);
      reset();
    }
  }

  // 判分（单选即时；多选点「对答案」后判）→ 判错写入错题本
  function judge(finalPicked: string) {
    setRevealed(true);
    const right = isObjectiveCorrect(q.type, q.answer, finalPicked);
    playSfx(right ? "correct" : "wrong");
    if (!right) {
      logPracticeWrong({
        key: wrongKey(q.subject, q.title),
        subject: q.subject,
        point: q.point,
        type: q.type,
        stem: q.title,
        choices: q.choices,
        mine: finalPicked,
        answer: String(q.answer || ""),
        analysis: q.analysis,
        origin: q.origin === "student-ai" ? "student-ai" : "practice",
        at: Date.now(),
      });
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
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.muted, fontSize: font.cap }}>{q.type} · {q.point}</Text>
            <Text style={{ color: colors.star, fontSize: font.cap }}>{starText(difficultyStars(q.difficulty))}</Text>
          </View>
          <RichText html={q.title} style={{ fontSize: font.h3 }} />

          {(q.choices || []).length ? (
            <View style={{ gap: 10 }}>
              {isMulti ? <Text style={{ color: colors.brand, fontSize: font.cap }}>多选题 · 可选多个，选好点「对答案」</Text> : null}
              {(q.choices || []).map((c, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isCorrect = String(q.answer).toUpperCase().includes(label);
                const sel = picked.includes(label);
                const showState = revealed && (isCorrect || sel);
                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      if (revealed) return;
                      if (isMulti) {
                        const set = new Set(picked.split("").filter(Boolean));
                        set.has(label) ? set.delete(label) : set.add(label);
                        setPicked(Array.from(set).sort().join(""));
                      } else {
                        setPicked(label);
                        judge(label);
                      }
                    }}
                    style={[
                      styles.option,
                      !revealed && sel && styles.optionSel,
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
              {isMulti && !revealed ? (
                <Pressable onPress={() => judge(picked)} disabled={!picked} style={[styles.revealBtn, !picked && { opacity: 0.5 }]}>
                  <Text style={{ color: colors.brand, fontWeight: "700" }}>对答案</Text>
                </Pressable>
              ) : null}
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
          {i >= list.length - 1 ? (
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/(student)/practice" as any))} style={styles.nextBtn}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>完成练习</Text>
            </Pressable>
          ) : (
            <Pressable onPress={next} style={styles.nextBtn}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>下一题</Text>
            </Pressable>
          )}
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
  optionSel: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  ok: { borderColor: colors.ok, backgroundColor: colors.brandSoft },
  bad: { borderColor: colors.danger, backgroundColor: "#fdecea" },
  badge: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#eef2f0", alignItems: "center", justifyContent: "center" },
  revealBtn: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand },
  analysis: { backgroundColor: "#fff", borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  footer: { padding: space.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "#fff" },
  nextBtn: { height: 48, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
});
