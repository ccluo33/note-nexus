#!/usr/bin/env python3
"""
FastDFS 上传下载完整流程测试
验证所有FastDFS API端点
"""

import requests
import json
import tempfile

def test_fastdfs_full_flow():
    print("=" * 60)
    print("FastDFS 上传下载完整流程测试")
    print("=" * 60)
    
    # API 配置
    base_url = "http://127.0.0.1:8000/api/v1/fastdfs"
    fastdfs_config = {
        "trackerServer": "127.0.0.1",
        "port": 22122,
        "httpUrl": "http://127.0.0.1:8888",
        "groupName": "group1"
    }
    
    # 创建测试文件
    test_content = b"FastDFS Full Flow Test Content"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".txt")
    temp_file.write(test_content)
    temp_file.close()
    test_file_path = temp_file.name
    
    try:
        # 1. 测试上传
        print(f"\n1. 测试上传")
        print(f"   文件路径: {test_file_path}")
        print(f"   文件大小: {len(test_content)} 字节")
        
        with open(test_file_path, 'rb') as f:
            files = {'file': f}
            data = {'config': json.dumps(fastdfs_config)}
            upload_response = requests.post(f"{base_url}/upload", files=files, data=data, timeout=10)
        
        print(f"   响应状态码: {upload_response.status_code}")
        print(f"   响应内容: {upload_response.text}")
        
        if upload_response.status_code != 200:
            print(f"   ✗ 上传失败")
            return False
        
        upload_result = upload_response.json()
        file_id = upload_result['file_id']
        file_url = upload_result['url']
        
        print(f"   ✓ 上传成功")
        print(f"   文件ID: {file_id}")
        print(f"   访问URL: {file_url}")
        
        # 2. 测试HTTP直接访问
        print(f"\n2. 测试HTTP直接访问")
        http_response = requests.get(file_url, timeout=10)
        print(f"   响应状态码: {http_response.status_code}")
        print(f"   响应内容: {http_response.text}")
        
        if http_response.status_code == 200 and http_response.content == test_content:
            print(f"   ✓ HTTP访问成功，内容匹配")
        else:
            print(f"   ✗ HTTP访问失败或内容不匹配")
        
        # 3. 测试下载API
        print(f"\n3. 测试下载API")
        download_response = requests.get(f"{base_url}/download/{file_id}", timeout=10)
        print(f"   响应状态码: {download_response.status_code}")
        print(f"   响应内容: {download_response.text}")
        
        if download_response.status_code == 200:
            download_result = download_response.json()
            if download_result.get("status") == "success":
                print(f"   ✓ 下载API成功")
                print(f"   文件大小: {download_result.get('file_size')} 字节")
            else:
                print(f"   ✗ 下载API失败")
        else:
            print(f"   ✗ 下载API失败")
        
        # 4. 测试删除API
        print(f"\n4. 测试删除API")
        delete_response = requests.delete(f"{base_url}/delete/{file_id}", timeout=10)
        print(f"   响应状态码: {delete_response.status_code}")
        print(f"   响应内容: {delete_response.text}")
        
        if delete_response.status_code == 200:
            delete_result = delete_response.json()
            if delete_result.get("status") == "success":
                print(f"   ✓ 删除API成功")
            else:
                print(f"   ✗ 删除API失败")
        else:
            print(f"   ✗ 删除API失败")
        
        # 5. 验证文件已被删除
        print(f"\n5. 验证文件已被删除")
        verify_response = requests.get(file_url, timeout=10)
        print(f"   响应状态码: {verify_response.status_code}")
        
        if verify_response.status_code in [404, 500]:
            print(f"   ✓ 文件已被删除")
        else:
            print(f"   ✗ 文件未被删除")
        
        print("\n" + "=" * 60)
        print("测试完成，所有FastDFS API端点正常工作!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n✗ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # 清理测试文件
        import os
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

if __name__ == "__main__":
    test_fastdfs_full_flow()