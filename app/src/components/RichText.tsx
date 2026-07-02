import { Text, TextStyle } from "react-native";
import { colors, font } from "../theme/tokens";

// 轻量富文本：去标签 + 解码常见实体，渲染为纯文本。
// （KaTeX 公式 / 图片 的完整渲染后续用 WebView + render-html 接入）
function htmlToText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function RichText({
  html,
  style,
  numberOfLines,
}: {
  html: string;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  return (
    <Text
      style={[{ fontSize: font.body, color: colors.ink, lineHeight: 23 }, style]}
      numberOfLines={numberOfLines}
    >
      {htmlToText(html)}
    </Text>
  );
}
