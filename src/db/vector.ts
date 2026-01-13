import { invoke } from '@/lib/browser-adapter/core';

// 向量数据库表结构定义
export interface VectorDocument {
  id: number;
  filename: string;   // 文件名
  chunk_id: number;   // 分块ID
  content: string;    // 分块内容
  embedding: string;  // 存储为JSON字符串的向量
  updated_at: number; // 时间戳
}

// 初始化向量数据库表（保持兼容，实际初始化在后端完成）
export async function initVectorDb() {
  // 不需要在前端初始化，因为向量存储现在在后端
  console.log('向量数据库初始化已移至后端ChromaDB');
}

// 插入或更新向量文档
export async function upsertVectorDocument(doc: Omit<VectorDocument, 'id'>) {
  // 将向量从JSON字符串转换为数组
  const embeddingArray = JSON.parse(doc.embedding) as number[];
  
  // 调用后端API上传向量
  await invoke<any>('vector_upload', {
    filename: doc.filename,
    chunk_id: doc.chunk_id,
    content: doc.content,
    embedding: embeddingArray
  });
}

// 获取指定文件名的所有向量文档（保持兼容，当前未使用）
export async function getVectorDocumentsByFilename() {
  // 目前前端不需要直接获取向量文档，此函数保持兼容
  return [];
}

// 通过文件名删除向量文档
export async function deleteVectorDocumentsByFilename(filename: string) {
  await invoke<any>('vector_delete', {
    filename: filename
  });
}

// 检查文件是否已存在于向量数据库中
export async function checkVectorDocumentExists(filename: string) {
  const result = await invoke<any>('vector_exists', {
    filename: filename
  });
  
  return result?.status === 'success' && result?.data?.exists === true;
}

// 获取最相似的文档片段
export async function getSimilarDocuments(
  queryEmbedding: number[], 
  limit: number = 5,
  threshold: number = 0.7
): Promise<{id: number, filename: string, content: string, similarity: number}[]> {
  console.log(`开始向量检索，查询向量维度: ${queryEmbedding.length}, 限制数量: ${limit}, 相似度阈值: ${threshold}`);
  
  const result = await invoke<any>('vector_similar', {
    query_embedding: queryEmbedding,
    limit: limit,
    similarity_threshold: threshold
  });
  
  if (result?.status === 'success' && result?.data) {
    console.log(`向量检索成功，返回 ${result.data.length} 个结果:`);
    result.data.forEach((doc: any, index: number) => {
      console.log(`  结果 ${index + 1}: 文件名=${doc.filename}, 相似度=${doc.similarity}, 内容预览=${doc.content.substring(0, 100)}...`);
    });
    
    // 将后端返回的结果转换为前端期望的格式
    return result.data.map((doc: any) => ({
      id: parseInt(doc.id.split('_')[1]) || 0,  // 从doc_id中提取chunk_id作为id
      filename: doc.filename,
      content: doc.content,
      similarity: doc.similarity
    }));
  } else {
    console.log('向量检索失败或返回空结果:', result);
  }
  
  return [];
}

// 清空向量数据库（保持兼容，实际实现在后端）
export async function clearVectorDb() {
  // 目前前端不需要直接清空向量数据库，此函数保持兼容
  console.log('清空向量数据库功能已移至后端ChromaDB');
}

// 获取所有向量文档的文件名列表（保持兼容，当前未使用）
export async function getAllVectorDocumentFilenames() {
  // 目前前端不需要直接获取文件名列表，此函数保持兼容
  return [];
}
