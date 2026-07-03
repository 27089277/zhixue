import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@/store/useStore";
import { buildPool } from "@/lib/pool";
import { Card, Empty, Screen, SectionTitle, Tag } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

// 练习（融合菁优网）：题目来自 题库 + 各试卷，按 学科 → 知识点 浏览，点知识点进入刷题。
export default function Practice() {
  const router = useRouter();
  const questions = useStore((s) => s.questions);
  const papers = useStore((s) => s.papers);
  const pool = useMemo(() => buildPool(questions, papers), [questions, papers]);

  const bySubject = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    pool.forEach((q) => {
      if (!map.has(q.subject)) map.set(q.subject, new Map());
      const m = map.get(q.subject)!;
      m.set(q.point, (m.get(q.point) || 0) + 1);
    });
    return [...map.entries()];
  }, [pool]);

  return (
    <Screen>
      <SectionTitle title="知识点练习" extra={<Tag text={`${pool.length} 题`} />} />
      {bySubject.length ? (
        bySubject.map(([subject, points]) => (
          <Card key={subject}>
            <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink, marginBottom: space.sm }}>
              {subject}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[...points.entries()].map(([pt, n]) => (
                <Pressable
                  key={pt}
                  onPress={() => router.push(`/drill?subject=${encodeURIComponent(subject)}&point=${encodeURIComponent(pt)}`)}
                  style={{ backgroundColor: colors.brandSoft, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
                >
                  <Text style={{ color: colors.brand, fontSize: font.sub, fontWeight: "600" }}>
                    {pt} · {n}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        ))
      ) : (
        <Empty text="暂无可练习的题目，让老师发布试卷或在题库生成题目后即可练习" />
      )}
    </Screen>
  );
}
