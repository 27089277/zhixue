import { API_BASE } from "./client";
import type { ClassInfo, StudentDetail, StudentMessage } from "../types";

async function teacherGet<T>(path: string, phone: string): Promise<T> {
  if (!phone) throw new Error("登录身份缺少手机号，请重新登录");
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "X-User-Phone": phone },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `教师目录请求失败：${response.status}`);
  }
  return response.json();
}

async function userPost<T>(path: string, phone: string, body?: unknown): Promise<T> {
  if (!phone) throw new Error("登录身份缺少手机号，请重新登录");
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "X-User-Phone": phone, "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `请求失败：${response.status}`);
  }
  return response.json();
}

export interface Conversation {
  studentId: number;
  studentName: string;
  className: string;
  lastTitle: string;
  lastBody: string;
  lastAt: number;
  unread: number;
  messages: StudentMessage[];
}

// —— 老师端 ——
export const sendStudentMessage = (
  phone: string,
  studentId: string,
  msg: { title: string; body: string }
) => userPost(`/teacher/students/${studentId}/messages`, phone, msg);

export const listTeacherConversations = (phone: string) =>
  teacherGet<Conversation[]>("/teacher/conversations", phone);

export const teacherReply = (phone: string, studentId: number, body: string) =>
  userPost(`/teacher/students/${studentId}/reply`, phone, { body });

export const teacherMarkRead = (phone: string, studentId: number) =>
  userPost(`/teacher/students/${studentId}/read`, phone);

export const getTeacherUnread = (phone: string) =>
  teacherGet<{ unread: number }>("/teacher/unread", phone);

// —— 学生端 ——
export const listStudentMessages = (phone: string) =>
  teacherGet<StudentMessage[]>("/student/messages", phone);

export const studentReply = (phone: string, body: string) =>
  userPost("/student/messages/reply", phone, { body });

export const studentMarkReadAll = (phone: string) =>
  userPost("/student/messages/read", phone);

export const getStudentUnread = (phone: string) =>
  teacherGet<{ unread: number }>("/student/unread", phone);

export const listTeacherClasses = (phone: string) =>
  teacherGet<ClassInfo[]>("/teacher/classes", phone);

export const listTeacherClassStudents = (phone: string, className: string) =>
  teacherGet<StudentDetail[]>(
    `/teacher/classes/${encodeURIComponent(className)}/students`,
    phone
  );

export const getTeacherStudent = (phone: string, studentId: string) =>
  teacherGet<StudentDetail>(`/teacher/students/${studentId}`, phone);
