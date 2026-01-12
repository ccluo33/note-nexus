import requests
import json

# API基础URL
BASE_URL = "http://127.0.0.1:8000/api/v1/vector"

# 测试数据
TEST_FILENAME = "test_document.md"
TEST_CONTENT = "这是一个测试文档，用于验证ChromaDB向量存储功能。"
TEST_EMBEDDING = [0.1, 0.2, 0.3, 0.4, 0.5]  # 简化的测试向量

print("=== 测试ChromaDB向量存储API ===")

# 1. 测试向量上传
print("\n1. 测试向量上传...")
upload_url = f"{BASE_URL}/upload"
upload_data = {
    "filename": TEST_FILENAME,
    "chunk_id": 0,
    "content": TEST_CONTENT,
    "embedding": TEST_EMBEDDING
}

response = requests.post(upload_url, json=upload_data)
if response.status_code == 200:
    result = response.json()
    if result.get("status") == "success":
        print("✓ 向量上传成功")
    else:
        print(f"✗ 向量上传失败: {result}")
else:
    print(f"✗ 向量上传请求失败: {response.status_code} - {response.text}")

# 2. 测试相似文档查询
print("\n2. 测试相似文档查询...")
similar_url = f"{BASE_URL}/similar"
similar_data = {
    "query_embedding": TEST_EMBEDDING,
    "limit": 5,
    "similarity_threshold": 0.1  # 降低阈值以确保能找到测试文档
}

response = requests.post(similar_url, json=similar_data)
if response.status_code == 200:
    result = response.json()
    if result.get("status") == "success":
        docs = result.get("data", [])
        print(f"✓ 相似文档查询成功，找到 {len(docs)} 个结果")
        if docs:
            print(f"  第一个结果: {docs[0]['filename']} (相似度: {docs[0]['similarity']:.4f})")
    else:
        print(f"✗ 相似文档查询失败: {result}")
else:
    print(f"✗ 相似文档查询请求失败: {response.status_code} - {response.text}")

# 3. 测试检查向量是否存在
print("\n3. 测试检查向量是否存在...")
exists_url = f"{BASE_URL}/exists/{TEST_FILENAME}"

response = requests.get(exists_url)
if response.status_code == 200:
    result = response.json()
    if result.get("status") == "success":
        exists = result.get("data", {}).get("exists", False)
        if exists:
            print("✓ 向量存在")
        else:
            print("✗ 向量不存在")
    else:
        print(f"✗ 检查向量存在性失败: {result}")
else:
    print(f"✗ 检查向量存在性请求失败: {response.status_code} - {response.text}")

# 4. 测试获取向量存储状态
print("\n4. 测试获取向量存储状态...")
status_url = f"{BASE_URL}/status"

response = requests.get(status_url)
if response.status_code == 200:
    result = response.json()
    if result.get("status") == "success":
        data = result.get("data", {})
        print(f"✓ 向量存储状态获取成功")
        print(f"  向量总数: {data.get('vector_count', 0)}")
        print(f"  文件总数: {data.get('file_count', 0)}")
    else:
        print(f"✗ 获取向量存储状态失败: {result}")
else:
    print(f"✗ 获取向量存储状态请求失败: {response.status_code} - {response.text}")

# 5. 测试删除向量
print("\n5. 测试删除向量...")
delete_url = f"{BASE_URL}/{TEST_FILENAME}"

response = requests.delete(delete_url)
if response.status_code == 200:
    result = response.json()
    if result.get("status") == "success":
        print("✓ 向量删除成功")
    else:
        print(f"✗ 向量删除失败: {result}")
else:
    print(f"✗ 向量删除请求失败: {response.status_code} - {response.text}")

# 6. 验证删除结果
print("\n6. 验证删除结果...")
response = requests.get(exists_url)
if response.status_code == 200:
    result = response.json()
    if result.get("status") == "success":
        exists = result.get("data", {}).get("exists", False)
        if not exists:
            print("✓ 向量已成功删除")
        else:
            print("✗ 向量删除失败，文件仍存在")
    else:
        print(f"✗ 验证删除结果失败: {result}")
else:
    print(f"✗ 验证删除结果请求失败: {response.status_code} - {response.text}")

print("\n=== 测试完成 ===")
