import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { currentProfile, visibleClasses } from "@/store/permissions";
import { createBankQuestionFromPaperItem, normalizePaperSections } from "@/lib/papers";
import { RichText } from "@/components/RichText";
import { colors, font, radius, space } from "@/theme/tokens";
import type { Assignment, Paper, PaperItem, Question } from "@/types";

const DEADLINES = [
  { label: "今天", days: 0 },
  { label: "3 天后", days: 3 },
  { label: "7 天后", days: 7 },
  { label: "2 周后", days: 14 },
];
const LIMITS = [
  { label: "不限时", v: null as number | null },
  { label: "45 分钟", v: 45 },
  { label: "60 分钟", v: 60 },
  { label: "90 分钟", v: 90 },
];
const TYPES = ["单选题", "多选题", "填空题", "判断题", "解答题"];

// 试卷工作台：老师=预览 / 编辑（改题）/ 存入题库 / 发布作业；学生=去作答。
export default function PaperDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const s = useStore();
  const paper = useMemo(() => s.papers.find((p) => p.id === id), [s.papers, id]);
  const isTeacher = s.role === "teacher";
  const classes = visibleClasses(s);

  const publishedClasses = useMemo(
    () => new Set(s.assignments.filter((a) => a.paperId === id).map((a) => a.className)),
    [s.assignments, id]
  );

  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [pickedClasses, setPickedClasses] = useState<string[]>(() => {
    const first = classes.find((c) => !publishedClasses.has(c.name));
    return first ? [first.name] : [];
  });
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [limit, setLimit] = useState<number | null>(45);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  // 编辑草稿
  const [draftTitle, setDraftTitle] = useState("");
  const [draftItems, setDraftItems] = useState<PaperItem[]>([]);

  if (!paper) {
    return (
      <SafeAreaView style={styles.screen}><Text style={{ padding: 20, color: colors.muted }}>试卷不存在</Text></SafeAreaView>
    );
  }

  function enterEdit() {
    setDraftTitle(paper!.title);
    setDraftItems(paper!.items.map((it) => ({ ...it, choices: it.choices ? [...it.choices] : undefined })));
    setMode("edit");
  }
  function patchItem(idx: number, patch: Partial<PaperItem>) {
    setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function deleteItem(idx: number) {
    setDraftItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function addItem() {
    setDraftItems((prev) => [
      ...prev,
      { no: prev.length + 1, type: "单选题", title: "", choices: ["", "", "", ""], answer: "", score: 4, status: "未答" },
    ]);
  }
  function saveEdits() {
    const items: PaperItem[] = draftItems.map((it, i) => ({
      ...it,
      no: i + 1,
      title: (it.title || "").trim(),
      choices: it.choices?.map((c) => c.trim()).filter(Boolean),
      answer: (it.answer || "").trim(),
      score: Number(it.score) || 0,
    }));
    if (!items.length) return Alert.alert("提示", "试卷至少保留 1 道题");
    if (items.some((it) => !it.title)) return Alert.alert("提示", "有题目的题干为空，请填写或删除");
    const score = items.reduce((sum, it) => sum + (Number(it.score) || 0), 0);
    const next: Paper = {
      ...paper!,
      title: draftTitle.trim() || paper!.title,
      items,
      questions: items.length,
      score,
      sections: normalizePaperSections(paper!.sections, items),
      tags: Array.from(new Set([...(paper!.tags || []), "已校对"])),
    };
    // 学生私有真题只存本地，不落库
    const persist = paper!.visibility !== "student";
    s.addPaper(next, { persist });
    setMode("preview");
    Alert.alert("已保存", "试卷修改已保存");
  }

  function toggleClass(name: string) {
    if (publishedClasses.has(name)) return;
    setPickedClasses((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  }
  function togglePick(no: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(no) ? next.delete(no) : next.add(no);
      return next;
    });
  }
  function saveToBank() {
    const chosen = paper!.items.filter((it) => picked.has(it.no));
    if (!chosen.length) return Alert.alert("提示", "先勾选要存入题库的题目");
    const me = currentProfile(s).name;
    const questions: Question[] = chosen.map((item, i) => ({
      ...createBankQuestionFromPaperItem(item, paper!, i, me),
      owner: me,
      visibility: "teacher" as const,
      origin: "试卷选入",
      subject: paper!.subject,
      answer: item.answer,
      analysis: item.analysis,
      choices: item.choices?.length ? item.choices : undefined,
      sharedWith: [],
    }));
    s.addQuestions(questions);
    setPicked(new Set());
    Alert.alert("已入库", `已将 ${questions.length} 道题存入教师题库`);
  }

  function publish() {
    const targets = pickedClasses.filter((n) => !publishedClasses.has(n));
    if (!targets.length) return Alert.alert("无法发布", pickedClasses.length ? "所选班级都已发布过本试卷" : "请至少选择一个班级");
    const d = new Date(Date.now() + deadlineDays * 86400000);
    const deadline = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T22:00`;
    setBusy(true);
    try {
      targets.forEach((className, i) => {
        const a: Assignment = {
          id: `asg-${Date.now()}-${i}`,
          title: paper!.title, paperId: paper!.id, className, deadline,
          status: "进行中", createdAt: Date.now(), kind: "作业", mode: "paper",
          timeLimit: limit, allowRedo: false,
        };
        s.addAssignment(a);
      });
      Alert.alert("发布成功", `已发布《${paper!.title}》到 ${targets.join("、")}`, [{ text: "好", onPress: () => router.back() }]);
    } finally {
      setBusy(false);
    }
  }

  const editing = mode === "edit";

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Ionicons name="chevron-back" size={26} color={colors.ink} /></Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{isTeacher ? (editing ? "编辑试卷" : "试卷预览") : paper.title}</Text>
        {isTeacher ? (
          <Pressable onPress={() => (editing ? saveEdits() : enterEdit())} hitSlop={10}>
            <Text style={{ color: colors.brand, fontWeight: "800", fontSize: font.sub }}>{editing ? "保存" : "编辑"}</Text>
          </Pressable>
        ) : <View style={{ width: 34 }} />}
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* 试卷信息 */}
        <View style={styles.card}>
          {editing ? (
            <>
              <Text style={styles.lbl}>试卷名称</Text>
              <TextInput style={styles.input} value={draftTitle} onChangeText={setDraftTitle} placeholder="试卷名称" />
            </>
          ) : (
            <Text style={{ fontSize: font.h2, fontWeight: "800", color: colors.ink }}>{paper.title}</Text>
          )}
          <Text style={{ color: colors.sub, fontSize: font.sub, marginTop: 4 }}>
            {paper.subject} · {(editing ? draftItems.length : paper.questions)} 题 · {paper.score} 分 · {paper.duration} 分钟
          </Text>
        </View>

        {/* 老师·发布作业（仅预览态） */}
        {isTeacher && !editing && (
          <View style={styles.card}>
            <Text style={{ fontWeight: "800", color: colors.ink, marginBottom: 8 }}>发布作业</Text>
            <Label>班级（可多选）</Label>
            {classes.length ? (
              <Row>
                {classes.map((c) => {
                  const done = publishedClasses.has(c.name);
                  return <Chip key={c.name} label={done ? `${c.name}（已发布）` : c.name} on={pickedClasses.includes(c.name)} disabled={done} onPress={() => toggleClass(c.name)} />;
                })}
              </Row>
            ) : <Text style={{ color: colors.muted, fontSize: font.sub }}>暂无可发布的班级</Text>}
            <Label>截止</Label>
            <Row>{DEADLINES.map((d) => <Chip key={d.days} label={d.label} on={deadlineDays === d.days} onPress={() => setDeadlineDays(d.days)} />)}</Row>
            <Label>限时</Label>
            <Row>{LIMITS.map((l) => <Chip key={l.label} label={l.label} on={limit === l.v} onPress={() => setLimit(l.v)} />)}</Row>
            <Pressable disabled={busy || !pickedClasses.length} onPress={publish} style={[styles.pub, (busy || !pickedClasses.length) && { opacity: 0.6 }]}>
              <Ionicons name="paper-plane" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>{pickedClasses.length > 1 ? `发布到 ${pickedClasses.length} 个班级` : "发布到班级"}</Text>
            </Pressable>
          </View>
        )}

        {/* 学生·去作答 */}
        {!isTeacher && (
          <Pressable onPress={() => router.replace(`/exam/${paper.id}`)} style={styles.pub}>
            <Ionicons name="create" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>开始作答</Text>
          </Pressable>
        )}

        {/* 题目区 */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.sm }}>
          <Text style={{ fontWeight: "700", color: colors.ink }}>题目（{editing ? draftItems.length : paper.items.length}）</Text>
          {isTeacher && !editing && picked.size > 0 && (
            <Pressable onPress={saveToBank} style={styles.smallBtn}>
              <Ionicons name="download-outline" size={14} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: font.cap }}>存入题库（{picked.size}）</Text>
            </Pressable>
          )}
        </View>
        {isTeacher && !editing && (
          <Text style={{ color: colors.muted, fontSize: font.cap }}>勾选题目可「存入题库」；点右上「编辑」可修正 AI 生成的题目。</Text>
        )}

        {editing ? (
          <>
            {draftItems.map((it, idx) => (
              <View key={idx} style={styles.card}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.muted, fontSize: font.cap }}>第 {idx + 1} 题</Text>
                  <Pressable onPress={() => deleteItem(idx)} hitSlop={8}><Ionicons name="trash-outline" size={18} color={colors.danger} /></Pressable>
                </View>
                <Label>题型</Label>
                <Row>{TYPES.map((t) => <Chip key={t} label={t} on={it.type === t} onPress={() => patchItem(idx, { type: t })} />)}</Row>
                <Label>题干</Label>
                <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]} multiline value={it.title} onChangeText={(v) => patchItem(idx, { title: v })} placeholder="题干" />
                {(it.type === "单选题" || it.type === "多选题" || it.type === "判断题") && (
                  <>
                    <Label>选项（每行一个）</Label>
                    <TextInput
                      style={[styles.input, { minHeight: 90, textAlignVertical: "top" }]}
                      multiline
                      value={(it.choices || []).join("\n")}
                      onChangeText={(v) => patchItem(idx, { choices: v.split("\n") })}
                      placeholder={"选项A\n选项B\n选项C\n选项D"}
                    />
                  </>
                )}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Label>答案</Label>
                    <TextInput style={styles.input} value={it.answer} onChangeText={(v) => patchItem(idx, { answer: v })} placeholder="如 A / 42 / 见解析" />
                  </View>
                  <View style={{ width: 90 }}>
                    <Label>分值</Label>
                    <TextInput style={styles.input} keyboardType="number-pad" value={String(it.score ?? "")} onChangeText={(v) => patchItem(idx, { score: Number(v) || 0 })} />
                  </View>
                </View>
                <Label>解析（可选）</Label>
                <TextInput style={[styles.input, { minHeight: 50, textAlignVertical: "top" }]} multiline value={it.analysis || ""} onChangeText={(v) => patchItem(idx, { analysis: v })} placeholder="解析" />
              </View>
            ))}
            <Pressable onPress={addItem} style={styles.addBtn}>
              <Ionicons name="add" size={18} color={colors.brand} />
              <Text style={{ color: colors.brand, fontWeight: "700" }}>添加题目</Text>
            </Pressable>
          </>
        ) : (
          paper.items.map((it) => (
            <Pressable key={it.no} onPress={() => isTeacher && togglePick(it.no)} style={[styles.card, picked.has(it.no) && { borderColor: colors.brand, backgroundColor: colors.brandSoft }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {isTeacher && <Ionicons name={picked.has(it.no) ? "checkbox" : "square-outline"} size={18} color={picked.has(it.no) ? colors.brand : colors.muted} />}
                <Text style={{ color: colors.muted, fontSize: font.cap }}>第 {it.no} 题 · {it.type} · {it.score} 分</Text>
              </View>
              <RichText html={it.title} />
              {(it.choices || []).map((c, i) => (
                <Text key={i} style={{ color: colors.sub, fontSize: font.sub }}>{String.fromCharCode(65 + i)}. {c.replace(/<[^>]+>/g, "")}</Text>
              ))}
              {it.answer ? <Text style={{ color: colors.ok, fontSize: font.sub, marginTop: 2 }}>答案：{it.answer}</Text> : null}
              {it.analysis ? <Text style={{ color: colors.sub, fontSize: font.cap, marginTop: 2 }}>解析：{it.analysis.replace(/<[^>]+>/g, "")}</Text> : null}
            </Pressable>
          ))
        )}

        {editing && (
          <Pressable onPress={saveEdits} style={styles.pub}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: font.h3 }}>保存修改</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: font.cap, color: colors.sub, marginTop: 8, marginBottom: 4 }}>{children}</Text>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{children}</View>;
}
function Chip({ label, on, onPress, disabled }: { label: string; on: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.chip, on && styles.chipOn, disabled && styles.chipDone]}>
      <Text style={{ color: on ? "#fff" : disabled ? colors.muted : colors.sub, fontSize: font.sub, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: space.lg, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: font.h3, fontWeight: "700", color: colors.ink, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 4 },
  lbl: { fontSize: font.cap, color: colors.sub, marginBottom: 4 },
  input: { backgroundColor: "#fff", borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, padding: 10, fontSize: font.body, color: colors.ink },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipDone: { backgroundColor: "#f1f4f2", borderColor: colors.line, borderStyle: "dashed" },
  pub: { flexDirection: "row", gap: 8, height: 50, borderRadius: radius.md, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  smallBtn: { flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: colors.brand, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  addBtn: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", height: 46, borderRadius: radius.md, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand, backgroundColor: "#fff" },
});
