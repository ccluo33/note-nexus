#!/usr/bin/env python3
"""
FastDFS API 测试脚本
直接调用后端API测试上传功能
"""

import requests
import json
import tempfile

def test_upload():
    print("=" * 50)
    print("FastDFS API 测试")
    print("=" * 50)
    
    # 创建测试文件
    test_content = b"FastDFS API Test - Hello from HTTP!"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".txt")
    temp_file.write(test_content)
    temp_file.close()
    test_file_path = temp_file.name
    
    try:
        # API 配置
        api_url = "http://127.0.0.1:8000/api/v1/fastdfs/upload"
        print(f"\nAPI URL: {api_url}")
        
        # 准备请求数据
        fastdfs_config = {
            "trackerServer": "127.0.0.1",
            "port": 22122,
            "httpUrl": "http://127.0.0.1:8888",
            "groupName": "group1"
        }
        
        # 发送请求
        print(f"\n发送上传请求...")
        with open(test_file_path, 'rb') as f:
            files = {'file': f}
            data = {'config': json.dumps(fastdfs_config)}
            
            response = requests.post(api_url, files=files, data=data, timeout=10)
        
        print(f"\n响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                print(f"\n✓ 上传成功!")
                print(f"   文件ID: {result['file_id']}")
                print(f"   访问URL: {result['url']}")
                return result
            else:
                print(f"\n✗ 上传失败: {result}")
                return None
        else:
            print(f"\n✗ 请求失败")
            return None
            
    except Exception as e:
        print(f"\n✗ 错误: {e}")
        import traceback
        traceback.print_exc()
        return None
    
    finally:
        import os
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        print("\n" + "=" * 50)
        print("测试完成")
        print("=" * 50)

if __name__ == "__main__":
    test_upload()