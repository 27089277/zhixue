import { Dimensions, Platform } from "react-native";

// 屏幕越大，字号与间距整体放大（平板/pad 体验）。用最短边判断设备类型，
// 不随旋转变化；Web(/app PWA) 保持手机尺寸不放大。
const { width, height } = Dimensions.get("window");
const shortest = Math.min(width, height);
export const scale =
  Platform.OS === "web" ? 1 : shortest >= 900 ? 1.5 : shortest >= 768 ? 1.35 : shortest >= 600 ? 1.2 : 1;
export const isTablet = Platform.OS !== "web" && shortest >= 600;
const f = (n: number) => Math.round(n * scale);

// 品牌与设计 token（学而思式绿色、卡片、大触控）
export const colors = {
  brand: "#0c8a5b",
  brandDark: "#0a7a50",
  brandSoft: "#e6f5ee",
  ink: "#1f2925",
  sub: "#5b6b64",
  muted: "#8a978f",
  line: "#e6ece9",
  bg: "#f4f7f5",
  card: "#ffffff",
  danger: "#e3342f",
  warn: "#e0900a",
  ok: "#0c8a5b",
  star: "#f5a623",
  white: "#ffffff",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
export const space = { xs: f(4), sm: f(8), md: f(12), lg: f(16), xl: f(20), xxl: f(28) };
export const font = {
  h1: f(24),
  h2: f(19),
  h3: f(16),
  body: f(15),
  sub: f(13),
  cap: f(12),
};
export const shadow = {
  card: {
    shadowColor: "#14231e",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};
