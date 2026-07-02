import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, font, radius, shadow, space } from "../theme/tokens";

// 页面容器（安全区 + 灰底 + 可滚动）
export function Screen({
  children,
  scroll = true,
  edges = ["top"],
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
}) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingBottom: 40, gap: space.md }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: space.lg, gap: space.md }}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={edges}>
      {inner}
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  const body = <View style={[styles.card, style]}>{children}</View>;
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {body}
      </Pressable>
    );
  return body;
}

export function SectionTitle({ title, extra }: { title: string; extra?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {extra}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryBtn,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.9 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.primaryBtnText}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Tag({ text, tone = "brand" }: { text: string; tone?: "brand" | "muted" | "warn" }) {
  const bg =
    tone === "brand" ? colors.brandSoft : tone === "warn" ? "#fff4e0" : "#eef2f0";
  const fg = tone === "brand" ? colors.brand : tone === "warn" ? colors.warn : colors.sub;
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontSize: font.cap, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

export function Stars({ n, total = 5 }: { n: number; total?: number }) {
  return (
    <Text style={{ color: colors.star, fontSize: font.cap }}>
      {"★".repeat(Math.max(0, Math.min(total, n)))}
      <Text style={{ color: colors.line }}>{"★".repeat(Math.max(0, total - n))}</Text>
    </Text>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={{ paddingVertical: 48, alignItems: "center" }}>
      <Text style={{ color: colors.muted, fontSize: font.sub }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.lg,
    ...shadow.card,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.sm,
  },
  sectionTitleText: { fontSize: font.h3, fontWeight: "700", color: colors.ink },
  primaryBtn: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: font.h3, fontWeight: "700" },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
});
