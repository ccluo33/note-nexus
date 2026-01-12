from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fdfs_client.client import Fdfs_client
import os
import uuid

router = APIRouter()

# 初始化FastDFS客户端
# 使用项目中的client.conf配置文件
try:
    client = Fdfs_client('client.conf')
except Exception as e:
    print(f"FastDFS客户端初始化失败: {e}")
    client = None

@router.post("/upload", summary="上传文件到FastDFS", description="使用FastDFS客户端库上传文件到FastDFS服务器")
async def upload_file_to_fastdfs(file: UploadFile = File(...), http_url: str = None):
    """上传文件到FastDFS
    
    Args:
        file: 要上传的文件
        http_url: 图床设置中的HTTP访问地址
    
    Returns:
        JSONResponse: 包含文件ID和完整访问URL的响应
    
    Raises:
        HTTPException: 当上传失败时
    """
    if not client:
        raise HTTPException(status_code=500, detail="FastDFS客户端未初始化")
    
    try:
        # 读取文件内容
        contents = await file.read()
        
        # 保存为临时文件
        temp_file_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(contents)
        
        try:
            # 上传到FastDFS
            result = client.upload_by_filename(temp_file_path)
            
            # 检查上传结果
            if result["Status"] != "Upload successed." or not result.get("Remote file_id"):
                raise Exception(f"FastDFS上传失败: {result}")
            
            # 获取文件ID
            file_id = result["Remote file_id"].decode() if isinstance(result["Remote file_id"], bytes) else result["Remote file_id"]
            
            # 构建完整的访问URL
            file_url = file_id
            if http_url:
                # 确保http_url末尾没有斜杠
                http_url = http_url.rstrip('/')
                # 组合成完整URL
                file_url = f"{http_url}/{file_id}"
            
            # 返回结果
            return JSONResponse(content={
                "status": "success",
                "file_id": file_id,
                "url": file_url,
                "message": "文件上传成功"
            })
        finally:
            # 删除临时文件
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    except Exception as e:
        print(f"FastDFS上传错误: {e}")
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

@router.delete("/delete/{file_id}", summary="从FastDFS删除文件", description="使用FastDFS客户端库从FastDFS服务器删除文件")
async def delete_file_from_fastdfs(file_id: str):
    """从FastDFS删除文件
    
    Args:
        file_id: 要删除的文件ID
    
    Returns:
        JSONResponse: 包含删除结果的响应
    
    Raises:
        HTTPException: 当删除失败时
    """
    if not client:
        raise HTTPException(status_code=500, detail="FastDFS客户端未初始化")
    
    try:
        # 从FastDFS删除文件
        result = client.delete_file(file_id)
        
        # 检查删除结果
        if result["Status"] != "Delete file successed." and "successed" not in result["Status"]:
            raise Exception(f"FastDFS删除失败: {result}")
        
        return JSONResponse(content={
            "status": "success",
            "message": "文件删除成功"
        })
    except Exception as e:
        print(f"FastDFS删除错误: {e}")
        raise HTTPException(status_code=500, detail=f"文件删除失败: {str(e)}")
