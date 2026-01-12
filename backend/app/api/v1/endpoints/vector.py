from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from pydantic import BaseModel
from app.services.chromadb_service import chromadb_service

router = APIRouter()

# 请求模型
class VectorUploadRequest(BaseModel):
    filename: str
    chunk_id: int
    content: str
    embedding: List[float]

class SimilarQueryRequest(BaseModel):
    query_embedding: List[float]
    limit: int = 5
    similarity_threshold: float = 0.7

@router.post("/upload", summary="上传向量", description="插入或更新文档向量")
async def upload_vector(request: VectorUploadRequest):
    """
    插入或更新文档向量
    
    Args:
        request: 包含文件名、分块ID、内容和向量的请求体
    
    Returns:
        成功消息
    """
    try:
        # 打印请求信息，用于调试
        print(f"接收到向量上传请求: filename={request.filename}, chunk_id={request.chunk_id}, embedding_length={len(request.embedding)}")
        print(f"内容长度: {len(request.content)}")
        print(f"向量前5个值: {request.embedding[:5]}")
        
        chromadb_service.upsert_vector(
            filename=request.filename,
            chunk_id=request.chunk_id,
            content=request.content,
            embedding=request.embedding
        )
        return {
            "status": "success",
            "message": "向量上传成功"
        }
    except Exception as e:
        import traceback
        print(f"向量上传失败详细错误:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"向量上传失败: {str(e)}")

@router.post("/similar", summary="查询相似文档", description="根据查询向量返回相似文档")
async def get_similar_documents(request: SimilarQueryRequest):
    """
    根据查询向量返回相似文档
    
    Args:
        request: 包含查询向量、返回数量和相似度阈值的请求体
    
    Returns:
        相似文档列表
    """
    try:
        similar_docs = chromadb_service.get_similar_documents(
            query_embedding=request.query_embedding,
            limit=request.limit,
            similarity_threshold=request.similarity_threshold
        )
        return {
            "status": "success",
            "data": similar_docs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询相似文档失败: {str(e)}")

@router.delete("/{filename}", summary="删除文件向量", description="根据文件名删除所有相关向量")
async def delete_vectors(filename: str):
    """
    根据文件名删除所有相关向量
    
    Args:
        filename: 文件名
    
    Returns:
        成功消息
    """
    try:
        chromadb_service.delete_vectors_by_filename(filename)
        return {
            "status": "success",
            "message": f"已删除文件 {filename} 的所有向量"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除向量失败: {str(e)}")

@router.get("/status", summary="获取向量存储状态", description="获取向量存储的统计信息")
async def get_vector_status():
    """
    获取向量存储的统计信息
    
    Returns:
        向量存储状态信息
    """
    try:
        count = chromadb_service.get_vector_count()
        filenames = chromadb_service.get_filename_list()
        return {
            "status": "success",
            "data": {
                "vector_count": count,
                "file_count": len(filenames),
                "files": filenames
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取向量状态失败: {str(e)}")

@router.get("/exists/{filename}", summary="检查文件向量是否存在", description="检查指定文件的向量是否存在")
async def check_vector_exists(filename: str):
    """
    检查指定文件的向量是否存在
    
    Args:
        filename: 文件名
    
    Returns:
        是否存在
    """
    try:
        exists = chromadb_service.check_vector_exists(filename)
        return {
            "status": "success",
            "data": {
                "exists": exists
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"检查向量存在性失败: {str(e)}")

@router.delete("/clear", summary="清空所有向量", description="清空向量存储中的所有向量")
async def clear_all_vectors():
    """
    清空向量存储中的所有向量
    
    Returns:
        成功消息
    """
    try:
        chromadb_service.clear_all_vectors()
        return {
            "status": "success",
            "message": "已清空所有向量"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"清空向量失败: {str(e)}")
