#!/bin/bash
# 启动 Claude ⇄ Figma 的 WebSocket 桥(读写 Figma 用)。默认端口 3055。
# 用法: bash scripts/figma-socket.sh   (保持窗口开着,或用 & 后台跑)
export PATH="/opt/homebrew/bin:$HOME/.bun/bin:$PATH"
if ! command -v bun >/dev/null 2>&1; then
  echo "❌ 未找到 bun,请先安装: brew install bun"; exit 1
fi
SOCK="$HOME/.figma-mcp/node_modules/claude-talk-to-figma-mcp/dist/socket.js"
if [ ! -f "$SOCK" ]; then
  echo "📦 首次运行,安装 socket 依赖到 ~/.figma-mcp ..."
  mkdir -p "$HOME/.figma-mcp" && (cd "$HOME/.figma-mcp" && npm init -y >/dev/null 2>&1 && npm install claude-talk-to-figma-mcp@1.0.0 --no-audit --no-fund)
fi
echo "🔌 启动 Figma WebSocket 桥 (端口 3055)... 保持本窗口开着"
exec bun "$SOCK"
