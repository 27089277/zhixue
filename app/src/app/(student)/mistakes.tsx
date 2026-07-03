import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@/store/useStore";
import { RichText } from "@/components/RichText";
import { Card, Empty, Screen, SectionTitle, Tag } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

// 错题本（融合菁优网）：从本人答卷推导错题，展示你的答案/正确答案/解析 + 重做本卷。
export default function Mistakes() {
  const s = useStore();
  const router = useRouter();
  const wrong = useMemo(() => {
    const me = s.currentUserPhone;
    const out: { key: string; paperId: string; paperTitle: string; stem: string; mine: string; answer: string; analysis?: string; point?: string }[] = [];
    s.submissions
      .filter((x) => x.studentPhone === me)
      .forEach((sub) => {
        const paper = s.papers.find((p) => p.id === sub.paperId);
        if (!paper) return;
        paper.items.forEach((it) => {
          if (it.type === "解答题") return;
          const e = (sub.answers || {})[it.no] as any;
          const val = typeof e === "string" ? e : e?.value;
          if (val && String(val).trim() !== String(it.answer).trim()) {
            out.push({
              key: `${sub.id}-${it.no}`,
              paperId: paper.id,
              paperTitle: paper.title,
              stem: it.title,
              mine: String(val),
              answer: it.answer,
              analysis: it.analysis,
              point: (it.knowledge || [])[0],
            });
          }
        });
      });
    return out;
  }, [s.submissions, s.papers, s.currentUserPhone]);

  return (
    <Screen>
      <SectionTitle title="错题本" extra={<Tag text={`${wrong.length} 题`} tone="warn" />} />
      {wrong.length ? (
        wrong.map((w) => (
          <Card key={w.key} style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: colors.muted, fontSize: font.cap }}>{w.paperTitle}</Text>
              {w.point ? <Tag text={w.point} /> : null}
            </View>
            <RichText html={w.stem} />
            <Text style={{ fontSize: font.sub }}>
              你的答案：<Text style={{ color: colors.danger }}>{w.mine}</Text>　正确：
              <Text style={{ color: colors.ok }}>{w.answer}</Text>
            </Text>
            {w.analysis ? (
              <View style={{ backgroundColor: colors.brandSoft, borderRadius: radius.sm, padding: 10 }}>
                <Text style={{ color: colors.sub, fontSize: font.cap, fontWeight: "700", marginBottom: 2 }}>解析</Text>
                <RichText html={w.analysis} style={{ fontSize: font.sub }} />
              </View>
            ) : null}
            <Pressable onPress={() => router.push(`/exam/${w.paperId}`)} style={{ alignSelf: "flex-start" }}>
              <Text style={{ color: colors.brand, fontWeight: "700", fontSize: font.sub }}>重做本卷 →</Text>
            </Pressable>
          </Card>
        ))
      ) : (
        <Empty text="暂无错题：交卷后做错的客观题会自动收录，可在此重做" />
      )}
    </Screen>
  );
}
