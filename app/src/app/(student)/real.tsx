import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { loadBootstrap } from "@/api/bootstrap";
import { publicRealPapers } from "@/lib/practice";
import { Card, Empty, Screen, SectionTitle, Tag } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

// 历史真题：整套试卷练习。题源只来自「公开真题卷」（老师/管理员公开 + AI 网络导入 + 预置）。
export default function RealPapers() {
  const router = useRouter();
  const papers = useStore((s) => s.papers);
  const submitted = useStore((s) => s.exam.submitted);
  const real = useMemo(() => publicRealPapers(papers), [papers]);

  // 进入即向后端刷新：老师在 Web 端把某卷设为公共真题后，App 无需重启即可看到
  useFocusEffect(useCallback(() => { loadBootstrap(); }, []));

  const subjects = useMemo(() => ["全部", ...Array.from(new Set(real.map((p) => p.subject)))], [real]);
  const [subject, setSubject] = useState("全部");
  const [kw, setKw] = useState("");

  const list = useMemo(
    () =>
      real.filter(
        (p) =>
          (subject === "全部" || p.subject === subject) &&
          (!kw.trim() || `${p.title}${p.region}${p.year}`.includes(kw.trim()))
      ),
    [real, subject, kw]
  );

  return (
    <Screen>
      <SectionTitle title="历史真题" extra={<Tag text={`${real.length} 套`} />} />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12 }}>
        <Ionicons name="search" size={16} color={colors.muted} />
        <TextInput style={{ flex: 1, paddingVertical: 10, fontSize: font.body, color: colors.ink }} placeholder="搜索：中考 / 物理 / 2025" value={kw} onChangeText={setKw} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {subjects.map((sj) => {
          const on = sj === subject;
          return (
            <Pressable key={sj} onPress={() => setSubject(sj)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: on ? colors.brand : "#fff", borderWidth: 1, borderColor: on ? colors.brand : colors.line }}>
              <Text style={{ color: on ? "#fff" : colors.sub, fontSize: font.sub, fontWeight: "600" }}>{sj}</Text>
            </Pressable>
          );
        })}
      </View>

      {list.length ? (
        list.map((p) => {
          const done = !!submitted[p.id];
          return (
            <Card key={p.id} onPress={() => (done ? router.push(`/result/${p.id}`) : router.push(`/paper/${p.id}`))}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink, flex: 1 }} numberOfLines={2}>{p.title}</Text>
                <Tag text={done ? "查看结果" : "开始练习"} tone={done ? "muted" : "brand"} />
              </View>
              <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 4 }}>
                {p.subject} · {p.year} · {p.region} · {p.questions} 题 · {p.score} 分
              </Text>
            </Card>
          );
        })
      ) : (
        <Empty text="暂无公开真题：老师/管理员把试卷「设为公共真题」或用 AI 联网导入后即可练习" />
      )}
    </Screen>
  );
}
