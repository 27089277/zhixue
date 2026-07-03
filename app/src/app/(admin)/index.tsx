import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { currentProfile } from "@/store/permissions";
import { Card, Screen, SectionTitle } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

export default function AdminHome() {
  const s = useStore();
  const me = currentProfile(s);
  const teachers = s.users.filter((u) => u.role === "教师").length;
  const students = s.users.filter((u) => u.role === "学生").length;
  const kpis = [
    { l: "教师", v: teachers },
    { l: "学生", v: students },
    { l: "班级", v: s.classes.length },
    { l: "题目", v: s.questions.length },
    { l: "试卷", v: s.papers.length },
    { l: "答卷", v: s.submissions.length },
  ];
  return (
    <Screen>
      <View style={{ marginBottom: space.sm }}>
        <Text style={{ fontSize: font.h1, fontWeight: "800", color: colors.ink }}>你好，{me.name}</Text>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>{me.scope}</Text>
      </View>
      <SectionTitle title="校区总览" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
        {kpis.map((k) => (
          <Card key={k.l} style={{ width: "30%" }}>
            <Text style={{ fontSize: 24, fontWeight: "800", color: colors.brand }}>{k.v}</Text>
            <Text style={{ color: colors.sub, fontSize: font.cap }}>{k.l}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
