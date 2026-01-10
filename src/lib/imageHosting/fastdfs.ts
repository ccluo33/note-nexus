import { Store } from "@/lib/browser-adapter/store";
import { toast } from '@/hooks/use-toast';
import { v4 as uuid } from 'uuid';

interface FastDFSConfig {
  trackerServer: string;
  port: number;
  httpUrl: string;
  groupName?: string;
  storagePath?: string;
}

// 测试 FastDFS 连接
export async function testFastDFSConnection(config: FastDFSConfig): Promise<boolean> {
  try {
    // FastDFS 通常不提供直接的 REST API 进行连接测试
    // 这里我们尝试访问 HTTP 地址来验证基本连接
    const url = `${config.httpUrl}`;
    
    const response = await fetch(url, {
      method: 'HEAD'
    });

    // 如果能成功访问 HTTP 地址，就认为连接成功
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    console.error('FastDFS connection test failed:', error);
    return false;
  }
}

// 上传图片到 FastDFS
export async function uploadImageByFastDFS(file: File): Promise<string | undefined> {
  try {
    const store = await Store.load('store.json');
    const config = await store.get<FastDFSConfig>('fastDFSConfig');
    
    if (!config) {
      toast({
        title: 'FastDFS 配置错误',
        description: '请先配置 FastDFS 参数',
        variant: 'destructive',
      });
      return undefined;
    }
    
    // 生成文件名
    const id = uuid();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${id}.${ext}`.replace(/\s/g, '_');
    const groupName = config.groupName || 'group1';

    // 注意：这里假设 FastDFS 服务器配置了 Nginx 模块，支持通过 HTTP 上传
    // 实际的 FastDFS 上传 API 可能需要特定的客户端库
    // 这里使用简化的 HTTP 上传方式
    const uploadUrl = `${config.httpUrl}/upload`;
    
    // 准备表单数据
    const formData = new FormData();
    formData.append('file', file, filename);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    if (response.status === 200) {
      // 解析 FastDFS 上传返回的格式，通常为 group1/M00/00/00/xxxxxx.jpg
      const result = await response.text();
      
      // 检查返回格式是否符合 FastDFS 标准
      if (result.startsWith(`${groupName}/`)) {
        // 构建完整的访问 URL
        return `${config.httpUrl}/${result}`;
      } else {
        // 尝试解析 JSON 格式的返回结果（有些 FastDFS HTTP 服务器可能返回 JSON）
        try {
          const jsonResult = JSON.parse(result);
          if (jsonResult.url) {
            return jsonResult.url;
          } else if (jsonResult.filename) {
            return `${config.httpUrl}/${jsonResult.filename}`;
          }
        } catch {
          // 如果不是 JSON 格式，直接返回结果
          return `${config.httpUrl}/${result}`;
        }
      }
    }
    
    throw new Error(`Upload failed: ${response.status} ${await response.text()}`);
    
  } catch (error) {
    toast({
      title: '上传失败',
      description: (error as Error).message,
      variant: 'destructive',
    });
    return undefined;
  }
}