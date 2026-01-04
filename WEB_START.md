# 网页版启动说明

本项目已从 Tauri 桌面应用转换为纯网页应用。

## 环境要求

- Node.js 18+ 
- npm 或 pnpm

## 安装依赖

```bash
npm install
# 或
pnpm install
```

## 开发模式

启动开发服务器：

```bash
npm run dev
# 或
pnpm dev
```

应用将在 `http://localhost:3456` 启动。

## 构建生产版本

构建生产版本：

```bash
npm run build
# 或
pnpm build
```

## 启动生产服务器

```bash
npm start
# 或
pnpm start
```

## 主要变更

1. **文件系统**: 使用 IndexedDB 存储文件，替代 Tauri 的文件系统 API
2. **数据库**: 使用 IndexedDB 替代 SQLite
3. **存储**: 使用 localStorage 替代 Tauri Store
4. **路径处理**: 使用浏览器适配层处理路径
5. **HTTP 请求**: 使用原生 fetch API
6. **剪贴板**: 使用浏览器 Clipboard API

## 注意事项

- 数据存储在浏览器的 IndexedDB 和 localStorage 中
- 文件操作通过浏览器 API 实现，受浏览器安全限制
- 某些桌面应用特有的功能（如全局快捷键、系统托盘等）在网页版中可能不可用或有限制

## 移动端适配

项目已包含移动端适配，支持响应式设计，可在移动浏览器中正常使用。

