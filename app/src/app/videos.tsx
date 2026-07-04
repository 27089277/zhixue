import { useMemo } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { absUrl } from "@/api/client";
import { colors, font, radius, space } from "@/theme/tokens";

// 讲解视频：列出题目/试卷关联的讲解视频（学生交卷后可看）。
export default function Videos() {
  const router = useRouter();
  const s = useStore();
  // 汇总来源：store.videos + 试卷题目里带视频的
  const items = useMemo(() => {
    const out: { key: string; title: string; sub: string; url?: string }[] = [];
    s.videos.forEach((v: any, i) => out.push({ key: `v${v.id ?? i}`, title: v.title || v.name, sub: `${v.point || "讲解"} · ${v.status || ""}`, url: v.url || v.src }));
    s.papers.forEach((p) => (p.items || []).forEach((it) => {
      if (it.videoUrl || it.videoName) out.push({ key: `${p.id}-${it.no}`, title: it.videoName || `${p.title} 第${it.no}题讲解`, sub: `${p.title} · 第${it.no}题`, url: it.videoUrl });
    }));
    return out;
  }, [s.videos, s.papers]);

  function openVideo(url?: string) {
    if (!url) return Alert.alert("暂无成片", "该讲解还是脚本草稿，老师上传成片后即可播放");
    Linking.openURL(absUrl(url)).catch(() => Alert.alert("无法播放", "视频地址打不开"));
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Ionicons name="chevron-back" size={26} color={colors.ink} /></Pressable>
        <Text style={styles.headerTitle}>讲解视频</Text>
        <Text style={{ color: colors.muted, fontSize: font.sub }}>{items.length}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 40 }}>
        {items.length ? items.map((v) => (
          <Pressable key={v.key} style={styles.card} onPress={() => openVideo(v.url)}>
            <View style={styles.thumb}><Ionicons name={v.url ? "play-circle" : "document-text-outline"} size={34} color={colors.brand} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: colors.ink }} numberOfLines={2}>{v.title}</Text>
              <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 2 }}>{v.sub}{v.url ? "" : " · 脚本"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        )) : <Text style={{ color: colors.muted, textAlign: "center", marginTop: 40 }}>暂无讲解视频</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink },
  card: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12 },
  thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" },
});
