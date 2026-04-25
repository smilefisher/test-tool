# 测试辅助工具

一个用于管理数据库操作工具的平台，支持 Redis、MySQL、MongoDB。

## 功能特性

- **工具市场**：展示所有可用工具，支持收藏
- **工具执行**：填写参数，执行数据库操作
- **工具管理**：CRUD 操作
- **数据库连接**：统一管理数据库连接配置
- **收藏功能**：本地浏览器收藏常用工具

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件配置数据库连接
```

### 3. 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 生产构建

```bash
# 方式一：使用构建脚本
chmod +x scripts/build.sh
./scripts/build.sh

# 方式二：手动构建
npm run build
npm start
```

## 部署方式

### Docker Compose（推荐）

```bash
# 启动所有服务（包含数据库）
docker-compose up -d

# 访问应用
open http://localhost:3000
```

### Docker（仅应用）

```bash
# 构建镜像
docker build -t test-tool .

# 运行容器
docker run -d -p 3000:3000 \
  --env-file .env \
  -v ./data:/app/data \
  test-tool
```

### 传统部署

```bash
# 1. 构建
npm run build

# 2. 启动
chmod +x scripts/start.sh
./scripts/start.sh
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |
| REDIS_PASSWORD | Redis 密码 | - |
| MYSQL_HOST | MySQL 主机 | localhost |
| MYSQL_PORT | MySQL 端口 | 3306 |
| MYSQL_USER | MySQL 用户 | root |
| MYSQL_PASSWORD | MySQL 密码 | - |
| MYSQL_DATABASE | MySQL 数据库 | test |
| MONGODB_URI | MongoDB 连接 URI | mongodb://localhost:27017 |

## 目录结构

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页
│   │   ├── tool/[id]/page.tsx   # 工具执行页
│   │   ├── admin/                # 管理后台
│   │   └── api/                   # API 路由
│   └── lib/
│       ├── db.ts                 # 数据库层
│       └── executor.ts           # 执行器
├── scripts/
│   ├── build.sh                 # 构建脚本
│   └── start.sh                 # 启动脚本
├── data/                        # SQLite 数据库（自动创建）
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## 使用流程

### 1. 添加数据库连接

管理后台 → 数据库连接 → 新建连接

### 2. 创建工具

管理后台 → 新建工具 → 填写信息

**参数配置**：
- 名称：参数标识符（用于命令中引用）
- 标签：显示名称
- 类型：string / number / boolean
- 必填：是否必填

**执行步骤**：
- 选择数据库类型
- 选择连接（可选，默认使用环境变量配置）
- 编写命令（使用 `{{参数名}}` 引用参数）

### 3. 执行工具

首页 → 点击工具 → 填写参数 → 执行

## 命令示例

### MySQL

```sql
DELETE FROM users WHERE id = {{userId}}
UPDATE sessions SET status = 'expired' WHERE user_id = {{userId}}
```

### Redis

```bash
DEL user:{{userId}}:token
HSET user:{{userId}} loginTime ""
```

### MongoDB

```javascript
db.users.deleteOne({userId: "{{userId}}"})
db.sessions.updateOne({userId: "{{userId}}"}, {$set: {loginTime: null}})
```

## 技术栈

- **框架**：Next.js 14 (App Router)
- **样式**：Tailwind CSS
- **数据库**：SQLite (better-sqlite3)
- **客户端库**：ioredis / mysql2 / mongodb
