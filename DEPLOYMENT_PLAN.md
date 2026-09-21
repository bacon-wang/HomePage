# Ubuntu 后端与主页部署计划

这份文档是“在 Ubuntu 上实现后端并部署 Homepage”任务的执行基线。后续实现、部署和验收都以此文件为准；如果需求发生变化，先更新本文件，再修改代码或服务器配置。

## 1. 目标与当前边界

将当前个人主页和数字分身聊天服务部署到 Ubuntu 服务器，首版通过服务器公网 IP 访问：

```text
浏览器
  ↓
http://119.23.144.160
  ↓
Node.js 服务（Docker Compose）
  ├─ 静态主页
  └─ /api/chat
       ↓
    FHL Responses API
       ↓
    模型服务
```

GitHub Pages 和现有 Cloudflare Worker 暂时保留，分别作为公开备用页面和 AI 接口回退入口。

首版不处理域名、HTTPS、登录、数据库、长期聊天记录、流式输出、管理后台或复杂监控。

## 2. 服务器与部署约定

- 主机：`119.23.144.160`
- SSH 用户：`bacon`
- SSH 端口：`22`
- 系统：Ubuntu 26.04 LTS
- 项目目录：`/home/bacon/project`
- Node.js：`22.22.1`（已安装）
- 容器运行时：Docker Engine + Docker Compose v2（待安装）
- 访问入口：`http://119.23.144.160`
- 进程管理：Docker Compose
- 后续发布：GitHub Actions 通过 SSH 自动部署

服务器端的第三方平台密钥只存放在服务器 `.env` 或等价 Secret 中，不能提交到 Git、前端文件或 Actions 日志。

## 3. 目标项目结构

```text
/home/bacon/project
├── server/
│   ├── src/index.js
│   ├── package.json
│   └── Dockerfile
├── index.html
├── styles.css
├── app.js
├── assets/
├── docker-compose.yml
├── .env.example
└── deploy/
    └── chat-config.server.js
```

实际实现可以复用仓库现有前端文件，但不能破坏 GitHub Pages 的静态发布结构。

## 4. 后端接口与行为

Node.js 使用原生 `http` 模块，首版尽量少引入依赖。服务至少提供：

```http
GET /
GET /health
POST /api/chat
```

聊天请求格式保持与现有前端兼容：

```json
{
  "messages": [
    { "role": "user", "content": "你最近在做什么？" }
  ]
}
```

成功响应格式：

```json
{
  "message": {
    "role": "assistant",
    "content": "没干啥啊，就学学习，健健身。"
  }
}
```

后端必须保留这些保护措施：

- 最多接收最近 8 条消息
- 单条消息最多 240 个字符
- 限制请求体大小
- 基于 IP 的基础请求频率限制
- FHL 请求超时和错误转换
- 统一 JSON 错误响应
- 不记录用户消息正文
- 不向浏览器暴露第三方平台密钥

数字分身的人设和回答规则沿用当前 Cloudflare Worker 版本，避免服务器版和 Pages 版表现不一致。

## 5. 前端接口切换

服务器版本使用同源地址：

```js
window.CHAT_API_URL = "/api/chat";
```

GitHub Pages 继续使用现有 Cloudflare Worker 地址。两套发布环境互不覆盖：

- GitHub Pages → Cloudflare Worker
- Ubuntu 主页 → Ubuntu `/api/chat`

Worker 或服务器接口不可用时，前端继续使用本地关键词回答作为永久兜底。

## 6. 执行阶段

### 阶段 A：服务器准备

1. 在远端安装 Docker Engine 和 Docker Compose v2。
2. 确认 Docker 服务可由 `bacon` 用户使用，或明确记录需要的 sudo 配置。
3. 确认云服务器安全组允许 TCP `80` 端口。
4. 检查 `/home/bacon/project` 的权限和磁盘空间。

### 阶段 B：实现后端

1. 新增 Node.js 原生 HTTP 服务。
2. 实现静态文件服务、`/health` 和 `/api/chat`。
3. 将当前 FHL 请求逻辑、人设提示词、校验、限流和错误处理迁移到服务器后端。
4. 添加后端 Dockerfile 和依赖清单。

### 阶段 C：容器化与首次部署

1. 添加 `docker-compose.yml`。
2. 添加不含密钥的 `.env.example`。
3. 在服务器创建仅服务器可读的 `.env`：

   ```env
   FHL_API_KEY=服务器上的第三方平台密钥
   FHL_BASE_URL=https://www.fhl.mom/responses
   MODEL=gpt-5.6-terra
   PORT=3000
   ```

4. 将项目同步到 `/home/bacon/project`。
5. 执行 `docker compose up -d --build`。
6. 通过本机和公网 IP 检查 `/health`、主页资源和聊天请求。

### 阶段 D：自动部署

首次手动部署通过验收后，再启用 GitHub Actions SSH 自动发布：

1. 使用专用部署 SSH 密钥，不复用个人私钥。
2. 配置 `SERVER_HOST`、`SERVER_USER`、`SERVER_PORT`、`SERVER_SSH_KEY` 和 `SERVER_KNOWN_HOSTS`。
3. 推送 `main` 后同步代码到 `/home/bacon/project`。
4. 保留服务器 `.env`，执行 `docker compose up -d --build`。
5. 部署后自动检查 `/health`；失败时保留旧容器运行。

## 7. 验收标准

### 页面

- `http://119.23.144.160` 可以打开主页。
- CSS、JavaScript、头像/背景图片和项目链接正常。
- 桌面端和 375px 手机端没有横向滚动。
- `Hi` 悬浮球、聊天窗口、快捷提问和输入发送正常。

### 后端

- `GET /health` 返回 HTTP 200 和 `ok`。
- 合法 `POST /api/chat` 能返回 FHL 模型回答。
- 空消息、超长消息和超大请求体会被拒绝。
- 超时、上游错误和限流会返回明确 JSON 错误。
- 日志、页面源码、浏览器请求参数和 GitHub Actions 输出中都没有 API Key。

### 回退

- GitHub Pages 仍可访问：<https://bacon-wang.github.io/HomePage/>。
- Cloudflare Worker 仍保留。
- Ubuntu 服务异常时，前端仍能回退到本地关键词回答。

## 8. 变更规则

- 新需求先更新本计划，再开始实现。
- 不在首版引入域名、HTTPS、数据库或用户系统。
- 不把服务器密钥、SSH 私钥或密码写入仓库。
- 不删除 GitHub Pages 或 Cloudflare Worker，除非单独确认迁移完成并需要清理。
