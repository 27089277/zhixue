import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { visibleQuestions } from "@/store/permissions";
import { Card, Screen, SectionTitle } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

function Row({ icon, title, desc }: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={20} color={colors.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>{title}</Text>
        <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </View>
  );
}

export default function TeacherBank() {
  const router = useRouter();
  const s = useStore();
  return (
    <Screen>
      <SectionTitle title="题库 / 试卷" />
      <View style={{ flexDirection: "row", gap: space.md }}>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.brand }}>{visibleQuestions(s).length}</Text>
          <Text style={{ color: colors.sub, fontSize: font.sub }}>题目</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.brand }}>{s.papers.length}</Text>
          <Text style={{ color: colors.sub, fontSize: font.sub }}>试卷</Text>
        </Card>
      </View>

      <Card onPress={() => router.push("/bank-questions")}>
        <Row icon="book-outline" title="题库浏览" desc="按知识点筛选 · 难度星级 · 相似题推荐" />
      </Card>

      <SectionTitle title="智能生成" />
      <Card onPress={() => router.push("/compose?mode=paper")}>
        <Row icon="albums-outline" title="组卷中心（结构化）" desc="按 知识点 + 题型 + 难度 + 数量 一键组卷" />
      </Card>
      <Card onPress={() => router.push("/compose?mode=questions")}>
        <Row icon="sparkles-outline" title="AI 出题" desc="DeepSeek 生成真题，直接入题库" />
      </Card>

      <SectionTitle title="试卷库" />
      {s.papers.length ? (
        s.papers.slice(0, 12).map((p) => (
          <Card key={p.id} onPress={() => router.push(`/paper/${p.id}`)}>
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
