import { TooltipButton } from "@/components/tooltip-button"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { insertMark } from "@/db/marks"
import useMarkStore from "@/stores/mark"
import useTagStore from "@/stores/tag"
import { Link } from "lucide-react"
import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import { invoke } from "@/lib/browser-adapter/core"
import { summarizeWebContent } from "@/lib/ai"

// 解析 HTML 内容
async function parseHtmlContent(html: string, url: string): Promise<{
  title: string;
  meta_desc: string;
  main_content: string;
}> {
  return new Promise((resolve) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 1. 获取标题
    let title = doc.title;
    if (!title) {
      const titleTag = doc.querySelector('meta[property="og:title"]');
      if (titleTag) {
        title = titleTag.getAttribute('content') || '';
      }
    }
    if (!title) {
      title = new URL(url).hostname;
    }

    // 2. 获取描述
    let metaDesc = '';
    const descTag = doc.querySelector('meta[name="description"]');
    if (descTag) {
      metaDesc = descTag.getAttribute('content') || '';
    }
    if (!metaDesc) {
      const ogDesc = doc.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        metaDesc = ogDesc.getAttribute('content') || '';
      }
    }

    // 3. 获取正文
    let mainContent = '';
    
    // 尝试查找主要内容容器
    const selectors = ['main', 'article', '#content', '.content', '#main', '.main'];
    let contentElement = null;
    
    for (const selector of selectors) {
      contentElement = doc.querySelector(selector);
      if (contentElement) break;
    }
    
    // 如果没找到特定容器，回退到 body
    if (!contentElement) {
      contentElement = doc.body;
    }
    
    if (contentElement) {
      // 移除脚本和样式标签
      const scripts = contentElement.querySelectorAll('script, style, noscript, iframe, svg');
      scripts.forEach(node => node.remove());
      
      // 获取文本内容
      mainContent = contentElement.textContent || '';
      
      // 清理空白字符
      mainContent = mainContent.replace(/\s+/g, ' ').trim();
      
      // 截断内容
      if (mainContent.length > 10000) {
        mainContent = mainContent.substring(0, 10000);
      }
    }

    resolve({
      title,
      meta_desc: metaDesc,
      main_content: mainContent
    });
  });
}


export function ControlLink() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const { currentTagId, fetchTags, getCurrentTag } = useTagStore()
  const { fetchMarks, addQueue, setQueue, removeQueue } = useMarkStore()

  async function handleSuccess() {
    if (!url) return
    let targetUrl = url
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`
      setUrl(targetUrl)
    }
    
    setLoading(true)
    const queueId = uuidv4()
    
    // 添加到队列中显示加载状态
    addQueue({
      queueId,
      tagId: currentTagId!,
      type: 'link',
      progress: '0%',
      startTime: Date.now()
    })
    
    // 为整个处理流程设置全局超时（60秒）
    const globalTimeout = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('全局处理超时'));
      }, 60000);
      // 返回清理函数
      return () => clearTimeout(timer);
    });
    
    // 处理流程Promise
    const processPromise = (async () => {
      try {
        setQueue(queueId, { progress: '20%' });
        
        // 使用后端 API 获取页面内容
        const pageContent = await invoke<{
          title: string;
          meta_desc: string;
          main_content: string;
          url: string;
        }>('fetch_url_content', { url: targetUrl });
        
        setQueue(queueId, { progress: '40%' });

        const title = pageContent.title;
        const metaDesc = pageContent.meta_desc;
        const mainContent = pageContent.main_content;
        let summary = '';
        
        // 如果获取到了主要内容，调用AI进行总结
        if (mainContent && mainContent.length > 0) {
            setQueue(queueId, { progress: '50%' });
            console.log('开始总结网页内容...');
            try {
                summary = await summarizeWebContent(mainContent, title) || '';
                console.log('网页内容总结完成:', summary);
            } catch (summaryError) {
                console.warn('AI总结失败，继续执行:', summaryError);
                summary = '';
            }
        }
        
        setQueue(queueId, { progress: '80%' });
        
        // 构建描述
        let desc = `${title}\n${metaDesc}`;
        
        // 如果有总结内容，添加到描述中
        if (summary) {
          desc = `${title}\n${summary}`;
        }
        
        setQueue(queueId, { progress: '90%' });
        
        // 保存到数据库
        await insertMark({ 
          tagId: currentTagId, 
          type: 'link', 
          desc: desc, 
          content: mainContent,
          url: targetUrl 
        });
        
        // 刷新数据
        await Promise.all([
          fetchMarks(),
          fetchTags()
        ]);
        getCurrentTag();
        
        setUrl('');
        setOpen(false);
      } catch (error) {
        console.error('Error saving link:', error);
        
        // 最后的保障：即使出现其他错误，也要尝试保存链接
        try {
          const urlObj = new URL(targetUrl);
          const domain = urlObj.hostname;
          const desc = `${domain} - ${targetUrl}`;
          
          await insertMark({ 
            tagId: currentTagId, 
            type: 'link', 
            desc: desc, 
            content: '',
            url: targetUrl 
          });
          
          // 刷新数据
          await Promise.all([
            fetchMarks(),
            fetchTags()
          ]);
          getCurrentTag();
          
          setUrl('');
          setOpen(false);
        } catch (finalError) {
          console.error('Failed to save link even in fallback mode:', finalError);
          throw finalError;
        }
      }
    })();
    
    try {
      // 使用Promise.race确保处理流程不会超过全局超时时间
      await Promise.race([processPromise, globalTimeout]);
    } catch (error) {
      console.error('链接处理失败:', error);
      
      // 超时或其他严重错误时，尝试保存基本链接信息
      try {
        const urlObj = new URL(targetUrl);
        const domain = urlObj.hostname;
        const desc = `${domain} - ${targetUrl}`;
        
        await insertMark({ 
          tagId: currentTagId, 
          type: 'link', 
          desc: desc, 
          content: '',
          url: targetUrl 
        });
        
        // 刷新数据
        await Promise.all([
          fetchMarks(),
          fetchTags()
        ]);
        getCurrentTag();
        
        setUrl('');
        setOpen(false);
      } catch (finalError) {
        console.error('Failed to save link in emergency fallback:', finalError);
      }
    } finally {
      // 确保在所有情况下都能清理资源
      try {
        removeQueue(queueId);
      } catch (cleanupError) {
        console.error('清理队列项失败:', cleanupError);
      }
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton icon={<Link />} tooltipText={t('record.mark.type.link') || '链接'} />
      </DialogTrigger>
      <DialogContent className="min-w-full md:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('record.mark.link.title') || '链接记录'}</DialogTitle>
          <DialogDescription>
            {t('record.mark.link.description') || '输入网页链接，系统将自动爬取页面内容并保存'}
          </DialogDescription>
        </DialogHeader>
        <Input 
          placeholder="https://example.com" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <DialogFooter className="flex items-center justify-between">
          <p className="text-sm text-zinc-500 mr-4">
            {loading ? '正在爬取页面内容...' : ''}
          </p>
          <Button 
            type="submit" 
            onClick={handleSuccess} 
            disabled={!url || loading}
          >
            {loading ? '处理中...' : (t('record.mark.link.save') || '保存')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}