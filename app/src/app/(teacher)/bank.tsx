import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { Card, Screen, SectionTitle, Tag } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

// 题库（融合菁优网知识点体系 + 你的 AI/组卷）—— v1 概览，深度浏览/组卷后续。
export default function TeacherBank() {
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

      <SectionTitle title="组卷方式" />
      <Card style={{ gap: 4 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>🧩 结构化组卷（菁优网式）</Text>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>按 知识点 + 题型 + 难度 + 数量 一键组卷</Text>
      </Card>
      <Card style={{ gap: 4 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>🤖 AI 组卷 / 出题</Text>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>自然语言描述，DeepSeek 生成真题</Text>
        <Tag text="建设中" tone="warn" />
      </Card>
    </Screen>
  );
}
