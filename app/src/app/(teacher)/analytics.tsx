import { useMemo } from "react";
import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { Card, Screen, SectionTitle, Empty } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";
import type { SubmissionRecord } from "@/types";

export default function TeacherAnalytics() {
  const s = useStore();

  const pctOf = (sub: SubmissionRecord, total?: number) => {
    const t = total || sub.objectiveTotal || 0;
    const got = sub.finalScore ?? sub.score;
    return t ? Math.round((got / t) * 100) : 0;
  };

  const tests = useMemo(() => {
    const g = new Map<string, SubmissionRecord[]>();
    s.submissions.forEach((x) => g.set(x.paperId, [...(g.get(x.paperId) || []), x]));
    return [...g.entries()].map(([pid, arr]) => {
      const paper = s.papers.find((p) => p.id === pid);
      const pcts = arr.map((x) => pctOf(x, paper?.score));
      const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
      const pass = pcts.length ? Math.round((pcts.filter((p) => p >= 60).length / pcts.length) * 100) : 0;
      return { pid, title: paper?.title || pid, count: arr.length, avg, pass };
    });
  }, [s.submissions, s.papers]);

  const allPcts = s.submissions.map((x) => pctOf(x, s.papers.find((p) => p.id === x.paperId)?.score));
  const avgAll = allPcts.length ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : 0;

  return (
    <Screen>
      <SectionTitle title="学情总览" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
        {[
          { l: "测验场次", v: tests.length },
          { l: "答卷份数", v: s.submissions.length },
          { l: "平均得分率", v: `${avgAll}%` },
        ].map((k) => (
          <Card key={k.l} style={{ width: "31%" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.brand }}>{k.v}</Text>
            <Text style={{ color: colors.sub, fontSize: font.cap }}>{k.l}</Text>
          </Card>
        ))}
      </View>

      <SectionTitle title="各测验表现" />
      {tests.length ? (
        tests.map((t) => (
          <Card key={t.pid} style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700", color: colors.ink, flex: 1 }} numberOfLines={1}>{t.title}</Text>
              <Text style={{ color: colors.sub, fontSize: font.sub }}>参与 {t.count}</Text>
            </View>
            {/* 平均得分率条 */}
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${t.avg}%`, backgroundColor: t.avg >= 60 ? colors.brand : colors.warn }]} />
            </View>
            <Text style={{ color: colors.sub, fontSize: font.cap }}>平均得分率 {t.avg}% · 及格率 {t.pass}%</Text>
          </Card>
        ))
      ) : (
        <Empty text="学生答卷后按测验汇总（含均分/及格率条形图）" />
      )}
    </Screen>
  );
}

const styles = {
  barBg: { height: 10, borderRadius: 999, backgroundColor: "#eef2f0", overflow: "hidden" as const },
  barFill: { height: 10, borderRadius: 999 },
};
