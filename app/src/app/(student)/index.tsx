import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { currentProfile } from "@/store/permissions";
import { Card, Screen, SectionTitle, Tag } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

export default function StudentHome() {
  const s = useStore();
  const me = currentProfile(s);
  // 我的待办作业（后端 hydrate 后的 assignments）
  const myAssignments = s.assignments.slice(0, 5);

  return (
    <Screen>
      <View style={{ marginBottom: space.sm }}>
        <Text style={{ fontSize: font.h1, fontWeight: "800", color: colors.ink }}>
          你好，{me.name}
        </Text>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>{me.scope}</Text>
      </View>

      {/* 快捷入口（融合菁优网：专题/组卷刷题） */}
      <View style={{ flexDirection: "row", gap: space.md }}>
        <Card style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 24 }}>📚</Text>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>知识点练习</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 24 }}>📝</Text>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>我的作业</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 24 }}>❌</Text>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>错题重做</Text>
        </Card>
      </View>

      <SectionTitle title="待完成作业" extra={<Tag text={`${myAssignments.length} 项`} />} />
      {myAssignments.length ? (
        myAssignments.map((a) => (
          <Card key={a.id}>
            <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink }}>{a.title}</Text>
            <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 4 }}>
              {a.className} · 截止 {(a.deadline || "").replace("T", " ")}
            </Text>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={{ color: colors.muted }}>暂无作业，去「练习」自主刷题吧</Text>
        </Card>
      )}
    </Screen>
  );
}
