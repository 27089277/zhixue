# 智学云教后端

## 启动

```bash
cp backend/.env.example backend/.env
docker compose up -d mysql
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
backend/.venv/bin/uvicorn app.main:app --app-dir backend --reload --port 8000
```

API 文档：`http://127.0.0.1:8000/docs`

当前接口覆盖试卷查询、作业发布、答卷创建、答案自动保存、交卷自动判分和老师批改。

## DeepSeek AI

不要把 API Key 写进前端。后端通过环境变量读取：

```bash
export DEEPSEEK_API_KEY="你的 DeepSeek Key"
export DEEPSEEK_BASE_URL="https://api.deepseek.com"
export DEEPSEEK_MODEL="deepseek-v4-pro"
```

AI 接口覆盖真题卷结构化导入、AI 生成题目和 AI 自动组卷。

没有 Docker 时可使用 SQLite 做本地联调：

```bash
cd backend
DATABASE_URL=sqlite:///./zhixue-dev.db .venv/bin/python -m app.seed
DATABASE_URL=sqlite:///./zhixue-dev.db .venv/bin/uvicorn app.main:app --port 8000
```
