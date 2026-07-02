import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useStore } from "@/store/useStore";
import { readLoginSession } from "@/lib/session";
import { loadBootstrap } from "@/api/bootstrap";

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
  }, []);

  if (!ready) return null; // 启动图保持

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
