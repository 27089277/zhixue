import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { Card, Screen, SectionTitle } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

export default function TeacherBank() {
  const router = useRouter();
  const s = useStore();
  return (
    <Screen>
      <SectionTitle title="题库 / 试卷" />
      <View style={{ flexDirection: "row", gap: space.md }}>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.brand }}>{s.questions.length}</Text>
          <Text style={{ color: colors.sub, fontSize: font.sub }}>题目</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.brand }}>{s.papers.length}</Text>
          <Text style={{ color: colors.sub, fontSize: font.sub }}>试卷</Text>
        </Card>
      </View>

      <SectionTitle title="智能生成" />
      <Card onPress={() => router.push("/compose?mode=paper")} style={{ gap: 4 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>🧩 组卷中心（结构化）</Text>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>按 知识点 + 题型 + 难度 + 数量 一键组卷</Text>
      </Card>
      <Card onPress={() => router.push("/compose?mode=questions")} style={{ gap: 4 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>🤖 AI 出题</Text>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>DeepSeek 生成真题，直接入题库</Text>
      </Card>

      <SectionTitle title="试卷库" />
      {s.papers.length ? (
        s.papers.slice(0, 12).map((p) => (
          <Card key={p.id} onPress={() => router.push(`/exam/${p.id}`)}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>{p.title}</Text>
            <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>
              {p.subject} · {p.questions} 题 · {p.score} 分
            </Text>
          </Card>
        ))
      ) : (
        <Card><Text style={{ color: colors.muted }}>还没有试卷，去「组卷中心」生成一套</Text></Card>
      )}
    </Screen>
  );
}
