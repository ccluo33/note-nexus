#!/usr/bin/env python3
"""
FastDFS 上传测试脚本
使用 172.20.10.11:22122 连接 FastDFS
"""

import os
import tempfile
from fdfs_client.client import Fdfs_client

def create_config(tracker_server: str, port: int, group_name: str = "group1"):
    """创建FastDFS客户端配置"""
    config_content = f"""connect_timeout=30
network_timeout=60
charset=UTF-8
tracker_server={tracker_server}:{port}
storage_server_port=23000
group_name={group_name}
base_path=./tmp
max_file_size=1048576000
connection_pool_max_idle_time=3600
log_level=info
http.anti_steal_token=no
http.secret_key=FastDFS1234567890
http.check_content_type=yes
"""
    
    config_path = "test_fdfs_client.conf"
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(config_content)
    
    return config_path

def test_upload():
    print("=" * 50)
    print("FastDFS 上传测试")
    print("=" * 50)
    
    # 创建测试文件
    test_content = b"FastDFS Test Content - " + b"Hello from FastDFS!"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".txt")
    temp_file.write(test_content)
    temp_file.close()
    test_file_path = temp_file.name
    
    try:
        print(f"\n1. 测试文件: {test_file_path}")
        print(f"   文件大小: {len(test_content)} 字节")
        
        # 创建配置
        config_path = create_config("127.0.0.1", 22122)
        print(f"\n2. 配置文件: {config_path}")
        
        # 初始化客户端
        print(f"\n3. 初始化 FastDFS 客户端...")
        client = Fdfs_client(config_path)
        print("   ✓ 客户端初始化成功")
        
        # 上传文件
        print(f"\n4. 上传文件到 FastDFS...")
        result = client.upload_by_filename(test_file_path)
        print(f"   上传结果: {result}")
        
        if result.get("Status") == "Upload successed.":
            file_id = result["Remote file_id"]
            if isinstance(file_id, bytes):
                file_id = file_id.decode('utf-8')
            
            print(f"\n✓ 上传成功!")
            print(f"   文件ID: {file_id}")
            
            http_url = "http://172.20.10.11:8888"
            file_url = f"{http_url}/{file_id}"
            print(f"   访问URL: {file_url}")
            
            # 测试下载
            print(f"\n5. 测试下载文件...")
            try:
                download_result = client.download_to_file("/tmp/downloaded_test.txt", file_id)
                print(f"   下载结果: {download_result}")
                if download_result.get("Status") == "Download successed.":
                    print("   ✓ 下载成功!")
                    
                    # 验证内容
                    with open("/tmp/downloaded_test.txt", "rb") as f:
                        downloaded_content = f.read()
                    if downloaded_content == test_content:
                        print("   ✓ 内容验证通过!")
                    else:
                        print(f"   ✗ 内容不匹配: {downloaded_content}")
            except Exception as e:
                print(f"   下载失败: {e}")
            
            return file_id
        else:
            print(f"\n✗ 上传失败: {result}")
            return None
            
    except Exception as e:
        print(f"\n✗ 错误: {e}")
        import traceback
        traceback.print_exc()
        return None
    
    finally:
        # 清理
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        if os.path.exists(config_path):
            os.remove(config_path)
        print("\n" + "=" * 50)
        print("测试完成")
        print("=" * 50)

if __name__ == "__main__":
    test_upload()
