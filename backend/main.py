from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import endpoints
from app.core.config import settings

# 创建 FastAPI 应用实例
app = FastAPI(
    title="Note Nexus API",
    description="Note Nexus 后端 API 服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 API 路由
app.include_router(endpoints.router, prefix=f"/api/{settings.API_VERSION}")

# 健康检查路由
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Note Nexus API",
        "version": "1.0.0"
    }

# 根路径路由
@app.get("/")
def root():
    return {
        "message": "Welcome to Note Nexus API",
        "docs": "/docs",
        "redoc": "/redoc"
    }
