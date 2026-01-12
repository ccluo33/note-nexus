from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

router = APIRouter()

class FetchUrlRequest(BaseModel):
    url: str
    timeout: int = 10

class FetchUrlResponse(BaseModel):
    title: str
    meta_desc: str
    main_content: str
    url: str

@router.post("/url-content", summary="获取 URL 内容", description="获取指定 URL 的页面内容，包括标题、描述和主要内容")
async def fetch_url_content(request: FetchUrlRequest) -> FetchUrlResponse:
    """获取 URL 内容
    
    获取指定 URL 的页面内容，包括标题、描述和主要内容。
    
    Args:
        request: 请求体，包含 URL 和超时时间
    
    Returns:
        FetchUrlResponse: 包含标题、描述、主要内容和 URL 的响应
    
    Raises:
        HTTPException: 当请求失败或 URL 无效时
    """
    try:
        # 发送 HTTP 请求获取页面内容
        response = requests.get(
            request.url,
            timeout=request.timeout,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            allow_redirects=True
        )
        response.raise_for_status()
        
        # 解析 HTML 内容
        soup = BeautifulSoup(response.text, "lxml")
        
        # 获取标题
        title = soup.title.string.strip() if soup.title and soup.title.string else urlparse(request.url).hostname
        
        # 获取元描述
        meta_desc = ""
        meta_tag = soup.find("meta", attrs={"name": "description"})
        if meta_tag and meta_tag.get("content"):
            meta_desc = meta_tag.get("content").strip()
        else:
            # 尝试获取 og:description
            meta_tag = soup.find("meta", attrs={"property": "og:description"})
            if meta_tag and meta_tag.get("content"):
                meta_desc = meta_tag.get("content").strip()
        
        # 获取主要内容
        # 尝试不同的选择器来获取主要内容
        content_selectors = [
            "main",
            "article",
            ".main-content",
            ".content",
            "#content",
            ".post-content",
            ".entry-content"
        ]
        
        main_content = ""
        for selector in content_selectors:
            content_element = soup.select_one(selector)
            if content_element:
                # 移除脚本和样式标签
                for script in content_element.find_all("script"):
                    script.decompose()
                for style in content_element.find_all("style"):
                    style.decompose()
                # 获取文本内容
                main_content = content_element.get_text(separator="\n", strip=True)
                break
        
        # 如果没有找到主要内容，使用 body 内容
        if not main_content:
            body = soup.body
            if body:
                for script in body.find_all("script"):
                    script.decompose()
                for style in body.find_all("style"):
                    style.decompose()
                main_content = body.get_text(separator="\n", strip=True)
        
        # 截断长内容
        if len(main_content) > 10000:
            main_content = main_content[:10000] + "..."
        
        return FetchUrlResponse(
            title=title,
            meta_desc=meta_desc,
            main_content=main_content,
            url=request.url
        )
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing URL content: {str(e)}")
