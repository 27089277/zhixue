// 学生明细派生，移植自 legacy studentsForClass / visibleClassStudents。
import type { ClassInfo, StudentDetail } from "../types";

const FAMILY = ["王", "李", "张", "刘", "陈", "赵", "孙", "周", "吴", "郑", "冯", "蒋", "沈", "韩", "杨", "朱", "秦", "许", "何", "林"];
const GIVEN = ["子涵", "思远", "雨桐", "宇航", "梓萱", "天宇", "明轩", "若溪", "佳怡", "浩然", "一诺", "嘉宁", "晨曦", "睿泽", "欣怡", "奕辰", "诗涵", "承泽", "语彤", "景行"];
const WEAK = ["二次函数", "相似三角形", "一元二次方程", "几何证明", "圆", "勾股定理", "函数图像"];

export function studentsForClass(
  className: string,
  classes: ClassInfo[]
): StudentDetail[] {
  const classInfo = classes.find((c) => c.name === className) || classes[0];
  if (className === "初三(1)班") {
    return [
      {
        id: "s-demo-wzh",
        name: "王子涵",
        className,
        studentNo: "GM2026001",
        phone: "139****0000",
        parentPhone: "138****6000",
        score: 72,
        completion: classInfo?.rate ?? 0,
        weakPoint: "欧姆定律",
        risk: "需关注",
        account: "启用",
        lastLogin: "今天 08:20",
      },
    ];
  }
  const count = classInfo?.count ?? 0;
  return Array.from({ length: count }, (_, index) => {
    const score = Math.max(48, Math.min(99, 92 - (index % 9) * 4 + (index % 3) * 2));
    const completion = Math.max(
      52,
      Math.min(100, (classInfo?.rate ?? 0) - (index % 6) * 3 + (index % 4))
    );
    const risk = score < 65 ? "高风险" : score < 78 ? "需关注" : "正常";
    const no = String(index + 1).padStart(2, "0");
    return {
      id: `${className.replace(/\D/g, "") || "9"}${no}`,
      name: `${FAMILY[index % FAMILY.length]}${GIVEN[(index + className.length) % GIVEN.length]}`,
      className,
      studentNo: `GM2026${className.match(/\((\d)\)/)?.[1] || "0"}${no}`,
      phone: `139****${String(1000 + index * 17).slice(-4)}`,
      parentPhone: `138****${String(6000 + index * 23).slice(-4)}`,
      score,
      completion,
      weakPoint: WEAK[index % WEAK.length],
      risk,
      account: index % 13 === 0 ? "待激活" : "启用",
      lastLogin: index % 5 === 0 ? "昨天 20:18" : "今天 07:42",
    };
  });
}

export function visibleClassStudents(classes: ClassInfo[]): StudentDetail[] {
  return classes.flatMap((c) => studentsForClass(c.name, classes));
}
