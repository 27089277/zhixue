// 初始种子数据，移植自 legacy app.js (1-117)。
import type {
  Assignment,
  ClassInfo,
  Knowledge,
  LoginAccount,
  Paper,
  Question,
  Risk,
  RoleProfile,
  Role,
  UserRow,
  Video,
} from "../types";

export const DATA_VERSION = "ai-bank-flow-react-20260702-2";
export const SMS_CODE = "246810";

export const loginAccounts: Record<string, LoginAccount> = {
  // 老师（对应后端 5 位老师，各带一个班）
  "13800000000": { name: "张老师", avatar: "张", scope: "光明中学 / 数学组", roles: ["teacher"] },
  "13800000001": { name: "李老师", avatar: "李", scope: "光明中学 / 物理组", roles: ["teacher"] },
  "13800000002": { name: "王老师", avatar: "王", scope: "光明中学 / 语文组", roles: ["teacher"] },
  "13800000003": { name: "赵老师", avatar: "赵", scope: "光明中学 / 英语组", roles: ["teacher"] },
  "13800000004": { name: "刘老师", avatar: "刘", scope: "光明中学 / 化学组", roles: ["teacher"] },
  // 学生（对应各班真实学生）
  "13900000000": { name: "王子涵", avatar: "王", scope: "初三(1)班", roles: ["student"] },
  "13900000001": { name: "林小明", avatar: "林", scope: "初三(2)班", roles: ["student"] },
  // 管理员
  "13700000000": { name: "赵管理员", avatar: "赵", scope: "光明中学校区", roles: ["admin"] },
};

export const roleProfiles: Record<Role, RoleProfile> = {
  teacher: {
    name: "张老师",
    scope: "光明中学 / 初三数学组",
    avatar: "张",
    banner: ["AI题库 1", "学生 1", "待批 1"],
    allowed: ["workspace", "org", "bank", "homework", "grading", "analytics"],
  },
  student: {
    name: "王子涵",
    scope: "初三(1)班 / 学生",
    avatar: "王",
    banner: ["待完成 1", "已提交 0", "反馈 0"],
    allowed: ["workspace"],
  },
  admin: {
    name: "赵管理员",
    scope: "光明中学 / 校区管理员",
    avatar: "赵",
    banner: ["角色 3", "教师 1", "学生 1"],
    allowed: ["workspace", "org", "bank", "admin"],
  },
};

export const seedAssignments: Assignment[] = [
  {
    id: "hw-demo",
    title: "大连中考物理真题练习",
    paperId: "p-demo-dl",
    className: "初三(1)班",
    deadline: "2026-07-01T22:00",
    status: "待完成",
    createdAt: 1751212800000,
    kind: "作业",
    mode: "paper",
  },
];

export const seedVideos: Video[] = [
  {
    name: "电学计算真题讲解.mp4",
    size: "186.4MB",
    progress: 100,
    status: "已完成",
    owner: "张老师",
    source: "老师上传",
    paperTitle: "2025 大连中考物理真题练习",
    point: "欧姆定律",
  },
];

export const seedClasses: ClassInfo[] = [
  { name: "初三(1)班", count: 1, owner: "张老师", rate: 0 },
];

export const seedQuestions: Question[] = [
  {
    title: "家庭电路中空气开关跳闸的常见原因是（ ）",
    type: "单选题",
    point: "安全用电",
    source: "2025 大连中考物理真题练习",
    visibility: "public",
    owner: "系统真题库",
    origin: "试卷导入",
    paperTitle: "2025 大连中考物理真题练习",
  },
  {
    title: "已知电压 6V、电阻 3Ω，求通过电阻的电流。",
    type: "填空题",
    point: "欧姆定律",
    source: "AI 生成",
    visibility: "teacher",
    owner: "张老师",
    origin: "AI 生成",
    sharedWith: [],
  },
  {
    title: "结合图像说明串联电路中电流、电压的特点。",
    type: "解答题",
    point: "串并联电路",
    source: "老师手动编写",
    visibility: "teacher",
    owner: "张老师",
    origin: "老师手动编写",
    sharedWith: ["李老师"],
  },
  {
    title: "小灯泡亮度变化与实际功率的关系练习",
    type: "单选题",
    point: "电功率",
    source: "公共练习库",
    visibility: "public",
    owner: "系统推荐",
    origin: "公共题",
  },
];

export const seedPapers: Paper[] = [
  {
    id: "p-demo-dl",
    title: "2025 大连中考物理真题练习",
    exam: "中考真题",
    subject: "物理",
    region: "大连",
    year: 2025,
    duration: 45,
    score: 60,
    questions: 6,
    progress: 48,
    difficulty: "中等",
    sections: ["选择题 3", "填空题 2", "解答题 1"],
    tags: ["AI 智能搜索", "老师待校对", "可发布"],
    visibility: "public",
    owner: "系统真题库",
    source: "AI 从网络导入",
    sharedWith: [],
    items: [
      { no: 1, type: "单选题", title: "家庭电路中空气开关跳闸的常见原因是（ ）", choices: ["电路断路", "电路短路", "电压过低", "用电器断开"], answer: "B", score: 6, status: "未答" },
      { no: 2, type: "单选题", title: "下列做法符合安全用电原则的是（ ）", choices: ["湿手触摸开关", "更换灯泡前断开电源", "用铜丝代替保险丝", "多个大功率电器共用插座"], answer: "B", score: 6, status: "未答" },
      { no: 3, type: "单选题", title: "一只标有 6V 3W 的小灯泡正常发光时电流约为（ ）", choices: ["0.2A", "0.5A", "2A", "18A"], answer: "B", score: 6, status: "未答" },
      { no: 4, type: "填空题", title: "电压 6V、电阻 3Ω，通过电阻的电流为 ____ A。", answer: "2", score: 8, status: "未答" },
      { no: 5, type: "填空题", title: "串联电路中各处电流 ____，总电压等于各部分电压 ____。", answer: "相等；之和", score: 10, status: "未答" },
      { no: 6, type: "解答题", title: "请设计一个实验验证并联电路干路电流等于各支路电流之和，写出器材、步骤和结论。", answer: "主观题待老师批改", score: 24, status: "未答" },
    ],
  },
];

export const seedStudents: string[] = ["王子涵"];

export const seedRisk: Risk[] = [
  { name: "王子涵", risk: "需关注", point: "欧姆定律、实验表达" },
];

export const seedUsers: UserRow[] = [
  { name: "张老师", role: "教师", org: "光明中学 / 初三(1)班", status: "启用" },
  { name: "李老师", role: "教师", org: "光明中学 / 初三(2)班", status: "启用" },
  { name: "王子涵", role: "学生", org: "初三(1)班", status: "启用" },
  { name: "赵管理员", role: "校区管理员", org: "光明中学校区", status: "启用" },
];

export const seedKnowledge: Knowledge[] = [
  { name: "安全用电", mastery: 82, count: 2 },
  { name: "欧姆定律", mastery: 68, count: 2 },
  { name: "串并联电路", mastery: 55, count: 2 },
];

// 学生明细（legacy studentsForClass 派生），用于 org 学生表与详情弹窗。
export const seedStudentDetails = [
  {
    id: "stu-wzh",
    name: "王子涵",
    className: "初三(1)班",
    studentNo: "20240118",
    phone: "139****0000",
    parentPhone: "138****8888",
    score: "—",
    completion: 0,
    weakPoint: "欧姆定律、实验表达",
    risk: "需关注",
    account: "已激活",
    lastLogin: "今天 08:20",
  },
];
