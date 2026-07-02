import { useRouter } from "expo-router";
import { useStore } from "@/store/useStore";
import { Card, Screen, SectionTitle, Tag, Empty } from "@/components/ui";
import { Text, View } from "react-native";
import { colors, font } from "@/theme/tokens";

export default function TeacherGrading() {
  const router = useRouter();
  const subs = useStore((s) => s.submissions);
  const papers = useStore((s) => s.papers);
  const pending = subs.filter((x) => !x.gradedAt);
  const graded = subs.filter((x) => x.gradedAt);
  const title = (pid: string) => papers.find((p) => p.id === pid)?.title || pid;

  return (
    <Screen>
      <SectionTitle title="待批改" extra={<Tag text={`${pending.length}`} tone="warn" />} />
      {pending.length ? (
        pending.map((x) => (
          <Card key={x.id} onPress={() => router.push(`/grade/${x.id}`)}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "700", color: colors.ink }}>{x.studentName || "学生"}</Text>
              <Tag text="去批改" />
            </View>
            <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>
              {title(x.paperId)} · 客观 {x.score}/{x.objectiveTotal} · 主观 {x.pendingManual} 题待批
            </Text>
          </Card>
        ))
      ) : (
        <Empty text="暂无待批答卷" />
      )}

      <SectionTitle title="已批改" extra={<Tag text={`${graded.length}`} />} />
      {graded.map((x) => (
        <Card key={x.id} onPress={() => router.push(`/grade/${x.id}`)}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>{x.studentName || "学生"}</Text>
            <Text style={{ color: colors.ok, fontWeight: "700", fontSize: font.sub }}>{x.finalScore ?? x.score} 分</Text>
          </View>
          <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>{title(x.paperId)}</Text>
        </Card>
      ))}
    </Screen>
  );
}
