import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

export default function TeacherTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.line, height: 56 + insets.bottom, paddingBottom: insets.bottom + 6, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "工作台", tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} /> }} />
      <Tabs.Screen name="bank" options={{ title: "题库", tabBarIcon: ({ color, size }) => <Ionicons name="library" color={color} size={size} /> }} />
      <Tabs.Screen name="grading" options={{ title: "批改", tabBarIcon: ({ color, size }) => <Ionicons name="create" color={color} size={size} /> }} />
      <Tabs.Screen name="analytics" options={{ title: "学情", tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" color={color} size={size} /> }} />
      <Tabs.Screen name="me" options={{ title: "我的", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
