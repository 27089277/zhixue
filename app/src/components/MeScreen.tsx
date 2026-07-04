import { Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "@/store/useStore";
import { currentProfile } from "@/store/permissions";
import { API_BASE } from "@/api/client";
import { clearLoginSession } from "@/lib/session";
import { Card, PrimaryButton, Screen, SectionTitle } from "@/components/ui";
import { colors, font, space } from "@/theme/tokens";

// 学生/老师通用「我的」页
export default function MeScreen() {
  const router = useRouter();
  const s = useStore();
  const me = currentProfile(s);

  async function onLogout() {
    s.logout();
    await clearLoginSession();
    router.replace("/login");
  }

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={styles.avatar}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{me.avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: font.h2, fontWeight: "800", color: colors.ink }}>{me.name}</Text>
            <Text style={{ color: colors.sub, fontSize: font.sub }}>{me.scope}</Text>
          </View>
        </View>
      </Card>

      <SectionTitle title="设置" />
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}>
          <Ionicons name="volume-high-outline" size={18} color={colors.muted} />
          <Text style={{ color: colors.sub, fontSize: font.sub }}>音效</Text>
          <View style={{ marginLeft: "auto" }}>
            <Switch
              value={s.soundEnabled}
              onValueChange={s.setSoundEnabled}
              trackColor={{ true: colors.brand, false: "#ccd6d1" }}
            />
          </View>
        </View>
      </Card>

      <SectionTitle title="关于" />
      <Card>
        <Row icon="server-outline" label="后端地址" value={API_BASE} />
        <Row icon="person-outline" label="当前角色" value={s.role === "student" ? "学生" : s.role === "admin" ? "管理员" : "教师"} />
      </Card>

      <PrimaryButton title="退出登录" onPress={onLogout} style={{ marginTop: space.lg, backgroundColor: colors.danger }} />
    </Screen>
  );
}

function Row({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }}>
      <Ionicons name={icon} size={18} color={colors.muted} />
      <Text style={{ color: colors.sub, fontSize: font.sub }}>{label}</Text>
      <Text style={{ marginLeft: "auto", color: colors.ink, fontSize: font.sub }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = {
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
