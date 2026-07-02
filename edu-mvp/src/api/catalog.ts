import { API_BASE } from "./client";
import type {
  Assignment,
  ClassInfo,
  Paper,
  Question,
  UserRow,
  Video,
} from "../types";

// 所有写操作都同步到后端 MySQL（失败静默，不影响本地展示）。
function send(method: string, path: string, body?: unknown) {
  fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {});
}

export const persistQuestion = (q: Question) => send("POST", "/questions", q);
export const persistPaper = (p: Paper) => send("POST", "/papers", p);
export const persistVideo = (v: Video) => send("POST", "/videos", v);
export const persistUser = (u: UserRow) => send("POST", "/users", u);
export const persistClass = (c: ClassInfo) => send("POST", "/classes", c);
export const persistAssignment = (a: Assignment) => send("POST", "/assignments", a);
export const updateQuestionApi = (id: number, q: Question) =>
  send("PUT", `/questions/${id}`, q);
export const persistSubmission = (sub: unknown) => send("POST", "/submissions", sub);

// 删除同步到后端 MySQL（失败静默）
function del(path: string) {
  fetch(`${API_BASE}${path}`, { method: "DELETE" }).catch(() => {});
}
export const deleteQuestionApi = (id: number) => del(`/questions/${id}`);
export const deletePaperApi = (id: string) => del(`/papers/${id}`);
export const deleteVideoApi = (id: number) => del(`/videos/${id}`);
export const deleteUserApi = (id: number) => del(`/users/${id}`);
export const deleteClassApi = (name: string) => del(`/classes/${encodeURIComponent(name)}`);
export const deleteSubmissionApi = (id: string) => del(`/submissions/${encodeURIComponent(id)}`);
