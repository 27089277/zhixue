# 智学云教（zhixue）

K12 教学平台：教师出题/组卷/发布/批改、学生答题、学情分析。

- **edu-mvp/** 前端：React 18 + TypeScript + Vite + Ant Design
- **server/** 后端：Spring Boot + MySQL + 本地向量库 + DeepSeek 代理
- **backend/** 早期 FastAPI 版本（保留参考）

## 运行
```bash
# 前端
cd edu-mvp && npm install && npm run dev
# 后端（需 MySQL 与 backend/.env 中的 DEEPSEEK_API_KEY）
cd server && java -jar target/zhixue-server-1.0.0.jar
```
