### 错误分析

**错误信息**：`Runtime Error: CollapsibleTrigger is not defined`

**错误原因**：在 `src/app/core/article/file/file-manager.tsx` 文件中，`Tree` 组件使用了 `CollapsibleTrigger` 组件，但没有从 `@/components/ui/collapsible` 中导入它。

**当前导入**：`import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"`

**缺失的导入**：`CollapsibleTrigger`

### 修复方案

**修改文件**：`src/app/core/article/file/file-manager.tsx`

**修改内容**：在导入语句中添加 `CollapsibleTrigger`

```typescript
// 修改前
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

// 修改后
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
```

### 修复原理

1. 这是一个简单的导入错误修复，确保所有使用的组件都被正确导入
2. Radix UI Collapsible 组件需要 `CollapsibleTrigger` 来触发展开/收起操作
3. 添加缺失的导入后，`Tree` 组件就能正常使用 `CollapsibleTrigger` 组件

### 预期效果

修复后，文件夹展开/收起功能将正常工作，不再出现 "CollapsibleTrigger is not defined" 错误，用户可以正常点击文件夹来展开和收起文件列表。