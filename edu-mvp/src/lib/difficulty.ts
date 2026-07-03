// 难度 → 星级映射（菁优网式 5 星难度）
export function difficultyStars(d?: string): number {
  switch (d) {
    case "容易":
    case "基础":
    case "简单":
      return 2;
    case "较难":
    case "偏难":
      return 4;
    case "困难":
    case "难":
      return 5;
    default:
      return 3; // 中等 / 未标注
  }
}

export function starText(n: number): string {
  const k = Math.max(0, Math.min(5, n));
  return "★".repeat(k) + "☆".repeat(5 - k);
}

export function difficultyLabel(d?: string): string {
  return d || "中等";
}
