#!/bin/bash

# 构建脚本
set -e

echo "=== 构建测试辅助工具 ==="

# 安装依赖
echo "[1/3] 安装依赖..."
npm install

# 类型检查
echo "[2/3] 类型检查..."
npm run lint 2>/dev/null || true

# 构建
echo "[3/3] 构建项目..."
npm run build

echo ""
echo "=== 构建完成 ==="
echo "运行 'npm start' 启动生产服务器"
