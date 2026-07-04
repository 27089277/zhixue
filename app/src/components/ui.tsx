import { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadBootstrap } from "../api/bootstrap";
import { colors, font, radius, shadow, space } from "../theme/tokens";

// 页面容器（安全区 + 灰底 + 可滚动）。默认支持下拉刷新：从后端重新拉取，
// 保证 App 看到的数据与 Web/后端一致（多端同步）。
export function Screen({
  children,
  scroll = true,
  edges = ["top"],
  refreshable = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
  refreshable?: boolean;
}) {
  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadBootstrap();
    } finally {
      setRefreshing(false);
    }
  }
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingBottom: 40, gap: space.md }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        refreshable ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />
        ) : undefined
      }
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
  if (onPress) {
    // 关键：把「尺寸/布局」类样式(宽度/flex/外边距)放到可点击外层，视觉样式留在内层卡片——
    // 否则 width:"47%" 会相对被内容撑开的 Pressable 计算，导致工作台栅格错乱。
    const st = (style || {}) as any;
    const {
      width, height, flex, flexBasis, flexGrow, flexShrink, alignSelf,
      margin, marginTop, marginBottom, marginLeft, marginRight, marginHorizontal, marginVertical,
      ...visual
    } = st;
    const outer = {
      width, height, flex, flexBasis, flexGrow, flexShrink, alignSelf,
      margin, marginTop, marginBottom, marginLeft, marginRight, marginHorizontal, marginVertical,
    };
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [outer, { opacity: pressed ? 0.85 : 1 }]}>
        <View style={[styles.card, visual]}>{children}</View>
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
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
