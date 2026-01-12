# 将向量存储迁移到ChromaDB的实现计划

## 1. 项目分析

### 当前实现
- 基于IndexedDB的向量存储
- 前端直接操作向量数据库
- 主要功能：向量初始化、插入/更新、查询、删除
- 向量数据结构包含：id、filename、chunk_id、content、embedding、updated_at

### 目标架构
- 后端使用ChromaDB存储向量数据
- 前端通过API调用后端向量服务
- 保持与现有功能的兼容性

## 2. 实现步骤

### 步骤1：安装ChromaDB依赖
- 在后端项目中安装chromadb库
- 配置ChromaDB存储路径和参数

### 步骤2：创建ChromaDB向量服务
- 创建`backend/app/services/chromadb_service.py`文件
- 实现向量存储的核心功能：
  - 初始化ChromaDB客户端
  - 向量插入/更新
  - 相似文档查询
  - 按文件名删除向量
  - 获取向量统计信息

### 步骤3：创建向量存储API接口
- 在`backend/app/api/v1/endpoints/`下创建`vector.py`文件
- 实现REST API接口：
  - `POST /api/v1/vector/upload` - 上传向量
  - `GET /api/v1/vector/similar` - 查询相似文档
  - `DELETE /api/v1/vector/{filename}` - 删除文件向量
  - `GET /api/v1/vector/status` - 获取向量存储状态

### 步骤4：更新前端向量存储调用
- 修改`src/lib/browser-adapter/core.ts`，添加向量服务API调用
- 更新`src/db/vector.ts`，使用新的API接口
- 保持现有函数签名不变，实现平滑迁移

### 步骤5：更新RAG功能
- 修改`src/lib/rag.ts`，确保使用新的向量存储API
- 测试完整的RAG流程

### 步骤6：测试和验证
- 测试向量插入功能
- 测试相似文档查询功能
- 测试删除功能
- 验证RAG功能正常工作

## 3. 关键技术点

### ChromaDB配置
- 存储路径设置
- 集合创建和管理
- 向量维度配置

### API设计
- RESTful API设计
- 适当的错误处理
- 性能优化

### 数据迁移
- 考虑从旧存储迁移到ChromaDB的策略
- 确保数据一致性

## 4. 代码结构

### 后端
```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── vector.py      # 向量存储API
│   └── services/
│       └── chromadb_service.py    # ChromaDB服务实现
└── requirements.txt               # 添加chromadb依赖
```

### 前端
```
src/
├── db/
│   └── vector.ts                 # 更新向量存储调用
└── lib/
    ├── browser-adapter/
    │   └── core.ts               # 添加向量服务API调用
    └── rag.ts                    # 更新RAG功能
```

## 5. 预期效果

- 向量数据存储在ChromaDB中
- 保持现有功能不变
- 提高向量查询性能
- 支持更丰富的向量搜索功能
- 便于后续扩展和维护