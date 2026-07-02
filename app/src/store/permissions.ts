// 权限与可见性纯函数，移植自 legacy app.js (222-334)。
import type {
  ClassInfo,
  Question,
  Role,
  RoleProfile,
  Section,
  UserRow,
} from "../types";

export interface PermCtx {
  role: Role;
  roleProfiles: Record<Role, RoleProfile>;
  classes: ClassInfo[];
  questions: Question[];
  users: UserRow[];
}

export function currentProfile(s: PermCtx): RoleProfile {
  return s.roleProfiles[s.role] || s.roleProfiles.teacher;
}

export function hasPermission(s: PermCtx, section: Section): boolean {
  return currentProfile(s).allowed.includes(section);
}

export function visibleClasses(s: PermCtx): ClassInfo[] {
  if (s.role === "teacher") {
    return s.classes.filter((item) => item.owner === currentProfile(s).name);
  }
  return s.classes;
}

export function availableTeacherNames(
  s: PermCtx,
  owner = currentProfile(s).name
): string[] {
  const names = s.users
    .filter((user) => user.role === "教师" && user.status === "启用")
    .map((user) => user.name);
  return Array.from(new Set([...names, owner, "李老师", "王教研"])).filter(
    Boolean
  );
}

export function sharedWithNames(item: { sharedWith?: string[] } = {}): string[] {
  return Array.isArray(item.sharedWith) ? item.sharedWith : [];
}

export function canViewBankAsset(
  s: PermCtx,
  item: { visibility?: string; owner?: string; sharedWith?: string[] } = {}
): boolean {
  // 学生只看公共库/学生练习库
  if (s.role === "student") return item.visibility === "public" || item.visibility === "student";
  if (s.role === "admin") return true;
  // 老师：公共/教师题库/学生库都可见；私人库仅创建者或被共享者可见
  if (item.visibility === "private") {
    return (
      item.owner === currentProfile(s).name ||
      sharedWithNames(item).includes(currentProfile(s).name)
    );
  }
  return true;
}

export function canOperateBankAsset(
  s: PermCtx,
  item: { visibility?: string; owner?: string } = {}
): boolean {
  if (s.role !== "teacher") return true;
  // 只有创建（owner 为本人）的老师可编辑/删除；系统题任何老师都只能查看。
  return item.owner === currentProfile(s).name;
}

// 是否可管理“可见范围”（仅教师私人库、且本人创建）
export function canShareBankAsset(
  s: PermCtx,
  item: { visibility?: string; owner?: string } = {}
): boolean {
  return (
    s.role === "teacher" &&
    item.visibility === "private" &&
    item.owner === currentProfile(s).name
  );
}

export function bankAssetScopeText(
  s: PermCtx,
  item: { visibility?: string; owner?: string; sharedWith?: string[] } = {}
): string {
  if (item.visibility === "student") return "学生练习库";
  if (item.visibility === "teacher") return "教师题库";
  if (item.visibility === "private") {
    const shared = sharedWithNames(item);
    if (item.owner === currentProfile(s).name)
      return shared.length ? `我的私人库 · 已共享给 ${shared.join("、")}` : "我的私人库 · 仅自己可见";
    return `${item.owner} 私人库 · 共享给我`;
  }
  return "公共库";
}

export function visibleQuestions(s: PermCtx): Question[] {
  if (s.role === "teacher") {
    return s.questions.filter((q) => canViewBankAsset(s, q));
  }
  if (s.role === "student") {
    return s.questions.filter(
      (item) => item.visibility === "public" || item.visibility === "student"
    );
  }
  return s.questions;
}

export function questionStatus(s: PermCtx, item: Question): string {
  if (item.visibility === "teacher") return "教师可见";
  if (item.visibility === "private") {
    if (item.owner === currentProfile(s).name)
      return sharedWithNames(item).length ? "已共享" : "仅自己";
    return "共享给我";
  }
  if (item.visibility === "student") return "学生可练";
  return "公共可用";
}
