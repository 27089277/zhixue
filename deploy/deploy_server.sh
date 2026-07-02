#!/bin/bash
# 智学云教 一键部署（在服务器以 root 运行）：拉 GitHub + 构建前后端 + 起 MySQL/服务 + nginx
# 用法: curl -fsSL https://raw.githubusercontent.com/27089277/zhixue/main/deploy/deploy_server.sh | sudo bash
set -e
export DEBIAN_FRONTEND=noninteractive
LOG(){ echo -e "\n==== $* ===="; }

LOG "apt base"
apt-get update -y -q
apt-get install -y -q git openjdk-21-jdk maven nginx docker.io docker-compose-v2 curl
systemctl enable --now docker

LOG "node 20"
NEED_NODE=1
if command -v node >/dev/null 2>&1; then
  [ "$(node -v | sed 's/v//;s/\..*//')" -ge 20 ] && NEED_NODE=0
fi
if [ "$NEED_NODE" = 1 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -q nodejs
fi
node -v; java -version 2>&1 | head -1

LOG "clone/update repo"
mkdir -p /opt/zhixue
if [ -d /opt/zhixue/src/.git ]; then
  cd /opt/zhixue/src && git fetch --all -q && git reset --hard origin/main
else
  git clone -q https://github.com/27089277/zhixue.git /opt/zhixue/src
fi

LOG "build frontend"
cd /opt/zhixue/src/edu-mvp
npm ci --no-audit --no-fund
npm run build
rm -rf /opt/zhixue/web && mkdir -p /opt/zhixue/web && cp -r dist/* /opt/zhixue/web/

LOG "build backend"
cd /opt/zhixue/src/server
mvn -q -DskipTests package
cp target/zhixue-server-1.0.0.jar /opt/zhixue/app.jar

LOG "mysql (docker)"
cp /opt/zhixue/src/docker-compose.yml /opt/zhixue/docker-compose.yml
cd /opt/zhixue && docker compose up -d
for i in $(seq 1 60); do
  cid=$(docker ps -qf name=mysql)
  [ -n "$cid" ] && docker exec "$cid" mysqladmin ping -uzhixue -pzhixue --silent 2>/dev/null && { echo "mysql UP"; break; }
  sleep 3
done

LOG "env + systemd"
mkdir -p /opt/zhixue/media
if [ ! -f /opt/zhixue/zhixue.env ]; then
cat > /opt/zhixue/zhixue.env <<ENV
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_TIMEOUT_SECONDS=90
DB_USER=zhixue
DB_PASSWORD=zhixue
MEDIA_DIR=/opt/zhixue/media
ENV
fi
chmod 600 /opt/zhixue/zhixue.env
cat > /etc/systemd/system/zhixue.service <<UNIT
[Unit]
Description=Zhixue Spring Boot Backend
After=network.target docker.service
Requires=docker.service
[Service]
Type=simple
WorkingDirectory=/opt/zhixue
EnvironmentFile=/opt/zhixue/zhixue.env
ExecStart=/usr/bin/java -Xmx768m -jar /opt/zhixue/app.jar
Restart=on-failure
RestartSec=5
User=root
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable zhixue
systemctl restart zhixue

LOG "nginx"
cat > /etc/nginx/sites-available/zhixue <<'NGINX'
server {
    listen 80 default_server;
    server_name _;
    root /opt/zhixue/web;
    index index.html;
    client_max_body_size 210m;
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 180s;
    }
    location / { try_files $uri $uri/ /index.html; }
}
NGINX
ln -sf /etc/nginx/sites-available/zhixue /etc/nginx/sites-enabled/zhixue
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
command -v ufw >/dev/null && { ufw allow 22/tcp || true; ufw allow 80/tcp || true; }

LOG "wait app seed"
for i in $(seq 1 80); do curl -sf http://127.0.0.1:8080/api/bootstrap >/dev/null 2>&1 && { echo "app UP"; break; }; sleep 3; done

LOG "trim to 1 admin/1 teacher/1 student, clear other data"
set +e
cid=$(docker ps -qf name=mysql)
docker exec "$cid" mysql -uroot -proot-change-me zhixue 2>/dev/null <<'SQL'
DELETE FROM app_users WHERE role='教师' AND phone<>'13800000000';
DELETE FROM app_users WHERE role='学生' AND phone<>'13900000000';
DELETE FROM app_users WHERE role LIKE '%管理%' AND phone<>'13700000000';
DELETE FROM classes WHERE name<>'初三(1)班';
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE questions;TRUNCATE papers;TRUNCATE assignments;TRUNCATE submissions;TRUNCATE videos;TRUNCATE knowledge;TRUNCATE risks;
SET FOREIGN_KEY_CHECKS=1;
UPDATE classes SET count=1 WHERE name='初三(1)班';
UPDATE app_users SET class_name='初三(1)班' WHERE phone='13900000000';
SQL
set -e

LOG "DEPLOY_DONE"
