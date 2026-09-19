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

仓库已经配置了 [Static HTML workflow](.github/workflows/static.yml)，会在 `main` 分支有新提交时自动部署。

1. 将本目录的改动提交并推送到 GitHub 的 `main` 分支。
2. 在仓库的 **Actions** 页面等待 `Deploy static content to Pages` 工作流完成。
3. 部署成功后，通过 <https://bacon-wang.github.io/HomePage/> 访问网站。

如果是第一次开启 Pages，需要在 **Settings → Pages** 将 Source 设置为 `GitHub Actions`。

当前聊天区不依赖 API Key，也不会向外部服务发送访客输入。
