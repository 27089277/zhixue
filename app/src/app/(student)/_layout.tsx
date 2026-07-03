import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

export default function StudentTabs() {
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
      <Tabs.Screen
        name="index"
        options={{ title: "首页", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="real"
        options={{ title: "真题", tabBarIcon: ({ color, size }) => <Ionicons name="document-text" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="practice"
        options={{ title: "练习", tabBarIcon: ({ color, size }) => <Ionicons name="library" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="mistakes"
        options={{ title: "错题本", tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="me"
        options={{ title: "我的", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
