import { useMemo } from "react";
import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { Card, Screen, SectionTitle, Empty } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

export default function TeacherAnalytics() {
  const s = useStore();
  const tests = useMemo(() => {
    const byPaper = new Map<string, number>();
    s.submissions.forEach((x) => byPaper.set(x.paperId, (byPaper.get(x.paperId) || 0) + 1));
    return [...byPaper.entries()];
  }, [s.submissions]);

  return (
    <Screen>
      <SectionTitle title="学情分析" />
      <View style={{ flexDirection: "row", gap: space.md }}>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.brand }}>{tests.length}</Text>
          <Text style={{ color: colors.sub, fontSize: font.sub }}>测验场次</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.brand }}>{s.submissions.length}</Text>
          <Text style={{ color: colors.sub, fontSize: font.sub }}>答卷份数</Text>
        </Card>
      </View>
      {tests.length ? (
        tests.map(([pid, n]) => {
          const paper = s.papers.find((p) => p.id === pid);
          return (
            <Card key={pid}>
              <Text style={{ fontWeight: "700", color: colors.ink }}>{paper?.title || pid}</Text>
              <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>参与 {n} 人</Text>
            </Card>
          );
        })
      ) : (
        <Empty text="暂无数据，学生答卷后按测验汇总+下钻（图表建设中）" />
      )}
    </Screen>
  );
}
