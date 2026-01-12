#!/usr/bin/env python3
"""
FastDFS 上传下载测试脚本
验证完整的上传下载流程
"""

import requests
import json
import tempfile

def test_upload_download():
    print("=" * 50)
    print("FastDFS 上传下载完整流程测试")
    print("=" * 50)
    
    # 创建测试文件
    test_content = b"FastDFS Upload-Download Test Content"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".txt")
    temp_file.write(test_content)
    temp_file.close()
    test_file_path = temp_file.name
    
    try:
        # API 配置
        api_url = "http://127.0.0.1:8000/api/v1/fastdfs"
        print(f"\nAPI URL: {api_url}")
        
        # 1. 上传文件
        print(f"\n1. 上传文件: {test_file_path}")
        fastdfs_config = {
            "trackerServer": "127.0.0.1",
            "port": 22122,
            "httpUrl": "http://127.0.0.1:8888",
            "groupName": "group1"
        }
        
        with open(test_file_path, 'rb') as f:
            files = {'file': f}
            data = {'config': json.dumps(fastdfs_config)}
            
            upload_response = requests.post(f"{api_url}/upload", files=files, data=data, timeout=10)
        
        print(f"   响应状态码: {upload_response.status_code}")
        
        if upload_response.status_code != 200:
            print(f"   ✗ 上传失败: {upload_response.text}")
            return False
        
        upload_result = upload_response.json()
        file_id = upload_result['file_id']
        file_url = upload_result['url']
        
        print(f"   ✓ 上传成功!")
        print(f"   文件ID: {file_id}")
        print(f"   访问URL: {file_url}")
        
        # 2. 下载文件（通过HTTP）
        print(f"\n2. 直接HTTP下载文件")
        http_response = requests.get(file_url, timeout=10)
        print(f"   响应状态码: {http_response.status_code}")
        
        if http_response.status_code == 200:
            downloaded_content = http_response.content
            print(f"   ✓ HTTP下载成功!")
            print(f"   下载大小: {len(downloaded_content)} 字节")
            
            if downloaded_content == test_content:
                print(f"   ✓ 内容匹配!")
            else:
                print(f"   ✗ 内容不匹配!")
                print(f"   原内容: {test_content}")
                print(f"   下载内容: {downloaded_content}")
        else:
            print(f"   ✗ HTTP下载失败: {http_response.status_code}")
        
        # 3. 使用API下载（可选）
        print(f"\n3. 通过API下载文件")
        download_response = requests.get(f"{api_url}/download/{file_id}", timeout=10)
        print(f"   响应状态码: {download_response.status_code}")
        
        if download_response.status_code == 200:
            download_result = download_response.json()
            print(f"   ✓ API下载成功!")
            print(f"   文件大小: {download_result.get('file_size')} 字节")
        else:
            print(f"   ✗ API下载失败: {download_response.status_code} - {download_response.text}")
        
        return True
            
    except Exception as e:
        print(f"\n✗ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        import os
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        print("\n" + "=" * 50)
        print("测试完成")
        print("=" * 50)

if __name__ == "__main__":
    test_upload_download()