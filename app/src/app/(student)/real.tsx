import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "@/store/useStore";
import { loadBootstrap } from "@/api/bootstrap";
import { publicRealPapers } from "@/lib/practice";
import { importRealPaperFromWeb } from "@/lib/studentAi";
import { Tag } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";
import type { Paper } from "@/types";

// 历史真题（AI 搜索）：先在【公共题库真题】里找；找不到再用 GenAI【联网检索】导入。
// 题库命中的可直接练习；联网导入的为「学生私有卷」，也可直接作答。错题进自己的错题本。
export default function RealPapers() {
  const router = useRouter();
  const papers = useStore((s) => s.papers);
  const submitted = useStore((s) => s.exam.submitted);

  useFocusEffect(useCallback(() => { loadBootstrap(); }, []));

  const [kw, setKw] = useState("");
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [note, setNote] = useState("");
  const [resultIds, setResultIds] = useState<string[]>([]);

  const bank = useMemo(() => publicRealPapers(papers), [papers]);
  // 结果以 id 保存，实时反映 papers/submitted 变化
  const results = useMemo(
    () => resultIds.map((id) => papers.find((p) => p.id === id)).filter(Boolean) as Paper[],
    [resultIds, papers]
  );

  function matchBank(q: string): Paper[] {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return bank.filter((p) => {
      const hay = `${p.title} ${p.subject} ${p.year} ${p.region} ${p.exam}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  async function search() {
    const q = kw.trim();
    if (!q) return Alert.alert("提示", "输入你想找的真题，如：2024 大连中考数学");
    setSearched(true);
    // ① 先查题库
    const hits = matchBank(q);
    if (hits.length) {
      setResultIds(hits.map((p) => p.id));
      setNote(`题库找到 ${hits.length} 套，可直接练习`);
      return;
    }
    // ② 题库没有 → 联网搜索导入
    setBusy(true);
    setNote("题库暂无，正在联网检索真题…");
    try {
      const p = await importRealPaperFromWeb(q);
      setResultIds([p.id]);
      setNote("题库没有，已从网络导入 1 套（我的私有卷）");
    } catch (e: any) {
      setResultIds([]);
      setNote("");
      Alert.alert("未找到", e?.message || "联网检索失败，换个说法或年份再试");
    } finally {
      setBusy(false);
    }
  }

  async function searchMoreOnline() {
    const q = kw.trim();
    if (!q) return;
    setBusy(true);
    try {
      const p = await importRealPaperFromWeb(q);
      setResultIds((prev) => [p.id, ...prev]);
      setNote("已再从网络导入 1 套");
    } catch (e: any) {
      Alert.alert("未找到", e?.message || "联网检索失败");
    } finally {
      setBusy(false);
    }
  }

  function open(p: Paper) {
    if (submitted[p.id]) router.push(`/result/${p.id}`);
    else router.push(`/exam/${p.id}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40, gap: space.md }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: font.h1, fontWeight: "800", color: colors.ink }}>历史真题</Text>
          <Tag text={`公共 ${bank.length} 套`} />
        </View>
        <Text style={{ color: colors.sub, fontSize: font.sub }}>
          先搜公共题库，找不到自动联网检索。命中即可作答，错题进你的错题本。
        </Text>

        {/* AI 搜索输入框（同 Web 体验） */}
        <View style={{ backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12, gap: 10 }}>
          <TextInput
            style={{ minHeight: 64, fontSize: font.body, color: colors.ink, textAlignVertical: "top" }}
            multiline
            editable={!busy}
            placeholder="用一句话描述你要找的真题，如：2024 年大连中考数学卷 / 人教版八年级物理期末真题"
            value={kw}
            onChangeText={setKw}
          />
          <Pressable
            disabled={busy}
            onPress={search}
            style={{ flexDirection: "row", gap: 8, height: 46, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", opacity: busy ? 0.6 : 1 }}
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Ionicons name="search" size={18} color="#fff" />}
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>{busy ? "检索中…" : "搜索真题"}</Text>
          </Pressable>
        </View>

        {!!note && <Text style={{ color: colors.sub, fontSize: font.sub }}>{note}</Text>}

        {results.map((p) => {
          const done = !!submitted[p.id];
          const online = (p.tags || []).includes("我的私有");
          return (
            <Pressable
              key={p.id}
              onPress={() => open(p)}
              style={{ backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 4 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink, flex: 1 }} numberOfLines={2}>{p.title}</Text>
                <Tag text={online ? "网络" : "题库"} tone={online ? "warn" : "brand"} />
              </View>
              <Text style={{ color: colors.sub, fontSize: font.sub }}>
                {p.subject} · {p.year} · {p.region} · {p.questions} 题 · {p.score} 分
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <Text style={{ color: online ? colors.warn : colors.muted, fontSize: font.cap }}>
                  {online ? "AI 联网导入 · 仅你可见" : "公共真题"}
                </Text>
                <Tag text={done ? "查看结果" : "开始练习"} tone={done ? "muted" : "brand"} />
              </View>
            </Pressable>
          );
        })}

        {searched && !busy && (
          <Pressable
            onPress={searchMoreOnline}
            style={{ flexDirection: "row", gap: 6, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="globe-outline" size={16} color={colors.brand} />
            <Text style={{ color: colors.brand, fontWeight: "700", fontSize: font.sub }}>
              {results.length ? "没找到想要的？再联网搜一套" : "联网搜索真题"}
            </Text>
          </Pressable>
        )}

        {!searched && (
          <Text style={{ color: colors.muted, fontSize: font.sub, marginTop: 8 }}>
            输入后点「搜索真题」：题库有就直接练，没有就自动联网找。
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
