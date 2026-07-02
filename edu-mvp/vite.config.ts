import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 开发服务器代理后端 FastAPI，前端用相对 /api 调用，避免 CORS / 硬编码地址。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
});
