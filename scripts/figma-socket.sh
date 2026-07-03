#!/bin/bash
# 启动 Claude ⇄ Figma 的 WebSocket 中继(读写 Figma 用)。端口 3055。
# 协议对齐 cursor-talk-to-figma-mcp 插件;纯转发 + join 自确认,不做队列(避免创建命令被吞)。
# 用法: bash scripts/figma-socket.sh   (保持窗口开着,或用 & 后台跑)
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$PATH"
RELAY="$HOME/.figma-mcp/relay.js"
if [ ! -f "$RELAY" ]; then echo "❌ 找不到中继脚本 $RELAY"; exit 1; fi
# 释放可能占用 3055 的旧进程
lsof -tiTCP:3055 -sTCP:LISTEN 2>/dev/null | xargs -r kill 2>/dev/null
echo "🔌 启动 Figma WebSocket 中继 (端口 3055)... 保持本窗口开着"
exec node "$RELAY"
