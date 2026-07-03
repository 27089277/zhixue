import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@/store/useStore";
import { RichText } from "@/components/RichText";
import { Card, Empty, Screen, SectionTitle, Tag } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

interface WrongRow {
  key: string;
  source: string; // 来源标签：试卷标题 / 自主练习 / AI 自练
  tone: "brand" | "warn" | "muted";
  stem: string;
  mine: string;
  answer: string;
  analysis?: string;
  point?: string;
  redo: () => void;
}

// 错题本：聚合 ①作业/真题交卷判错 ②自主练习判错 ③AI 自练判错，全部归学生本人。
export default function Mistakes() {
  const s = useStore();
  const router = useRouter();

  const rows = useMemo<WrongRow[]>(() => {
    const out: WrongRow[] = [];
    // ① 交卷答卷派生（本人）
    const me = s.currentUserPhone;
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
              source: paper.title,
              tone: "brand",
              stem: it.title,
              mine: String(val),
              answer: it.answer,
              analysis: it.analysis,
              point: (it.knowledge || [])[0],
              redo: () => router.push(`/exam/${paper.id}`),
            });
          }
        });
      });
    // ② / ③ 自主练习 + AI 自练
    s.practiceWrong.forEach((w) => {
      out.push({
        key: w.key,
        source: w.origin === "student-ai" ? "AI 自练" : "自主练习",
        tone: w.origin === "student-ai" ? "warn" : "muted",
        stem: w.stem,
        mine: w.mine,
        answer: w.answer,
        analysis: w.analysis,
        point: w.point,
        redo: () =>
          w.origin === "student-ai"
            ? router.push("/drill?mine=1")
            : router.push(`/drill?subject=${encodeURIComponent(w.subject)}&point=${encodeURIComponent(w.point)}`),
      });
    });
    return out;
  }, [s.submissions, s.papers, s.currentUserPhone, s.practiceWrong, router]);

  return (
    <Screen>
      <SectionTitle title="错题本" extra={<Tag text={`${rows.length} 题`} tone="warn" />} />
      {rows.length ? (
        rows.map((w) => (
          <Card key={w.key} style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: colors.muted, fontSize: font.cap }} numberOfLines={1}>{w.source}</Text>
              {w.point ? <Tag text={w.point} tone={w.tone} /> : null}
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
            <Pressable onPress={w.redo} style={{ alignSelf: "flex-start" }}>
              <Text style={{ color: colors.brand, fontWeight: "700", fontSize: font.sub }}>重做 →</Text>
            </Pressable>
          </Card>
        ))
      ) : (
        <Empty text="暂无错题：作业/真题交卷、自主练习、AI 自练中做错的题会自动收录" />
      )}
    </Screen>
  );
}
