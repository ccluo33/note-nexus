from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
import os
import uuid
import json
import traceback
import subprocess

router = APIRouter()

@router.post("/upload", summary="上传文件到FastDFS", description="使用docker命令在storage容器内执行fdfs_upload_file")
async def upload_file_to_fastdfs(file: UploadFile = File(...), config: str = Form(None)):
    """上传文件到FastDFS
    
    Args:
        file: 要上传的文件
        config: JSON格式的FastDFS配置
    
    Returns:
        JSONResponse: 包含文件ID和完整访问URL的响应
    
    Raises:
        HTTPException: 当上传失败时
    """
    # 解析配置
    if not config:
        return JSONResponse(content={
            "status": "error",
            "message": "缺少FastDFS配置",
            "detail": "请提供完整的FastDFS配置"
        }, status_code=400)
    
    try:
        fastdfs_config = json.loads(config)
    except json.JSONDecodeError as e:
        return JSONResponse(content={
            "status": "error",
            "message": "FastDFS配置格式错误",
            "detail": f"配置必须是有效的JSON格式: {str(e)}"
        }, status_code=400)
    
    # 验证配置完整性
    required_fields = ['httpUrl']
    for field in required_fields:
        if field not in fastdfs_config or not fastdfs_config[field]:
            return JSONResponse(content={
                "status": "error",
                "message": "FastDFS配置不完整",
                "detail": f"缺少必填字段: {field}"
            }, status_code=400)
    
    try:
        # 读取文件内容
        contents = await file.read()
        
        # 保存为临时文件
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp")
        os.makedirs(temp_dir, exist_ok=True)
        temp_file_name = f"{uuid.uuid4()}_{file.filename}"
        temp_file_path = os.path.join(temp_dir, temp_file_name)
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(contents)
        
        try:
            print(f"开始上传文件到FastDFS: {temp_file_path}")
            
            # 将文件复制到storage容器
            container_path = f"/tmp/{temp_file_name}"
            print(f"将文件复制到storage容器: {temp_file_path} -> fastdfs_storage_container:{container_path}")
            
            # 复制文件到容器
            copy_result = subprocess.run(
                ["docker", "cp", temp_file_path, f"fastdfs_storage_container:{container_path}"],
                capture_output=True,
                text=True,
                check=True
            )
            print(f"文件复制结果: {copy_result.returncode} - {copy_result.stdout}")
            
            # 调用容器内的fdfs_upload_file命令，直接使用容器内的client.conf
            print("调用storage容器内的fdfs_upload_file命令")
            result = subprocess.run(
                ["docker", "exec", "fastdfs_storage_container", "fdfs_upload_file", "/etc/fdfs/client.conf", container_path],
                capture_output=True,
                text=True,
                check=True,
                timeout=10
            )
            
            file_id = result.stdout.strip()
            print(f"上传成功，文件ID: {file_id}")
            
            # 删除容器内的临时文件
            subprocess.run(
                ["docker", "exec", "fastdfs_storage_container", "rm", container_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            # 构建完整的访问URL
            http_url = fastdfs_config['httpUrl'].rstrip('/')
            file_url = f"{http_url}/{file_id}"
            
            return JSONResponse(content={
                "status": "success",
                "file_id": file_id,
                "url": file_url,
                "message": "文件上传成功"
            })
        finally:
            # 删除本地临时文件
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    except subprocess.TimeoutExpired as e:
        error_msg = f"FastDFS上传超时: 命令执行超过{str(e.timeout)}秒"
        print(error_msg)
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": f"命令执行超时: {e.cmd}",
            "command": ' '.join(e.cmd),
            "timeout": e.timeout
        }, status_code=500)
    except subprocess.CalledProcessError as e:
        error_msg = f"FastDFS上传错误: 命令执行失败"
        print(error_msg)
        print(f"命令: {' '.join(e.cmd)}")
        print(f"退出码: {e.returncode}")
        print(f"标准输出: {e.stdout}")
        print(f"标准错误: {e.stderr}")
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": f"命令执行失败: {e.stderr or e.stdout}",
            "command": ' '.join(e.cmd),
            "exit_code": e.returncode
        }, status_code=500)
    except Exception as e:
        error_msg = f"FastDFS上传错误: {e}"
        print(error_msg)
        print(f"详细错误信息: {traceback.format_exc()}")
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": str(e),
            "traceback": traceback.format_exc().splitlines()
        }, status_code=500)

