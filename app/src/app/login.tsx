import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "@/store/useStore";
import { loginAccounts, SMS_CODE } from "@/data/seed";
import { saveLoginSession } from "@/lib/session";
import { PrimaryButton } from "@/components/ui";
import { colors, font, radius, space } from "@/theme/tokens";

export default function Login() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const account = useMemo(() => loginAccounts[phone], [phone]);

  async function onLogin() {
    if (!account) return Alert.alert("提示", "未识别的账号，请使用演示账号");
    if (code !== SMS_CODE) return Alert.alert("提示", `验证码错误，演示验证码为 ${SMS_CODE}`);
    setBusy(true);
    try {
      const role = account.roles[0];
      login(role, "sms", phone);
      await saveLoginSession(role, "sms", useStore.getState().roleProfiles[role], phone);
      router.replace(role === "student" ? "/(student)" : "/(teacher)");
    } finally {
      setBusy(false);
    }
  }

  function quick(p: string) {
    setPhone(p);
    setCode(SMS_CODE);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.brand }}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="school" size={30} color="#fff" />
        </View>
        <Text style={styles.title}>智学云教</Text>
        <Text style={styles.sub}>练习 · 组卷 · 手写作答 · 学情分析</Text>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.label}>手机号</Text>
        <View style={styles.inputRow}>
          <Ionicons name="phone-portrait-outline" size={18} color={colors.muted} />
          <TextInput
            style={styles.input}
            placeholder="输入演示手机号"
            keyboardType="number-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={11}
          />
        </View>
        {account ? (
          <Text style={styles.hit}>
            已识别：{account.name} · {account.scope}
          </Text>
        ) : null}

        <Text style={[styles.label, { marginTop: space.md }]}>验证码</Text>
        <View style={styles.inputRow}>
          <Ionicons name="key-outline" size={18} color={colors.muted} />
          <TextInput
            style={styles.input}
            placeholder={`演示验证码 ${SMS_CODE}`}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            maxLength={6}
          />
        </View>

        <PrimaryButton
          title="登录"
          onPress={onLogin}
          loading={busy}
          disabled={!phone || !code}
          style={{ marginTop: space.xl }}
        />

        <Text style={styles.demoTitle}>演示账号（点一下自动填）</Text>
        <View style={styles.demoRow}>
          {[
            { p: "13800000000", t: "教师" },
            { p: "13900000000", t: "学生" },
            { p: "13700000000", t: "管理员" },
          ].map((d) => (
            <Text key={d.p} style={styles.demoChip} onPress={() => quick(d.p)}>
              {d.t} {d.p.slice(-4)}
            </Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingTop: 40, paddingBottom: 28, gap: 8 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.85)", fontSize: font.sub },
  sheet: {
    flex: 1,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: space.xl,
  },
  label: { fontSize: font.sub, color: colors.sub, marginBottom: 6, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    height: 50,
  },
  input: { flex: 1, fontSize: font.h3, color: colors.ink },
  hit: { color: colors.brand, fontSize: font.cap, marginTop: 6 },
  demoTitle: { color: colors.muted, fontSize: font.cap, marginTop: space.xl, marginBottom: 8 },
  demoRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  demoChip: {
    color: colors.brand,
    backgroundColor: colors.brandSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: font.sub,
    overflow: "hidden",
    fontWeight: "600",
  },
});
