import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { currentProfile, visibleClasses } from "@/store/permissions";
import { Card, Screen, SectionTitle } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

export default function TeacherHome() {
  const router = useRouter();
  const s = useStore();
  const me = currentProfile(s);
  const classes = visibleClasses(s);
  const studentCount = classes.reduce((n, c) => n + c.count, 0);
  const paperIds = new Set(s.assignments.map((a) => a.paperId));
  const teacherSubs = s.submissions.filter((x) => paperIds.has(x.paperId));
  const pending = teacherSubs.filter((x) => !x.gradedAt).length;

  const kpis = [
    { label: "待批改", value: pending },
    { label: "进行中作业", value: s.assignments.length },
    { label: "我的学生", value: studentCount },
    { label: "题库题量", value: s.questions.length },
  ];

  return (
    <Screen>
      <View style={{ marginBottom: space.sm }}>
        <Text style={{ fontSize: font.h1, fontWeight: "800", color: colors.ink }}>你好，{me.name}</Text>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>{me.scope}</Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
        {kpis.map((k) => (
          <Card key={k.label} style={{ width: "47%" }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: colors.brand }}>{k.value}</Text>
            <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>{k.label}</Text>
          </Card>
        ))}
      </View>

      <SectionTitle title="快捷操作" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
        {QUICK.map((q) => (
          <Pressable
            key={q.label}
            onPress={() => router.push(q.to as any)}
            style={({ pressed }) => [qa.tile, pressed && { opacity: 0.85 }]}
          >
            <View style={qa.iconWrap}>
              <Ionicons name={q.icon} size={22} color={colors.brand} />
            </View>
            <Text style={qa.label} numberOfLines={1}>{q.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const QUICK: { icon: keyof typeof Ionicons.glyphMap; label: string; to: string }[] = [
  { icon: "albums-outline", label: "组卷中心", to: "/compose?mode=paper" },
  { icon: "sparkles-outline", label: "AI 出题", to: "/compose?mode=questions" },
  { icon: "paper-plane-outline", label: "发布作业", to: "/(teacher)/bank" },
  { icon: "create-outline", label: "去批改", to: "/(teacher)/grading" },
  { icon: "book-outline", label: "题库浏览", to: "/bank-questions" },
  { icon: "videocam-outline", label: "讲解视频", to: "/videos" },
];

const qa = StyleSheet.create({
  tile: {
    width: "31%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: space.md,
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: colors.ink, fontWeight: "600", fontSize: font.sub },
});
