import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { currentProfile, visibleClasses } from "@/store/permissions";
import { RichText } from "@/components/RichText";
import { colors, font, radius, space } from "@/theme/tokens";
import type { Assignment } from "@/types";

const DEADLINES = [
  { label: "今天", days: 0 },
  { label: "3 天后", days: 3 },
  { label: "7 天后", days: 7 },
  { label: "2 周后", days: 14 },
];
const LIMITS = [
  { label: "不限时", v: null as number | null },
  { label: "45 分钟", v: 45 },
  { label: "60 分钟", v: 60 },
  { label: "90 分钟", v: 90 },
];

// 试卷详情：老师=预览 + 发布作业；学生=去作答。
export default function PaperDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const s = useStore();
  const paper = useMemo(() => s.papers.find((p) => p.id === id), [s.papers, id]);
  const isTeacher = s.role === "teacher";
  const classes = visibleClasses(s);

  const [className, setClassName] = useState(classes[0]?.name || "");
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [limit, setLimit] = useState<number | null>(45);
  const [busy, setBusy] = useState(false);

  if (!paper) {
    return (
      <SafeAreaView style={styles.screen}><Text style={{ padding: 20, color: colors.muted }}>试卷不存在</Text></SafeAreaView>
    );
  }

  function publish() {
    if (!className) return Alert.alert("提示", "请选择班级");
    const d = new Date(Date.now() + deadlineDays * 86400000);
    const deadline = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T22:00`;
    const a: Assignment = {
      id: `asg-${Date.now()}`,
      title: paper!.title,
      paperId: paper!.id,
      className,
      deadline,
      status: "进行中",
      createdAt: Date.now(),
      kind: "作业",
      mode: "paper",
      timeLimit: limit,
      allowRedo: false,
    };
    setBusy(true);
    try {
      s.addAssignment(a);
      Alert.alert("发布成功", `已发布《${paper!.title}》到 ${className}`, [{ text: "好", onPress: () => router.back() }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Ionicons name="chevron-back" size={26} color={colors.ink} /></Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{isTeacher ? "试卷预览" : paper.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 40 }}>
        <View style={styles.card}>
          <Text style={{ fontSize: font.h2, fontWeight: "800", color: colors.ink }}>{paper.title}</Text>
          <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 4 }}>
            {paper.subject} · {paper.questions} 题 · {paper.score} 分 · {paper.duration} 分钟
          </Text>
        </View>

        {/* 老师：发布作业 */}
        {isTeacher && (
          <View style={styles.card}>
            <Text style={{ fontWeight: "800", color: colors.ink, marginBottom: 8 }}>发布作业</Text>
            <Label>班级</Label>
            <Row>{classes.map((c) => <Chip key={c.name} label={c.name} on={className === c.name} onPress={() => setClassName(c.name)} />)}</Row>
            <Label>截止</Label>
            <Row>{DEADLINES.map((d) => <Chip key={d.days} label={d.label} on={deadlineDays === d.days} onPress={() => setDeadlineDays(d.days)} />)}</Row>
            <Label>限时</Label>
            <Row>{LIMITS.map((l) => <Chip key={l.label} label={l.label} on={limit === l.v} onPress={() => setLimit(l.v)} />)}</Row>
            <Pressable disabled={busy} onPress={publish} style={[styles.pub, busy && { opacity: 0.6 }]}>
              <Ionicons name="paper-plane" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>发布到班级</Text>
            </Pressable>
          </View>
        )}

        {/* 学生：去作答 */}
        {!isTeacher && (
          <Pressable onPress={() => router.replace(`/exam/${paper.id}`)} style={styles.pub}>
            <Ionicons name="create" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>开始作答</Text>
          </Pressable>
        )}

        {/* 题目预览（含答案，供老师校对） */}
        <Text style={{ fontWeight: "700", color: colors.ink, marginTop: space.sm }}>题目预览（{paper.items.length}）</Text>
        {paper.items.map((it) => (
          <View key={it.no} style={styles.card}>
            <Text style={{ color: colors.muted, fontSize: font.cap }}>第 {it.no} 题 · {it.type} · {it.score} 分</Text>
            <RichText html={it.title} />
            {(it.choices || []).map((c, i) => (
              <Text key={i} style={{ color: colors.sub, fontSize: font.sub }}>{String.fromCharCode(65 + i)}. {c.replace(/<[^>]+>/g, "")}</Text>
            ))}
            {it.answer ? <Text style={{ color: colors.ok, fontSize: font.sub, marginTop: 2 }}>答案：{it.answer}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: font.cap, color: colors.sub, marginTop: 8, marginBottom: 4 }}>{children}</Text>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{children}</View>;
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
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  pub: { flexDirection: "row", gap: 8, height: 50, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
});
