import { useMemo } from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useStore } from "@/store/useStore";
import { Card, Empty, Screen, SectionTitle, Stars, Tag } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

// 练习（融合菁优网）：按知识点/学科浏览题库 + 组卷刷题。v1 从题库聚合知识点。
export default function Practice() {
  const router = useRouter();
  const questions = useStore((s) => s.questions);

  const bySubject = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    questions.forEach((q) => {
      const subj = q.subject || "综合";
      const pt = q.point || "其它";
      if (!map.has(subj)) map.set(subj, new Map());
      const m = map.get(subj)!;
      m.set(pt, (m.get(pt) || 0) + 1);
    });
    return [...map.entries()];
  }, [questions]);

  return (
    <Screen>
      <SectionTitle title="知识点练习" extra={<Tag text={`${questions.length} 题`} />} />
      {bySubject.length ? (
        bySubject.map(([subject, points]) => (
          <Card key={subject}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink }}>{subject}</Text>
              <Stars n={3} />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: space.sm }}>
              {[...points.entries()].map(([pt, n]) => (
                <Pressable
                  key={pt}
                  onPress={() => router.push(`/drill?subject=${encodeURIComponent(subject)}&point=${encodeURIComponent(pt)}`)}
                  style={{ backgroundColor: colors.brandSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}
                >
                  <Text style={{ color: colors.brand, fontSize: font.cap, fontWeight: "600" }}>
                    {pt} · {n}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        ))
      ) : (
        <Empty text="题库为空，等老师发布或 AI 生成后即可练习" />
      )}
    </Screen>
  );
}
