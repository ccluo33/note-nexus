from fastapi import APIRouter
from app.api.v1.endpoints import webdav, mcp, device, fetch_url

# 创建 API 路由器
router = APIRouter()

# 注册 WebDAV 相关路由
router.include_router(webdav.router, prefix="/webdav", tags=["WebDAV"])

# 注册 MCP 相关路由
router.include_router(mcp.router, prefix="/mcp", tags=["MCP"])

# 注册设备相关路由
router.include_router(device.router, prefix="/device", tags=["Device"])

# 注册 URL 内容获取路由
router.include_router(fetch_url.router, prefix="/fetch", tags=["Fetch URL"])
