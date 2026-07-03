import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { buildPool } from "@/lib/pool";
import { publicBankQuestions, publicRealPapers } from "@/lib/practice";
import { generateStudentPractice } from "@/lib/studentAi";
import { Card, Empty, Screen, SectionTitle, Tag } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

// 自主练习：题源只来自 公共题库 + 公开真题卷 + 学生自己的 AI 私有题。
// 顶部一句话 AI 出题（同 Web 输入框）→ 生成学生私有题 → 直接刷题；错题进自己的错题本。
export default function Practice() {
  const router = useRouter();
  const questions = useStore((s) => s.questions);
  const papers = useStore((s) => s.papers);
  const mine = useStore((s) => s.myPracticeQuestions);

  const pool = useMemo(
    () => buildPool(publicBankQuestions(questions), publicRealPapers(papers), mine),
    [questions, papers, mine]
  );

  const [nl, setNl] = useState("");
  const [busy, setBusy] = useState(false);

  async function runAi() {
    if (!nl.trim()) return Alert.alert("提示", "说一句你想练什么，如：给我来 5 道二次函数的中档单选题");
    setBusy(true);
    try {
      const qs = await generateStudentPractice(nl.trim());
      setNl("");
      Alert.alert("已生成", `AI 为你出了 ${qs.length} 道题（仅你可见），开始练习`, [
        { text: "去练习", onPress: () => router.push("/drill?mine=1") },
      ]);
    } catch (e: any) {
      Alert.alert("失败", e?.message || "AI 出题失败");
    } finally {
      setBusy(false);
    }
  }

  const bySubject = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    pool.forEach((q) => {
      if (!map.has(q.subject)) map.set(q.subject, new Map());
      const m = map.get(q.subject)!;
      m.set(q.point, (m.get(q.point) || 0) + 1);
    });
    return [...map.entries()];
  }, [pool]);

  return (
    <Screen>
      {/* 一句话 AI 出题 */}
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="sparkles" size={18} color={colors.brand} />
          <Text style={{ fontWeight: "800", color: colors.ink }}>AI 出题练习</Text>
          <Tag text="仅自己可见" />
        </View>
        <TextInput
          style={[st.input, busy && st.locked]}
          editable={!busy}
          placeholder="例如：给我来 5 道二次函数的中档单选题"
          value={nl}
          onChangeText={setNl}
        />
        <Pressable disabled={busy} onPress={runAi} style={[st.go, busy && { opacity: 0.6 }]}>
          {busy ? <ActivityIndicator color="#fff" /> : <Ionicons name="sparkles" size={16} color="#fff" />}
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>{busy ? "AI 出题中…" : "AI 出题并练习"}</Text>
        </Pressable>
      </Card>

      <SectionTitle title="知识点练习" extra={<Tag text={`${pool.length} 题`} />} />
      {bySubject.length ? (
        bySubject.map(([subject, points]) => (
          <Card key={subject}>
            <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink, marginBottom: space.sm }}>
              {subject}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[...points.entries()].map(([pt, n]) => (
                <Pressable
                  key={pt}
                  onPress={() => router.push(`/drill?subject=${encodeURIComponent(subject)}&point=${encodeURIComponent(pt)}`)}
                  style={{ backgroundColor: colors.brandSoft, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
                >
                  <Text style={{ color: colors.brand, fontSize: font.sub, fontWeight: "600" }}>
                    {pt} · {n}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        ))
      ) : (
        <Empty text="公共题库暂无可练题目，先用上面的「AI 出题」给自己出几道，或让老师把真题设为公开" />
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  input: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12, fontSize: font.body, color: colors.ink },
  locked: { backgroundColor: "#f1f4f2", color: colors.muted },
  go: { flexDirection: "row", gap: 8, height: 46, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
});
