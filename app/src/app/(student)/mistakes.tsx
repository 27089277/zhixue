import { Screen, Empty, SectionTitle } from "@/components/ui";

// 错题本（融合菁优网：重做 + 相似题 + 按知识点归类）—— 深度流程后续接入。
export default function Mistakes() {
  return (
    <Screen>
      <SectionTitle title="错题本" />
      <Empty text="答题后自动收录错题，支持重做与相似题（建设中）" />
    </Screen>
  );
}
