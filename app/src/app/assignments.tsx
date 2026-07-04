import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { visibleClasses } from "@/store/permissions";
import { Tag } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

// 老师·作业完成情况：每份已发布作业的提交进度（已交/应交、待批），点开看学生名单并去批改。
export default function Assignments() {
  const router = useRouter();
  const s = useStore();
  const classNames = new Set(visibleClasses(s).map((c) => c.name));
  const classSize = (name: string) => visibleClasses(s).find((c) => c.name === name)?.count || 0;

  const list = useMemo(
    () => s.assignments.filter((a) => !a.className || classNames.has(a.className)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.assignments]
  );
  const [open, setOpen] = useState<string | null>(list[0]?.id || null);

  const paperTitle = (pid: string) => s.papers.find((p) => p.id === pid)?.title || pid;
  const subsOf = (paperId: string) => s.submissions.filter((x) => x.paperId === paperId);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/(teacher)" as any))} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>作业完成情况</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 40 }}>
        {list.length ? (
          list.map((a) => {
            const subs = subsOf(a.paperId);
            const graded = subs.filter((x) => x.gradedAt).length;
            const pending = subs.length - graded;
            const total = classSize(a.className) || subs.length;
            const expanded = open === a.id;
            return (
              <View key={a.id} style={styles.card}>
                <Pressable onPress={() => setOpen(expanded ? null : a.id)} style={{ gap: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink, flex: 1 }} numberOfLines={1}>{a.title}</Text>
                    <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
                  </View>
                  <Text style={{ color: colors.sub, fontSize: font.sub }}>
                    {a.className} · 截止 {(a.deadline || "").replace("T", " ")}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    <Tag text={`已交 ${subs.length}${total ? "/" + total : ""}`} tone="brand" />
                    {pending > 0 && <Tag text={`待批 ${pending}`} tone="warn" />}
                    {subs.length > 0 && pending === 0 && <Tag text="已全部批改" tone="muted" />}
                  </View>
                </Pressable>

                {expanded && (
                  <View style={{ marginTop: 10, gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 }}>
                    {subs.length ? (
                      subs.map((x) => (
                        <Pressable key={x.id} onPress={() => router.push(`/grade/${x.id}`)} style={styles.subRow}>
                          <Text style={{ color: colors.ink, fontWeight: "600", flex: 1 }}>{x.studentName || "学生"}</Text>
                          {x.gradedAt ? (
                            <Text style={{ color: colors.ok, fontWeight: "700", fontSize: font.sub }}>{x.finalScore ?? x.score} 分</Text>
                          ) : (
                            <Tag text={`待批 · 客观${x.score}`} tone="warn" />
                          )}
                          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                        </Pressable>
                      ))
                    ) : (
                      <Text style={{ color: colors.muted, fontSize: font.sub, paddingVertical: 6 }}>还没有学生提交</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <Ionicons name="document-text-outline" size={40} color={colors.muted} />
            <Text style={{ color: colors.muted, marginTop: 10 }}>还没有发布作业，去题库选一份试卷发布</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
});
