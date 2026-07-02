// 全部业务类型，字段对齐 legacy app.js 的 state 结构。

export type Role = "teacher" | "student" | "admin";

export type Section =
  | "workspace"
  | "org"
  | "bank"
  | "homework"
  | "grading"
  | "video"
  | "analytics"
  | "admin";

export type BankView = "questions" | "papers" | "videos";
// public=公共库(含学生) teacher=教师题库(所有老师) private=教师私人库(仅创建者,可共享) student=学生练习库
export type Visibility = "public" | "teacher" | "private" | "student";
export type QuestionType = "单选题" | "多选题" | "填空题" | "解答题";

export interface PaperItem {
  no: number;
  type: string;
  title: string;
  choices?: string[];
  answer: string;
  analysis?: string;
  score: number;
  knowledge?: string[];
  images?: string[];
  videoUrl?: string; // 讲解视频（学生交卷后可看）
  videoName?: string;
  status: "未答" | "已答";
}

export interface Paper {
  id: string;
  title: string;
  exam: string;
  subject: string;
  stage?: string; // 小学 | 初中 | 高中
  grade?: string;
  region: string;
  year: number;
  duration: number;
  score: number;
  questions: number;
  progress: number;
  difficulty: string;
  sections: string[];
  tags: string[];
  visibility: Visibility;
  owner: string;
  source: string;
  sharedWith: string[];
  items: PaperItem[];
}

export interface Question {
  id?: number; // 后端 MySQL 主键（用于删除/更新）
  title: string;
  type: string;
  point: string;
  source: string;
  visibility: Visibility;
  owner: string;
  origin: string;
  subject?: string;
  stage?: string; // 小学 | 初中 | 高中
  grade?: string;
  paperId?: string;
  paperTitle?: string;
  analysis?: string;
  answer?: string;
  choices?: string[];
  difficulty?: string;
  images?: string[]; // 题目配图（base64 data URL）
  videoName?: string; // 讲解视频文件名
  videoUrl?: string; // 讲解视频链接或小文件 data URL（可播放）
  sharedWith?: string[];
}

export interface Assignment {
  id: string;
  title: string;
  paperId: string;
  className: string;
  deadline: string;
  status: string; // 待完成 | 进行中
  createdAt: number;
  kind: string; // 作业 | 测验 | 考试
  mode: string; // paper | questions
  questionCount?: number;
  timeLimit?: number | null; // 限时分钟，null=不限时
  allowRedo?: boolean; // 是否允许重做（默认 false）
}

export interface Video {
  id?: number;
  name: string;
  title?: string;
  size: string;
  progress: number;
  status: string;
  owner: string;
  source: string;
  paperTitle?: string;
  point?: string;
}

export interface ClassInfo {
  name: string;
  count: number;
  owner: string;
  rate: number;
}

export interface UserRow {
  id?: number;
  name: string;
  role: string; // 教师 | 学生 | 校区管理员
  org: string;
  status: string; // 启用 | 停用 | 待激活
  phone?: string;
}

export interface Knowledge {
  name: string;
  mastery: number;
  count: number;
}

export interface Risk {
  name: string;
  risk: string;
  point: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  className: string;
  studentNo?: string;
  phone?: string;
  parentPhone?: string;
  score?: number | string;
  completion?: number;
  weakPoint?: string;
  risk?: string;
  account?: string;
  lastLogin?: string;
}

export interface AnswerEntry {
  value: string;
  savedAt: number;
}

export interface SubmittedResult {
  score: number;
  objectiveTotal: number;
  submittedAt: number;
  unanswered: number;
  pendingManual: number;
  finalScore?: number;
  manualScore?: number;
  feedback?: string;
  returned?: boolean;
  gradedAt?: number;
  studentName?: string;
  studentPhone?: string;
  annotations?: Record<number, string>; // 老师批注图片 URL（按题号）
}

// 一份学生答卷记录（教师侧全量数据源；DB submissions 表按 paperId__phone 主键）。
export interface SubmissionRecord extends SubmittedResult {
  id: string; // `${paperId}__${phone}`
  paperId: string;
  answers?: Record<number, AnswerEntry | string>;
}

export interface ExamState {
  mode: "library" | "exam";
  currentNo: number;
  startedAt: number | null;
  endsAt: number | null;
  answers: Record<string, Record<number, AnswerEntry>>;
  submitted: Record<string, SubmittedResult>;
}

export interface RoleProfile {
  name: string;
  scope: string;
  avatar: string;
  banner: string[];
  allowed: Section[];
}

export interface LoginAccount {
  name: string;
  avatar: string;
  scope: string;
  roles: Role[];
}

export interface PaperFilters {
  type: string;
  search: string;
  year: string;
  region: string;
}

export interface StudentMessage {
  id: number;
  senderRole: "teacher" | "student";
  teacherName: string;
  studentName: string;
  className: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

export type LoginMethod = "sms" | "password" | "restore" | "sso";

export interface LoginSession {
  role: Role;
  method: LoginMethod;
  name: string;
  scope: string;
  phone: string;
  loginAt: number;
  expiresAt: number;
}
