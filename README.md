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
- `app.js`：本地关键词聊天逻辑

## 发布到 GitHub Pages

1. 在 GitHub 创建一个公开仓库。
2. 将本目录推送到仓库的 `main` 分支。
3. 打开仓库的 **Settings → Pages**。
4. 将构建来源设置为 `Deploy from a branch`，选择 `main` 分支和 `/ (root)` 目录。
5. 等待 GitHub Pages 完成部署，然后使用生成的公开 URL 访问。

当前聊天区不依赖 API Key，也不会向外部服务发送访客输入。
