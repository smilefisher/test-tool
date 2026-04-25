#!/bin/bash

# 配置
REMOTE_HOST="192.168.1.61"
APP_NAME="test-tool"
REMOTE_USER="root"
REMOTE_DIR="/opt/${APP_NAME}"

# 本地打包
echo "=== 打包项目 ==="
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='data/tools.json' \
    -czf /tmp/${APP_NAME}.tar.gz -C /home/chenning/project/${APP_NAME} .

# 传输到远程
echo "=== 传输到 ${REMOTE_HOST} ==="
scp /tmp/${APP_NAME}.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:/tmp/

# 远程部署
echo "=== 远程部署 ==="
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
  set -e

  APP_NAME="test-tool"
  APP_DIR="/opt/${APP_NAME}"

  # 创建目录
  mkdir -p ${APP_DIR}/data

  # 解压
  tar -xzf /tmp/${APP_NAME}.tar.gz -C ${APP_DIR}

  # 停止旧容器
  cd ${APP_DIR}
  docker compose down 2>/dev/null || true

  # 构建并启动
  docker compose up -d --build

  echo ""
  echo "=== 部署完成 ==="
  echo "访问 http://$(hostname -I | awk '{print $1}'):1001"
ENDSSH

# 清理
rm -f /tmp/${APP_NAME}.tar.gz

echo "=== 完成 ==="
