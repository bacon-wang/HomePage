# 王培根 / Personal

一个原生 HTML、CSS、JavaScript 编写的个人主页，包含本地演示版数字分身聊天区。

## 本地预览

直接打开 `index.html`，或在项目目录运行：

```bash
python3 -m http.server 4173
```

然后访问 <http://127.0.0.1:4173/>。

## 项目结构

- `index.html`：页面结构与个人信息
- `styles.css`：黑白视觉、响应式布局和组件样式
- `app.js`：聊天交互、AI 请求和本地关键词兜底
- `chat-config.js`：公开的聊天 API 地址配置
- `worker/`：Cloudflare Worker API 代理

## 添加个人信息方格

页面下方的模块墙由 `index.html` 中的 `.module-tile` 独立方格组成。添加内容时，可以复制一个现有的 `<article class="module-tile">`，替换标题和正文，并按需要使用这些布局类：

- `module-featured`：两列两行的大模块
- `module-wide`：横跨两列的模块
- `module-dark`：黑底反差模块
- `module-compact`：适合短内容的小模块

桌面端使用多列方格，手机端会自动变成单列，不需要额外修改 JavaScript。

## 发布到 GitHub Pages

仓库已经配置了 [Static HTML workflow](.github/workflows/static.yml)，会在 `main` 分支有新提交时自动部署。

1. 将本目录的改动提交并推送到 GitHub 的 `main` 分支。
2. 在仓库的 **Actions** 页面等待 `Deploy static content to Pages` 工作流完成。
3. 部署成功后，通过 <https://bacon-wang.github.io/HomePage/> 访问网站。

如果是第一次开启 Pages，需要在 **Settings → Pages** 将 Source 设置为 `GitHub Actions`。

聊天区使用 `chat-config.js` 中的公开 Worker 地址；Worker 不可用时会退回本地关键词回答。访客消息会发送到 Cloudflare Worker，再由 Worker 通过 FHL 第三方平台转发到模型服务；平台 API Key 不会进入前端或 GitHub 仓库。请勿在聊天中输入敏感信息。

## 接入真实 AI

真实 AI 的调用链是：

```text
GitHub Pages -> Cloudflare Worker -> FHL Responses API -> 模型服务
```

### Cloudflare 配置

在本地登录 Cloudflare 并部署 Worker：

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

Worker 默认名称为 `bacon-homepage-chat`，上游地址为 `https://www.fhl.mom/responses`，模型通过 `OPENAI_MODEL` 配置，默认使用平台文档列出的 `gpt-5.6-terra`。`OPENAI_API_KEY` 是 FHL 平台签发的密钥，不是 OpenAI 官方密钥。

### GitHub 配置

在仓库的 **Settings → Secrets and variables → Actions** 中添加：

Secrets：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Variables：

- `CHAT_API_URL`：可选，用于覆盖 `chat-config.js` 中的公开 Worker 地址

推送到 `main` 会触发 Pages 工作流；修改 `worker/` 还会触发 Worker 工作流，后者在尚未配置上述两个 GitHub Secrets 时会跳过自动部署，可继续使用本地 Wrangler 手动部署。需要纯本地演示时，将 `chat-config.js` 中的地址改为空字符串即可。

本地调试 Worker 时，可复制 `worker/.dev.vars.example` 为 `worker/.dev.vars`，填入本地 API Key，再运行：

```bash
npm run dev --prefix worker
```

不要提交 `worker/.dev.vars` 或任何 API Key。

## 图片来源

- 三角洲行动背景图：腾讯游戏官方素材
- 无畏契约背景图：腾讯游戏官方素材
- 健身背景图：用户提供的个人健身照片
