from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API 配置
    API_VERSION: str = "v1"
    API_PREFIX: str = f"/api/{API_VERSION}"
    
    # 应用配置
    APP_NAME: str = "Note Nexus API"
    DEBUG: bool = True
    
    # CORS 配置
    CORS_ORIGINS: List[str] = ["*"]  # 生产环境应限制为特定域名
    
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./note_nexus.db"  # SQLite 数据库
    # 生产环境可使用 PostgreSQL:
    # DATABASE_URL: str = "postgresql://user:password@localhost/note_nexus"
    
    # WebDAV 配置
    WEBDAV_TIMEOUT: int = 30  # 30秒
    
    # URL 爬取配置
    URL_FETCH_TIMEOUT: int = 10  # 10秒
    URL_FETCH_MAX_CONTENT_LENGTH: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# 创建全局配置实例
settings = Settings()
