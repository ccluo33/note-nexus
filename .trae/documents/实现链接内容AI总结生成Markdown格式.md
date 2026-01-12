1. 修改 `summarizeWebContent` 函数，调整提示词，要求AI生成Markdown格式的总结
2. 确保生成的总结包含标题、主要观点和关键信息，并使用Markdown格式呈现
3. 保持现有的AI模型调用逻辑不变，继续使用设置的对话模型
4. 保持现有的链接内容获取方法不变
5. 确保生成的Markdown格式简洁、易读，包含适当的标题层级和列表

修改文件：

* `d:\workspace\note-nexus\src\lib\ai.ts`

修改内容：

* 调整 `summarizeWebContent` 函数中的提示词，明确要求AI生成Markdown格式的总结

* 添加Markdown格式要求，如使用标题、列表、加粗等元素

* 保持其他功能逻辑不变，包括AI模型调用、超时处理和错误处理

