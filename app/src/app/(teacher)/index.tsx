import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@/store/useStore";
import { currentProfile, visibleClasses } from "@/store/permissions";
import { Card, Screen, SectionTitle } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

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
        {[
          { icon: "🧩", label: "组卷中心", to: "/compose?mode=paper" },
          { icon: "🤖", label: "AI 出题", to: "/compose?mode=questions" },
          { icon: "📮", label: "发布作业", to: "/(teacher)/bank" },
          { icon: "✍️", label: "去批改", to: "/(teacher)/grading" },
          { icon: "📖", label: "题库浏览", to: "/bank-questions" },
          { icon: "🎬", label: "讲解视频", to: "/videos" },
        ].map((q) => (
          <Card key={q.label} style={{ width: "30%", alignItems: "center", gap: 6 }} onPress={() => router.push(q.to as any)}>
            <Text style={{ fontSize: 24 }}>{q.icon}</Text>
            <Text style={{ color: colors.ink, fontWeight: "600", fontSize: font.sub }}>{q.label}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
