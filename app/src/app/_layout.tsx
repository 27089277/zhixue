import { useEffect, useState } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useStore } from "@/store/useStore";
import { readLoginSession } from "@/lib/session";
import { loadBootstrap } from "@/api/bootstrap";

// Web 宽屏：把「手机式」App 居中限宽，避免拉伸（三端统一：iOS/Android/Web）
function WebFrame({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web" || width < 820) return <>{children}</>;
  return (
    <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", backgroundColor: "#e9efec" }}>
      <View style={{ flex: 1, maxWidth: 900, backgroundColor: "#f4f7f5", borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#e6ece9" }}>
        {children}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      // 恢复登录会话（AsyncStorage，异步）
      const session = await readLoginSession();
      if (session) useStore.getState().restoreSession(session);
      setReady(true);
      // 拉取后端真实目录（非阻塞）
      loadBootstrap();
    })();
    // Web：注册 PWA service worker（可安装 + 离线壳）
    if (Platform.OS === "web" && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/app/sw.js", { scope: "/app/" }).catch(() => {});
    }
  }, []);

  if (!ready) return null; // 启动图保持

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <WebFrame>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(student)" />
          <Stack.Screen name="(teacher)" />
          <Stack.Screen name="exam/[paperId]" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="result/[paperId]" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="grade/[id]" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="compose" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="drill" options={{ animation: "slide_from_right" }} />
        </Stack>
        </WebFrame>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
