import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { RichText } from "@/components/RichText";
import { Card } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

export default function GradeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const s = useStore();
  const record = useMemo(() => s.submissions.find((x) => x.id === id), [s.submissions, id]);
  const paper = useMemo(() => s.papers.find((p) => p.id === record?.paperId), [s.papers, record]);

  const subjective = (paper?.items || []).filter((it) => it.type === "解答题");
  const maxManual = (paper?.score ?? 0) - (record?.objectiveTotal ?? 0);
  const [score, setScore] = useState(String(record?.manualScore ?? 0));
  const [feedback, setFeedback] = useState(record?.feedback || "请补充关键步骤，注意书写完整。");
  const [busy, setBusy] = useState(false);

  if (!record || !paper) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20, color: colors.muted }}>找不到该答卷</Text>
      </SafeAreaView>
    );
  }

  const answerOf = (no: number) => {
    const e = (record.answers || {})[no] as any;
    return typeof e === "string" ? e : e?.value;
  };

  function submit(returned: boolean) {
    const n = Math.min(maxManual, Math.max(0, Number(score) || 0));
    setBusy(true);
    try {
      s.gradeSubmission(record!.id, n, feedback, returned);
      Alert.alert("完成", returned ? "已退回学生修改" : `批改已提交，最终 ${(record!.score ?? 0) + n} 分`);
      router.back();
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
        <Text style={styles.headerTitle} numberOfLines={1}>{record.studentName || "学生"} · {paper.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40, gap: space.md }}>
        <Card>
          <Text style={{ color: colors.sub, fontSize: font.sub }}>
            客观题 {record.score}/{record.objectiveTotal} 分 · 主观题满分 {maxManual} 分
          </Text>
        </Card>

        {subjective.length ? (
          subjective.map((it) => (
            <Card key={it.no} style={{ gap: 6 }}>
              <Text style={{ fontWeight: "800", color: colors.ink }}>第 {it.no} 题 · {it.score} 分</Text>
              <RichText html={it.title} />
              <View style={styles.ans}>
                <Text style={{ color: colors.sub, fontSize: font.cap, fontWeight: "700" }}>学生作答</Text>
                <Text style={{ color: colors.ink, fontSize: font.sub, marginTop: 2 }}>
                  {answerOf(it.no) === "[手写作答]" ? "（手写作答，真机版可查看/红笔批注）" : answerOf(it.no) || "未作答"}
                </Text>
              </View>
              {it.answer ? <Text style={{ color: colors.ok, fontSize: font.sub }}>参考答案：{it.answer}</Text> : null}
            </Card>
          ))
        ) : (
          <Card><Text style={{ color: colors.muted }}>本卷无主观题，客观题已自动判分。</Text></Card>
        )}

        <Text style={styles.label}>主观题得分（满分 {maxManual}）</Text>
        <TextInput style={styles.input} keyboardType="number-pad" value={score} onChangeText={setScore} />
        <Text style={styles.label}>老师评语</Text>
        <TextInput style={[styles.input, { height: 90, textAlignVertical: "top" }]} multiline value={feedback} onChangeText={setFeedback} />

        <View style={{ flexDirection: "row", gap: 12, marginTop: space.sm }}>
          <Pressable disabled={busy} onPress={() => submit(true)} style={[styles.btn, { borderColor: colors.line, backgroundColor: "#fff" }]}>
            <Text style={{ color: colors.sub, fontWeight: "700" }}>退回修改</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => submit(false)} style={[styles.btn, { backgroundColor: colors.brand }]}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>提交批改</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink },
  ans: { backgroundColor: colors.bg, borderRadius: radius.sm, padding: 10 },
  label: { fontSize: font.sub, color: colors.sub, fontWeight: "600", marginTop: space.sm },
  input: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12, fontSize: font.h3, color: colors.ink },
  btn: { flex: 1, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
});
