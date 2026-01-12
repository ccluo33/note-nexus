## 1. 移除 Tauri 相关配置和代码

### 1.1 清理配置文件
- 删除 `src-tauri` 目录（包含所有 Tauri 相关代码）
- 删除 `tauri.conf.json` 文件
- 修改 `package.json`：
  - 移除 Tauri 相关依赖和脚本
  - 简化项目配置

### 1.2 修改 Next.js 配置
- 更新 `next.config.ts`：
  - 移除 Tauri 相关配置（如 `TAURI_DEV_HOST`）
  - 调整 `assetPrefix` 配置
  - 移除不必要的配置项

### 1.3 清理前端代码中的 Tauri 调用
- 搜索并替换所有 `window.__TAURI__` 或 `invoke` 调用
- 替换为普通的 HTTP 请求或 API 调用

## 2. 创建 Python 后端结构

### 2.1 后端目录结构
- 创建 `backend/` 目录
- 配置 Python 虚拟环境和依赖管理（`requirements.txt` 或 `pyproject.toml`）
- 设置 Python Web 框架（如 FastAPI 或 Flask）

### 2.2 实现后端 API
- 分析当前 Tauri 命令，创建对应的 Python API 端点：
  - WebDAV 相关功能（`webdav_test`, `webdav_backup`, `webdav_sync`, `webdav_create_dir`）
  - MCP 服务器功能（`start_mcp_stdio_server`, `stop_mcp_server`, `send_mcp_message`）
  - 设备 ID 获取（`get_device_id`）
  - URL 内容获取（`fetch_url_content`）

### 2.3 数据库配置
- 配置合适的数据库（如 SQLite 或 PostgreSQL）
- 实现数据模型和迁移

## 3. 调整前端代码

### 3.1 更新 API 调用方式
- 创建 API 客户端工具函数
- 替换所有 Tauri 命令调用为 HTTP 请求
- 处理 API 响应和错误

### 3.2 调整应用配置
- 更新环境变量配置
- 添加 API 基础 URL 配置
- 调整开发和生产环境配置

### 3.3 测试和验证
- 确保所有功能正常工作
- 测试 API 调用
- 验证页面渲染和交互

## 4. 配置开发和构建流程

### 4.1 更新脚本命令
- 修改 `package.json` 中的脚本：
  - 开发模式：启动 Next.js 开发服务器
  - 构建模式：生成静态文件
  - 预览模式：预览构建结果

### 4.2 添加后端开发脚本
- 添加 Python 后端启动脚本
- 配置前后端同时启动的开发流程

## 5. 文档更新

### 5.1 更新 README.md
- 移除 Tauri 相关内容
- 添加 Python 后端部署和开发说明
- 更新项目架构说明

### 5.2 添加 API 文档
- 生成 Python 后端 API 文档（如 FastAPI 的自动文档）
- 更新前端 API 调用文档

## 实现步骤

1. 首先清理 Tauri 相关配置和代码
2. 创建 Python 后端基础结构
3. 实现核心 API 端点
4. 修改前端代码适配新的 API 调用
5. 测试所有功能
6. 更新文档

这个计划将把项目从 Tauri 桌面应用转换为纯网页应用，使用 Python 后端提供 API 服务。