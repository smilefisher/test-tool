#!/bin/bash
set -e

REMOTE_HOST="192.168.1.61"
APP_NAME="test-tool"
REMOTE_USER="root"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARBALL="/tmp/${APP_NAME}.tar"

# 本地编译
echo "=== 本地编译 ==="
cd "${SCRIPT_DIR}"
pnpm install
pnpm run build

# 本地构建 Docker 镜像
echo "=== 本地构建 Docker 镜像 ==="
sudo docker build -t ${APP_NAME}:latest .

# 打包镜像
echo "=== 打包镜像 ==="
sudo docker save ${APP_NAME}:latest -o ${TARBALL}

# 传输到远程
echo "=== 传输镜像到 ${REMOTE_HOST} ==="
sudo scp -o StrictHostKeyChecking=no ${TARBALL} ${REMOTE_USER}@${REMOTE_HOST}:/tmp/

# 远程部署
echo "=== 远程部署 ==="
ssh -t -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
  set -e

  APP_NAME="test-tool"
  APP_DIR="/opt/${APP_NAME}"

  mkdir -p ${APP_DIR}/data
  sudo chown -R 1001:1001 ${APP_DIR}/data
  sudo chmod -R 777 ${APP_DIR}/data

  cd ${APP_DIR}
  sudo docker compose down 2>/dev/null || true
  sudo docker stop ${APP_NAME} 2>/dev/null || true
  sudo docker rm ${APP_NAME} 2>/dev/null || true

  sudo docker load -i /tmp/${APP_NAME}.tar

  sudo docker run -d \
    --name ${APP_NAME} \
    -p 1001:3000 \
    -v ${APP_DIR}/data:/app/data \
    --restart unless-stopped \
    ${APP_NAME}:latest

  echo ""
  echo "=== 部署完成 ==="
  echo "访问 http://$(hostname -I | awk '{print $1}'):1001"
ENDSSH

rm -f ${TARBALL}
echo "=== 完成 ==="
