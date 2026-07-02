import { apiGet } from "./client";
import { useStore } from "../store/useStore";

// 启动时从后端拉取真实目录数据并填充 store；后端不可用时静默保留本地兜底数据。
export async function loadBootstrap(): Promise<boolean> {
  try {
    const data = await apiGet("/bootstrap");
    useStore.getState().hydrate({
      papers: data.papers,
      questions: data.questions,
      classes: data.classes,
      users: data.users,
      videos: data.videos,
      knowledge: data.knowledge,
      risk: data.risk,
      assignments: data.assignments,
      submissions: data.submissions,
    });
    return true;
  } catch {
    return false;
  }
}
