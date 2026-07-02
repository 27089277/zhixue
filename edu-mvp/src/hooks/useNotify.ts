import { App } from "antd";
import type { Notify } from "../api/ai";

// 统一 toast：用 AntD message 替代 legacy toast()，并适配 ai.ts 的 Notify 签名。
export function useNotify(): Notify {
  const { message } = App.useApp();
  return (type, msg) => {
    if (type === "error") message.error(msg);
    else if (type === "success") message.success(msg);
    else message.info(msg);
  };
}
