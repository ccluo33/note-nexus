## 增强Markdown编辑器功能

### 问题分析
- Markdown编辑器使用Vditor库实现
- 工具栏配置中已经包含了`upload`、`link`和`table`按钮
- 图片上传功能已经实现，但需要确保正确使用FastDFS
- 可能需要调整配置，确保这些功能正常工作

### 实施计划
1. **检查并优化Vditor配置**
   - 确保`link`、`table`功能正确启用
   - 验证`upload`配置是否正确
   - 检查编辑器模式下这些功能是否可用

2. **确保图片上传使用FastDFS**
   - 验证`uploadImage`函数是否正确调用FastDFS上传
   - 检查FastDFS配置是否正确读取
   - 测试图片上传功能

3. **调整工具栏配置**
   - 确保`link`、`table`、`upload`按钮在合适的位置可见
   - 根据需要调整按钮顺序和分组

4. **测试功能**
   - 测试插入链接功能
   - 测试插入表格功能
   - 测试上传图片到FastDFS功能
   - 验证所有功能在不同编辑模式下正常工作

### 预期结果
- Markdown编辑器支持插入链接
- 支持插入表格
- 支持上传图片到FastDFS
- 所有功能在不同编辑模式下正常工作

### 关键文件
- `src/app/core/article/md-editor.tsx` - 编辑器主配置
- `src/app/core/article/toolbar.config.ts` - 工具栏配置
- `src/lib/imageHosting/index.ts` - 图片上传逻辑
- `src/lib/imageHosting/fastdfs.ts` - FastDFS上传实现