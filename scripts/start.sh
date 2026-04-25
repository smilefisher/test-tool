#!/bin/bash

# 启动脚本
set -e

echo "=== 启动测试辅助工具 ==="

# 检查构建产物
if [ ! -d ".next" ]; then
    echo "错误: 未找到构建产物，请先运行 build.sh"
    exit 1
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "警告: 未找到 .env 文件，将使用默认配置"
fi

echo ""
echo "启动服务..."
echo "  访问地址: http://localhost:3000"
echo "  管理后台: http://localhost:3000/admin"
echo ""

npm start
