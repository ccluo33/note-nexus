#!/usr/bin/env python3
# FastDFS上传下载接口单元测试

import os
import unittest
import tempfile
from fdfs_client.client import Fdfs_client
import json
import requests

class TestFastDFS(unittest.TestCase):
    """FastDFS上传下载接口单元测试"""
    
    @classmethod
    def setUpClass(cls):
        """设置测试环境"""
        print("\n=== 设置测试环境 ===")
        cls.base_url = "http://172.20.10.11:8000/api/v1/fastdfs"
        cls.fdfs_config = {
            "trackerServer": "172.20.10.11",
            "port": 22122,
            "httpUrl": "http://172.20.10.11:8888",
            "groupName": "group1",
            "storagePath": "M00"
        }
        
        # 创建测试文件
        cls.test_content = b"FastDFS Test File Content"
        cls.test_file = tempfile.NamedTemporaryFile(delete=False, suffix=".txt")
        cls.test_file.write(cls.test_content)
        cls.test_file.close()
        cls.test_file_path = cls.test_file.name
        cls.test_file_name = os.path.basename(cls.test_file_path)
        
        print(f"测试文件: {cls.test_file_path}")
        print(f"测试文件内容: {cls.test_content.decode()}")
        print("测试环境设置完成\n")
    
    @classmethod
    def tearDownClass(cls):
        """清理测试环境"""
        print("\n=== 清理测试环境 ===")
        # 删除测试文件
        if os.path.exists(cls.test_file_path):
            os.remove(cls.test_file_path)
            print(f"删除测试文件: {cls.test_file_path}")
        print("测试环境清理完成\n")
    
    def test_1_fdfs_client_init(self):
        """测试Fdfs_client初始化"""
        print("=== 测试1: Fdfs_client初始化 ===")
        try:
            client = Fdfs_client('client.conf')
            self.assertIsNotNone(client)
            print("✓ Fdfs_client初始化成功")
        except Exception as e:
            self.fail(f"Fdfs_client初始化失败: {e}")
    
    def test_2_direct_upload(self):
        """测试直接使用Fdfs_client上传文件"""
        print("\n=== 测试2: 直接使用Fdfs_client上传文件 ===")
        try:
            client = Fdfs_client('client.conf')
            result = client.upload_by_filename(self.test_file_path)
            
            self.assertEqual(result["Status"], "Upload successed.")
            self.assertIsNotNone(result.get("Remote file_id"))
            
            file_id = result["Remote file_id"].decode() if isinstance(result["Remote file_id"], bytes) else result["Remote file_id"]
            print(f"✓ 直接上传成功，文件ID: {file_id}")
            
            # 保存文件ID用于后续测试
            self.direct_file_id = file_id
        except Exception as e:
            self.fail(f"直接上传失败: {e}")
    
    def test_3_api_upload(self):
        """测试通过API上传文件"""
        print("\n=== 测试3: 通过API上传文件 ===")
        try:
            # 准备请求数据
            files = {'file': open(self.test_file_path, 'rb')}
            data = {'config': json.dumps(self.fdfs_config)}
            
            # 发送请求
            response = requests.post(f"{self.base_url}/upload", files=files, data=data)
            result = response.json()
            
            self.assertEqual(response.status_code, 200)
            self.assertEqual(result["status"], "success")
            self.assertIsNotNone(result.get("file_id"))
            self.assertIsNotNone(result.get("url"))
            
            print(f"✓ API上传成功，文件ID: {result['file_id']}")
            print(f"✓ 访问URL: {result['url']}")
            
            # 保存文件ID用于后续测试
            self.api_file_id = result["file_id"]
            self.api_file_url = result["url"]
        except Exception as e:
            self.fail(f"API上传失败: {e}")
    
    def test_4_api_upload_download(self):
        """测试API上传下载完整流程"""
        print("\n=== 测试4: API上传下载完整流程 ===")
        try:
            # 1. 上传文件
            files = {'file': open(self.test_file_path, 'rb')}
            data = {'config': json.dumps(self.fdfs_config)}
            upload_response = requests.post(f"{self.base_url}/upload", files=files, data=data)
            upload_result = upload_response.json()
            
            self.assertEqual(upload_response.status_code, 200)
            self.assertEqual(upload_result["status"], "success")
            file_id = upload_result["file_id"]
            file_url = upload_result["url"]
            
            print(f"✓ 上传成功，文件ID: {file_id}")
            print(f"✓ 访问URL: {file_url}")
            
            # 2. 下载文件（通过HTTP）
            download_response = requests.get(file_url)
            downloaded_content = download_response.content
            
            self.assertEqual(download_response.status_code, 200)
            self.assertEqual(downloaded_content, self.test_content)
            
            print(f"✓ 下载成功，文件大小: {len(downloaded_content)}字节")
            print(f"✓ 内容匹配: {downloaded_content.decode()}")
            
        except Exception as e:
            self.fail(f"API上传下载流程失败: {e}")
    
    def test_5_direct_delete(self):
        """测试直接使用Fdfs_client删除文件"""
        print("\n=== 测试5: 直接使用Fdfs_client删除文件 ===")
        if hasattr(self, 'direct_file_id'):
            try:
                client = Fdfs_client('client.conf')
                result = client.delete_file(self.direct_file_id)
                
                self.assertEqual(result["Status"], "Delete file successed.")
                print(f"✓ 直接删除成功，文件ID: {self.direct_file_id}")
            except Exception as e:
                self.fail(f"直接删除失败: {e}")
        else:
            print("⚠ 跳过删除测试，因为没有可用的文件ID")
    
    def test_6_api_delete(self):
        """测试通过API删除文件"""
        print("\n=== 测试6: 通过API删除文件 ===")
        if hasattr(self, 'api_file_id'):
            try:
                # 发送删除请求
                response = requests.delete(f"{self.base_url}/delete/{self.api_file_id}")
                result = response.json()
                
                self.assertEqual(response.status_code, 200)
                self.assertEqual(result["status"], "success")
                print(f"✓ API删除成功，文件ID: {self.api_file_id}")
            except Exception as e:
                self.fail(f"API删除失败: {e}")
        else:
            print("⚠ 跳过删除测试，因为没有可用的文件ID")

if __name__ == "__main__":
    print("开始FastDFS上传下载接口单元测试...")
    unittest.main(verbosity=2)
    print("FastDFS上传下载接口单元测试完成！")