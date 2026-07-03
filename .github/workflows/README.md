# 自动部署（push 即部署）

`deploy.yml`：push 到 main（改动 edu-mvp/app/server/deploy）后，GitHub Actions 通过 SSH 登录服务器并运行 `deploy/deploy_server.sh`（拉最新代码→构建网页+App PWA+后端→重启）。

## 需在仓库添加 3 个 Secret
GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret：
- `SERVER_HOST` = 111.231.12.64
- `SERVER_USER` = ubuntu
- `SERVER_PASSWORD` = 服务器密码

添加后，以后 `git push` 即自动部署（也可在 Actions 页点 Run workflow 手动触发）。
建议后续改用 SSH 部署密钥替代密码更安全。
