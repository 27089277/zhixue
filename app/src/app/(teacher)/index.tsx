import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { currentProfile, visibleClasses } from "@/store/permissions";
import { Card, Screen, SectionTitle } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

export default function TeacherHome() {
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
      <View style={{ flexDirection: "row", gap: space.md }}>
        <Card style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 24 }}>🧩</Text>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>组卷中心</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 24 }}>🤖</Text>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>AI 出题</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 24 }}>✍️</Text>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>去批改</Text>
        </Card>
      </View>
    </Screen>
  );
}