@router.delete("/delete/{file_id:path}", summary="从FastDFS删除文件", description="使用docker命令在storage容器内执行fdfs_delete_file")
async def delete_file_from_fastdfs(file_id: str):
    """从FastDFS删除文件
    
    Args:
        file_id: 要删除的文件ID（包含路径的完整ID）
    
    Returns:
        JSONResponse: 包含删除结果的响应
    
    Raises:
        HTTPException: 当删除失败时
    """
    try:
        print(f"开始删除FastDFS文件: {file_id}")
        
        # 调用容器内的fdfs_delete_file命令
        result = subprocess.run(
            ["docker", "exec", "fastdfs_storage_container", "fdfs_delete_file", "/etc/fdfs/client.conf", file_id],
            capture_output=True,
            text=True,
            check=True,
            timeout=10
        )
        
        print(f"使用docker exec调用fdfs_delete_file成功，删除文件: {file_id}")
        
        return JSONResponse(content={
            "status": "success",
            "message": "文件删除成功"
        })
    except subprocess.TimeoutExpired as e:
        error_msg = f"FastDFS删除超时: 命令执行超过{str(e.timeout)}秒"
        print(error_msg)
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": f"命令执行超时: {e.cmd}",
            "command": ' '.join(e.cmd),
            "timeout": e.timeout
        }, status_code=500)
    except subprocess.CalledProcessError as e:
        error_msg = f"FastDFS删除错误: 命令执行失败"
        print(error_msg)
        print(f"命令: {' '.join(e.cmd)}")
        print(f"退出码: {e.returncode}")
        print(f"标准输出: {e.stdout}")
        print(f"标准错误: {e.stderr}")
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": f"命令执行失败: {e.stderr or e.stdout}",
            "command": ' '.join(e.cmd),
            "exit_code": e.returncode
        }, status_code=500)
    except Exception as e:
        error_msg = f"FastDFS删除错误: {e}"
        print(error_msg)
        print(f"详细错误信息: {traceback.format_exc()}")
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": str(e),
            "traceback": traceback.format_exc().splitlines()
        }, status_code=500)

@router.get("/download/{file_id:path}", summary="从FastDFS下载文件", description="使用docker命令在storage容器内执行fdfs_download_file")
async def download_file_from_fastdfs(file_id: str):
    """从FastDFS下载文件
    
    Args:
        file_id: 要下载的文件ID（包含路径的完整ID）
    
    Returns:
        JSONResponse: 包含下载结果的响应
    
    Raises:
        HTTPException: 当下载失败时
    """
    try:
        print(f"开始下载FastDFS文件: {file_id}")
        
        # 生成临时文件名
        temp_file_name = f"download_{uuid.uuid4()}"
        container_path = f"/tmp/{temp_file_name}"
        local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp", temp_file_name)
        
        # 调用容器内的fdfs_download_file命令
        result = subprocess.run(
            ["docker", "exec", "fastdfs_storage_container", "fdfs_download_file", "/etc/fdfs/client.conf", file_id, container_path],
            capture_output=True,
            text=True,
            check=True,
            timeout=10
        )
        
        print(f"下载成功，文件已保存到容器: {container_path}")
        
        # 复制文件到本地
        copy_result = subprocess.run(
            ["docker", "cp", f"fastdfs_storage_container:{container_path}", local_path],
            capture_output=True,
            text=True,
            check=True,
            timeout=10
        )
        print(f"将文件复制到本地: {local_path}")
        
        # 删除容器内的临时文件
        subprocess.run(
            ["docker", "exec", "fastdfs_storage_container", "rm", container_path],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        # 读取文件大小
        file_size = os.path.getsize(local_path)
        
        # 删除本地临时文件
        os.remove(local_path)
        
        return JSONResponse(content={
            "status": "success",
            "message": "文件下载成功",
            "file_size": file_size
        })
    except subprocess.TimeoutExpired as e:
        error_msg = f"FastDFS下载超时: 命令执行超过{str(e.timeout)}秒"
        print(error_msg)
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": f"命令执行超时: {e.cmd}",
            "command": ' '.join(e.cmd),
            "timeout": e.timeout
        }, status_code=500)
    except subprocess.CalledProcessError as e:
        error_msg = f"FastDFS下载错误: 命令执行失败"
        print(error_msg)
        print(f"命令: {' '.join(e.cmd)}")
        print(f"退出码: {e.returncode}")
        print(f"标准输出: {e.stdout}")
        print(f"标准错误: {e.stderr}")
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": f"命令执行失败: {e.stderr or e.stdout}",
            "command": ' '.join(e.cmd),
            "exit_code": e.returncode
        }, status_code=500)
    except Exception as e:
        error_msg = f"FastDFS下载错误: {e}"
        print(error_msg)
        print(f"详细错误信息: {traceback.format_exc()}")
        return JSONResponse(content={
            "status": "error",
            "message": error_msg,
            "detail": str(e),
            "traceback": traceback.format_exc().splitlines()
        }, status_code=500)