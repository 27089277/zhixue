import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { currentProfile, visibleClasses } from "@/store/permissions";
import { loadBootstrap } from "@/api/bootstrap";
import { Card, Screen, SectionTitle, Tag } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

export default function StudentHome() {
  const router = useRouter();
  const s = useStore();
  const me = currentProfile(s);
  // 显示发给「本班」的作业；班级信息未加载时兜底显示全部（避免误过滤成空）
  const classNames = visibleClasses(s).map((c) => c.name);
  const myAssignments = (classNames.length
    ? s.assignments.filter((a) => !a.className || classNames.includes(a.className))
    : s.assignments
  ).slice(0, 8);

  // 每次进入首页都向后端刷新一次，老师刚发布的作业无需重启即可看到
  useFocusEffect(
    useCallback(() => {
      loadBootstrap();
    }, [])
  );

  function openPaper(paperId: string) {
    if (!s.papers.some((p) => p.id === paperId)) {
      Alert.alert("暂不可作答", "试卷正在同步，请稍后重进首页刷新");
      return;
    }
    // 已交卷 → 看结果；未交卷 → 进入作答（会自动续做/续时）
    if (s.exam.submitted[paperId]) router.push(`/result/${paperId}`);
    else router.push(`/exam/${paperId}`);
  }

  return (
    <Screen>
      <View style={{ marginBottom: space.sm }}>
        <Text style={{ fontSize: font.h1, fontWeight: "800", color: colors.ink }}>
          你好，{me.name}
        </Text>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>{me.scope}</Text>
      </View>

      {/* 快捷入口 */}
      <View style={{ flexDirection: "row", gap: space.md }}>
        {([
          { icon: "book-outline", label: "知识点练习", to: "/(student)/practice" },
          { icon: "close-circle-outline", label: "错题重做", to: "/(student)/mistakes" },
          { icon: "videocam-outline", label: "讲解视频", to: "/videos" },
        ] as const).map((q) => (
          <Pressable
            key={q.label}
            onPress={() => router.push(q.to as any)}
            style={({ pressed }) => [sqa.tile, pressed && { opacity: 0.85 }]}
          >
            <View style={sqa.iconWrap}>
              <Ionicons name={q.icon} size={22} color={colors.brand} />
            </View>
            <Text style={sqa.label} numberOfLines={1}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="待完成作业" extra={<Tag text={`${myAssignments.length} 项`} />} />
      {myAssignments.length ? (
        myAssignments.map((a) => {
          const done = !!s.exam.submitted[a.paperId];
          const progress = s.papers.find((p) => p.id === a.paperId)?.progress || 0;
          const tag = done ? "查看结果" : progress > 0 ? "继续作答" : "去作答";
          return (
            <Card key={a.id} onPress={() => openPaper(a.paperId)}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink, flex: 1 }}>{a.title}</Text>
                <Tag text={tag} tone={done ? "muted" : "brand"} />
              </View>
              <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 4 }}>
                {a.className} · 截止 {(a.deadline || "").replace("T", " ")}
                {!done && progress > 0 ? ` · 已答 ${progress}%` : ""}
              </Text>
            </Card>
          );
        })
      ) : (
        <Card>
          <Text style={{ color: colors.muted }}>暂无作业，去「练习」自主刷题吧</Text>
        </Card>
      )}
    </Screen>
  );
}

const sqa = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: space.md,
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: colors.ink, fontWeight: "600", fontSize: font.sub },
});
