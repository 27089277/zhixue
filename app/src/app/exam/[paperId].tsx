import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { RichText } from "@/components/RichText";
import { Handwriting, parseStrokes, serializeStrokes } from "@/components/Handwriting";
import { playSfx } from "@/lib/sound";
import { colors, font, radius, space } from "@/theme/tokens";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function ExamScreen() {
  const { paperId } = useLocalSearchParams<{ paperId: string }>();
  const router = useRouter();
  const s = useStore();
  const paper = useMemo(() => s.papers.find((p) => p.id === paperId), [s.papers, paperId]);

  useEffect(() => {
    // 已被老师批改且未退回重做的卷：不再进入答题，直接看结果（避免重做覆盖批改/批注）
    const sub = s.exam.submitted[paperId];
    const asg = s.assignments.find((a) => a.paperId === paperId);
    if (sub?.gradedAt && !sub.returned && !asg?.allowRedo) {
      router.replace(`/result/${paperId}`);
      return;
    }
    if (paperId) s.startPaper(paperId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  const endsAt = s.exam.endsAt;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  useEffect(() => {
    if (endsAt && now >= endsAt) doSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, endsAt]);

  if (!paper) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20, color: colors.muted }}>试卷不存在</Text>
      </SafeAreaView>
    );
  }

  const items = paper.items || [];
  const currentNo = s.exam.currentNo || items[0]?.no || 1;
  const item = items.find((it) => it.no === currentNo) || items[0];
  const answers = s.exam.answers[paper.id] || {};
  const idx = items.findIndex((it) => it.no === item.no);

  function setVal(v: string) {
    s.saveAnswer(paper!.id, item.no, v);
  }
  function go(n: number) {
    s.selectQuestion(n);
  }

  const submittedRef = useRef(false);
  function doSubmit(auto = false) {
    const submit = () => {
      if (submittedRef.current) return; // 防止到点计时反复触发交卷
      submittedRef.current = true;
      s.submitPaper(paper!.id);
      playSfx("submit");
      router.replace(`/result/${paper!.id}`);
    };
    if (auto) return submit();
    const unanswered = items.filter((it) => !((s.exam.answers[paper!.id] || {})[it.no]?.value)).length;
    Alert.alert("交卷", unanswered ? `还有 ${unanswered} 题未作答，确定交卷？` : "确定交卷？", [
      { text: "继续作答", style: "cancel" },
      { text: "交卷", style: "destructive", onPress: submit },
    ]);
  }

  const val = answers[item.no]?.value || "";

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{paper.title}</Text>
        <View style={styles.timer}>
          <Ionicons name="time-outline" size={14} color={endsAt ? colors.warn : colors.muted} />
          <Text style={{ color: endsAt ? colors.warn : colors.muted, fontSize: font.cap, fontWeight: "700" }}>
            {endsAt ? fmt(endsAt - now) : "不限时"}
          </Text>
        </View>
      </View>

      {/* 题卡横向导航 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navBar} contentContainerStyle={{ gap: 8, paddingHorizontal: space.lg }}>
        {items.map((it) => {
          const done = !!answers[it.no]?.value;
          const active = it.no === item.no;
          return (
            <Pressable key={it.no} onPress={() => go(it.no)} style={[styles.navChip, active && styles.navActive, !active && done && styles.navDone]}>
              <Text style={{ color: active ? "#fff" : done ? colors.brand : colors.sub, fontWeight: "700", fontSize: font.cap }}>{it.no}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40, gap: space.md }}>
        <View style={styles.qhead}>
          <Text style={styles.qno}>第 {item.no} 题</Text>
          <Text style={styles.qmeta}>{item.type} · {item.score} 分</Text>
        </View>
        <RichText html={item.title} style={{ fontSize: font.h3 }} />

        {/* 选择题 */}
        {(item.type === "单选题" || item.type === "多选题" || item.type === "判断题") && (item.choices || []).length > 0 ? (
          <View style={{ gap: 10, marginTop: 4 }}>
            {item.type === "多选题" ? (
              <Text style={{ color: colors.brand, fontSize: font.cap }}>多选题 · 可选多个选项</Text>
            ) : null}
            {(item.choices || []).map((c, i) => {
              const label = String.fromCharCode(65 + i);
              const isMulti = item.type === "多选题";
              const selected = isMulti ? val.includes(label) : val === label;
              const onPick = () => {
                if (!isMulti) return setVal(label);
                const set = new Set(val.split("").filter(Boolean));
                set.has(label) ? set.delete(label) : set.add(label);
                setVal(Array.from(set).sort().join(""));
              };
              return (
                <Pressable key={i} onPress={onPick} style={[styles.option, selected && styles.optionSel]}>
                  <View style={[styles.optBadge, selected && styles.optBadgeSel]}>
                    <Text style={{ color: selected ? "#fff" : colors.sub, fontWeight: "700" }}>{label}</Text>
                  </View>
                  <RichText html={c} style={{ flex: 1 }} />
                </Pressable>
              );
            })}
          </View>
        ) : item.type === "解答题" ? (
          <View style={{ gap: 8, marginTop: 4 }}>
            <Text style={{ color: colors.sub, fontSize: font.sub }}>手写作答：</Text>
            <Handwriting
              key={item.no}
              initial={parseStrokes(val)}
              onChange={(st) => setVal(st.length ? serializeStrokes(st) : "")}
            />
          </View>
        ) : (
          // 填空/其它：文本输入
          <TextInput
            style={styles.fill}
            placeholder="在此作答"
            value={val}
            onChangeText={setVal}
            multiline
          />
        )}
      </ScrollView>

      {/* 底部操作 */}
      <View style={styles.footer}>
        <Pressable disabled={idx <= 0} onPress={() => go(items[idx - 1].no)} style={[styles.navBtn, idx <= 0 && { opacity: 0.4 }]}>
          <Text style={styles.navBtnText}>上一题</Text>
        </Pressable>
        {idx < items.length - 1 ? (
          <Pressable onPress={() => go(items[idx + 1].no)} style={[styles.navBtn, styles.navBtnPrimary]}>
            <Text style={[styles.navBtnText, { color: "#fff" }]}>下一题</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => doSubmit(false)} style={[styles.navBtn, { backgroundColor: colors.brand }]}>
            <Text style={[styles.navBtnText, { color: "#fff" }]}>交卷</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink },
  timer: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  navBar: { maxHeight: 48, paddingVertical: 6 },
  navChip: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  navActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  navDone: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  qhead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  qno: { fontSize: font.h3, fontWeight: "800", color: colors.ink },
  qmeta: { color: colors.sub, fontSize: font.sub },
  option: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14 },
  optionSel: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  optBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#eef2f0", alignItems: "center", justifyContent: "center" },
  optBadgeSel: { backgroundColor: colors.brand },
  fill: { minHeight: 100, backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, fontSize: font.h3, color: colors.ink, textAlignVertical: "top" },
  footer: { flexDirection: "row", gap: 12, padding: space.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "#fff" },
  navBtn: { flex: 1, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  navBtnPrimary: { backgroundColor: colors.brand, borderColor: colors.brand },
  navBtnText: { fontSize: font.h3, fontWeight: "700", color: colors.ink },
});
