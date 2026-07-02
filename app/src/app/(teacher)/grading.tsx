import { useStore } from "@/store/useStore";
import { Card, Screen, SectionTitle, Tag, Empty } from "@/components/ui";
import { Text } from "react-native";
import { colors, font } from "@/theme/tokens";

export default function TeacherGrading() {
  const subs = useStore((s) => s.submissions);
  const pending = subs.filter((x) => !x.gradedAt);
  const graded = subs.filter((x) => x.gradedAt);
  return (
    <Screen>
      <SectionTitle title="批改" extra={<Tag text={`待批 ${pending.length}`} tone="warn" />} />
      {subs.length ? (
        subs.map((x) => (
          <Card key={x.id}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>{x.studentName || "学生"}</Text>
            <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>
              {x.gradedAt ? `已批改 · 最终 ${x.finalScore ?? x.score} 分` : `待批改 · 客观 ${x.score}/${x.objectiveTotal}`}
            </Text>
          </Card>
        ))
      ) : (
        <Empty text="暂无学生答卷（学生答题后出现，支持手写红笔批注）" />
      )}
      {graded.length ? null : null}
    </Screen>
  );
}
