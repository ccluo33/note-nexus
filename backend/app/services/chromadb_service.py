import chromadb
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime

class ChromaDBService:
    def __init__(self):
        # 使用新的ChromaDB客户端配置格式
        self.client = chromadb.PersistentClient(
            path='./chromadb_data'
        )
        # 创建或获取集合
        self.collection = self.client.get_or_create_collection(
            name='vector_documents',
            metadata={"description": "存储文档向量"}
        )
    
    def upsert_vector(self, filename: str, chunk_id: int, content: str, embedding: List[float]) -> None:
        """
        插入或更新向量
        
        Args:
            filename: 文件名
            chunk_id: 分块ID
            content: 分块内容
            embedding: 向量数据
        """
        # 生成唯一ID
        doc_id = f"{filename}_{chunk_id}"
        
        # 元数据
        metadata = {
            "filename": filename,
            "chunk_id": chunk_id,
            "updated_at": datetime.now().isoformat()
        }
        
        # 向量验证
        if not isinstance(embedding, list):
            raise ValueError(f"向量必须是列表类型，当前类型: {type(embedding)}")
        
        if len(embedding) == 0:
            raise ValueError("向量不能为空")
        
        # 检查向量中是否包含无效值
        for i, val in enumerate(embedding):
            if not isinstance(val, (int, float)):
                raise ValueError(f"向量第{i}个值必须是数字类型，当前值: {val}，类型: {type(val)}")
            if not isinstance(val, (int, float)) or not float(val) == val:
                raise ValueError(f"向量第{i}个值包含无效数值: {val}")
        
        # 限制内容长度
        if len(content) > 10000:
            content = content[:10000]  # 截断过长的内容
        
        try:
            # 插入或更新向量
            self.collection.upsert(
                ids=[doc_id],
                embeddings=[embedding],
                documents=[content],
                metadatas=[metadata]
            )
            print(f"成功插入/更新向量: {doc_id}, 向量维度: {len(embedding)}")
        except Exception as e:
            print(f"插入/更新向量失败: {doc_id}")
            print(f"错误详情: {type(e).__name__}: {e}")
            print(f"向量维度: {len(embedding)}")
            print(f"向量前10个值: {embedding[:10]}")
            print(f"内容长度: {len(content)}")
            raise
    
    def get_similar_documents(
        self, 
        query_embedding: List[float], 
        limit: int = 5, 
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        查询相似文档
        
        Args:
            query_embedding: 查询向量
            limit: 返回结果数量
            similarity_threshold: 相似度阈值
        
        Returns:
            相似文档列表
        """
        print(f"\n--- ChromaDB 内部检索 ---)")
        print(f"查询向量维度: {len(query_embedding)}")
        print(f"限制数量: {limit}")
        print(f"相似度阈值: {similarity_threshold}")
        print(f"查询向量前5个值: {query_embedding[:5]}")
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["documents", "metadatas", "distances"]
        )
        
        print(f"ChromaDB 原始查询结果:")
        print(f"  返回文档数量: {len(results['ids'][0])}")
        print(f"  文档ID列表: {results['ids'][0]}")
        print(f"  距离列表: {results['distances'][0]}")
        
        # 处理结果
        similar_docs = []
        for i in range(len(results["ids"][0])):
            doc_id = results["ids"][0][i]
            document = results["documents"][0][i]
            metadata = results["metadatas"][0][i]
            distance = results["distances"][0][i]
            
            # 转换距离为相似度（假设距离是欧几里得距离）
            similarity = 1 / (1 + distance) if distance is not None else 0
            
            print(f"\n  处理文档 {i+1}:")
            print(f"    文档ID: {doc_id}")
            print(f"    原始距离: {distance}")
            print(f"    转换后相似度: {similarity:.4f}")
            print(f"    相似度阈值: {similarity_threshold}")
            print(f"    是否通过阈值: {similarity >= similarity_threshold}")
            
            if similarity >= similarity_threshold:
                similar_docs.append({
                    "id": doc_id,
                    "filename": metadata["filename"],
                    "content": document,
                    "similarity": similarity
                })
        
        # 按相似度排序
        similar_docs.sort(key=lambda x: x["similarity"], reverse=True)
        
        print(f"\n--- ChromaDB 检索完成 ---)")
        print(f"通过阈值的文档数量: {len(similar_docs)}")
        
        return similar_docs
    
    def delete_vectors_by_filename(self, filename: str) -> None:
        """
        按文件名删除向量
        
        Args:
            filename: 文件名
        """
        # 获取所有匹配的文档
        results = self.collection.get(
            where={"filename": filename},
            include=["metadatas"]
        )
        
        if results["metadatas"]:
            # 从metadata中重建ids
            ids = []
            for i, metadata in enumerate(results["metadatas"]):
                if metadata and "filename" in metadata and "chunk_id" in metadata:
                    ids.append(f"{metadata['filename']}_{metadata['chunk_id']}")
            
            if ids:
                self.collection.delete(ids=ids)
    
    def check_vector_exists(self, filename: str) -> bool:
        """
        检查文件向量是否存在
        
        Args:
            filename: 文件名
        
        Returns:
            是否存在
        """
        results = self.collection.get(
            where={"filename": filename},
            include=["metadatas"]
        )
        
        return len(results["metadatas"]) > 0
    
    def get_vector_count(self) -> int:
        """
        获取向量总数
        
        Returns:
            向量总数
        """
        return self.collection.count()
    
    def get_filename_list(self) -> List[str]:
        """
        获取所有向量文件名列表
        
        Returns:
            文件名列表
        """
        results = self.collection.get(
            include=["metadatas"]
        )
        
        # 提取唯一的文件名
        filenames = set()
        for metadata in results["metadatas"]:
            if metadata and "filename" in metadata:
                filenames.add(metadata["filename"])
        
        return list(filenames)
    
    def clear_all_vectors(self) -> None:
        """
        清空所有向量
        """
        # 获取所有文档，不使用ids作为include参数
        results = self.collection.get(
            include=["metadatas"]
        )
        
        # 从metadatas中重建ids
        ids = []
        for i, metadata in enumerate(results["metadatas"]):
            if metadata and "filename" in metadata and "chunk_id" in metadata:
                ids.append(f"{metadata['filename']}_{metadata['chunk_id']}")
        
        if ids:
            self.collection.delete(ids=ids)

# 创建全局服务实例
chromadb_service = ChromaDBService()