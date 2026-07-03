import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/tokens";

export default function AdminTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.brand, tabBarInactiveTintColor: colors.muted, tabBarStyle: { borderTopColor: colors.line, height: 58, paddingBottom: 6, paddingTop: 6 }, tabBarLabelStyle: { fontSize: 11 } }}>
      <Tabs.Screen name="index" options={{ title: "概览", tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} /> }} />
      <Tabs.Screen name="people" options={{ title: "人员班级", tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} /> }} />
      <Tabs.Screen name="me" options={{ title: "我的", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
