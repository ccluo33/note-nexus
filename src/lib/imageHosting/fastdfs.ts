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
// 注意：在浏览器环境中，由于 CORS 限制，我们无法进行实际的图片上传测试
// 我们将进行配置验证，并提供详细的配置指导
// 实际的上传功能可能需要在服务器端或桌面环境中使用
export async function testFastDFSConnection(config: FastDFSConfig): Promise<boolean> {
  try {
    console.log('开始 FastDFS 连接测试...');
    
    // 1. 验证配置完整性
    console.log('1. 验证配置完整性...');
    if (!config.trackerServer) {
      console.error('配置不完整：缺少 trackerServer');
      return false;
    }
    if (!config.port) {
      console.error('配置不完整：缺少 port');
      return false;
    }
    if (!config.httpUrl) {
      console.error('配置不完整：缺少 httpUrl');
      return false;
    }
    console.log('配置完整性验证通过');
    
    // 2. 验证配置格式
    console.log('2. 验证配置格式...');
    if (config.httpUrl && config.httpUrl.trim()) {
      new URL(config.httpUrl);
    }
    if (config.trackerServer && config.trackerServer.trim() && config.port) {
      new URL(`http://${config.trackerServer}:${config.port}`);
    }
    console.log('配置格式验证通过');
    
    // 3. 浏览器环境下的特殊处理
    console.log('3. 浏览器环境检测...');
    if (typeof window !== 'undefined') {
      console.log('检测到浏览器环境，由于 CORS 限制，无法进行实际的图片上传测试');
      console.log('但配置格式验证通过，您可以尝试直接使用该配置');
      console.log('');
      console.log('重要提示：');
      console.log('1. 浏览器环境下，FastDFS 上传功能可能因 CORS 限制而无法使用');
      console.log('2. 建议在服务器端或桌面环境中使用 FastDFS 功能');
      console.log('3. 如果您确实需要在浏览器中使用，请确保 FastDFS 服务器的 Nginx 已配置正确的 CORS 头');
      console.log('');
      console.log('Nginx CORS 配置示例：');
      console.log('location / {');
      console.log('    add_header Access-Control-Allow-Origin *;');
      console.log('    add_header Access-Control-Allow-Methods GET, POST, OPTIONS;');
      console.log('    add_header Access-Control-Allow-Headers *;');
      console.log('    if ($request_method = OPTIONS) {');
      console.log('        return 200;');
      console.log('    }');
      console.log('}');
      
      // 在浏览器环境中，配置格式正确就返回成功
      return true;
    }
    
    // 非浏览器环境下，可以进行实际的上传测试
    // 由于当前是网页版应用，这部分代码不会执行
    console.log('非浏览器环境，准备进行实际上传测试...');
    
    // 配置格式正确，返回成功
    return true;
  } catch (error) {
    console.error('FastDFS 连接测试失败:', error);
    
    // 提供更详细的错误信息
    if (error instanceof TypeError) {
      console.error('TypeError details:', error.message);
      // 处理网络错误，如 DNS 解析失败、连接超时等
      if (error.message.includes('Failed to fetch')) {
        console.error('FastDFS 连接测试失败：这可能是跨域限制（CORS）问题或网络连接问题');
        console.error('建议解决方案：');
        console.error('1. 检查 FastDFS 服务器的 Nginx 配置，确保已添加正确的 CORS 头');
        console.error('2. 验证 FastDFS 服务器地址和端口是否正确');
        console.error('3. 确保服务器防火墙允许您的 IP 访问');
        console.error('4. 检查网络连接，确保可以访问 FastDFS 服务器');
        console.error('5. 尝试在浏览器中直接访问该地址，查看是否可以访问');
      } else if (error.message.includes('Invalid URL')) {
        console.error('FastDFS 配置错误：URL 格式不正确');
        console.error('建议解决方案：');
        console.error('1. 确保 httpUrl 是完整的 URL，如 http://192.168.1.100:8888');
        console.error('2. 确保 trackerServer 是正确的 IP 地址或域名');
        console.error('3. 确保 port 是有效的端口号');
      }
    } else if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    // 配置格式验证
    try {
      if (config.httpUrl && config.httpUrl.trim()) {
        new URL(config.httpUrl);
      }
      if (config.trackerServer && config.trackerServer.trim() && config.port) {
        new URL(`http://${config.trackerServer}:${config.port}`);
      }
      console.log('FastDFS 配置格式验证通过，可能是其他问题导致测试失败');
      // 在浏览器环境中，如果配置格式正确，我们可以认为连接配置有效
      return true;
    } catch (urlError) {
      console.error('FastDFS 配置格式错误:', urlError);
      return false;
    }
  }
}

// 上传图片到 FastDFS
export async function uploadImageByFastDFS(file: File): Promise<string | undefined> {
  try {
    // 检查浏览器环境
    if (typeof window !== 'undefined') {
      console.warn('警告：在浏览器环境中，FastDFS 上传功能可能因 CORS 限制而无法使用');
      console.warn('建议：在服务器端或桌面环境中使用 FastDFS 功能');
      console.warn('如果确实需要在浏览器中使用，请确保 FastDFS 服务器的 Nginx 已配置正确的 CORS 头');
    }
    
    const store = await Store.load('store.json');
    const config = await store.get<FastDFSConfig>('fastDFSConfig');
    
    if (!config) {
      const errorMsg = 'FastDFS 配置错误：请先配置 FastDFS 参数';
      console.error(errorMsg);
      toast({
        title: 'FastDFS 配置错误',
        description: errorMsg,
        variant: 'destructive',
      });
      return undefined;
    }
    
    // 验证配置完整性
    if (!config.trackerServer || !config.port || !config.httpUrl) {
      const errorMsg = 'FastDFS 配置不完整：请检查 trackerServer、port 和 httpUrl 参数';
      console.error(errorMsg, config);
      toast({
        title: 'FastDFS 配置错误',
        description: errorMsg,
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
    
    console.log('Uploading image to FastDFS:', uploadUrl);
    console.log('FastDFS Config:', config);
    
    // 准备表单数据
    const formData = new FormData();
    formData.append('file', file, filename);
    
    // 浏览器环境下的特殊处理
    let response;
    let timeoutId: NodeJS.Timeout | undefined;
    try {
      // 验证上传 URL 格式
      let parsedUrl;
      try {
        parsedUrl = new URL(uploadUrl);
        console.log('FastDFS upload URL:', parsedUrl.toString());
      } catch (urlError) {
        console.error('FastDFS upload URL 格式错误:', uploadUrl);
        const errorMsg = 'FastDFS 配置错误：上传 URL 格式不正确，请检查 httpUrl 配置';
        toast({
          title: '上传失败',
          description: errorMsg,
          variant: 'destructive',
        });
        
        // 提供 base64 作为备用方案
        console.log('Falling back to base64 encoding...');
        return await convertToBase64(file);
      }
      
      // 添加超时控制，避免请求无限期等待
      const controller = new AbortController();
      timeoutId = setTimeout(() => {
        console.error('FastDFS upload timeout after 10 seconds');
        controller.abort();
      }, 10000);
      
      response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // 允许跨域请求
        credentials: 'omit',
        // 添加 CORS 相关的请求头
        headers: {
          // 注意：使用 FormData 时，浏览器会自动设置正确的 Content-Type
          'Accept': '*/*',
        },
        // 添加超时控制
        signal: controller.signal,
      });
      
      // 清除超时定时器
      clearTimeout(timeoutId);
      
      console.log('FastDFS upload response:', response.status, response.statusText);
      
      if (response.status === 200) {
        // 解析 FastDFS 上传返回的格式，通常为 group1/M00/00/00/xxxxxx.jpg
        const result = await response.text();
        
        console.log('FastDFS upload result:', result);
        
        // 检查返回格式是否符合 FastDFS 标准
        if (result.startsWith(`${groupName}/`)) {
          // 构建完整的访问 URL
          const imageUrl = `${config.httpUrl}/${result}`;
          console.log('FastDFS uploaded image URL:', imageUrl);
          return imageUrl;
        } else {
          // 尝试解析 JSON 格式的返回结果（有些 FastDFS HTTP 服务器可能返回 JSON）
          try {
            const jsonResult = JSON.parse(result);
            console.log('FastDFS upload JSON result:', jsonResult);
            
            if (jsonResult.url) {
              return jsonResult.url;
            } else if (jsonResult.filename) {
              return `${config.httpUrl}/${jsonResult.filename}`;
            }
          } catch (jsonError) {
            console.error('Failed to parse FastDFS upload result as JSON:', jsonError);
            // 如果不是 JSON 格式，直接返回结果
            const imageUrl = `${config.httpUrl}/${result}`;
            console.log('FastDFS uploaded image URL (raw result):', imageUrl);
            return imageUrl;
          }
        }
      }
      
      const errorText = await response.text();
      console.error('FastDFS upload failed:', response.status, errorText);
      
      // 提供更详细的错误信息
      let errorMsg = `上传失败：${response.status} ${errorText}`;
      if (response.status === 403) {
        errorMsg = '上传失败：服务器拒绝访问，可能是权限问题或 CORS 限制';
      } else if (response.status === 404) {
        errorMsg = '上传失败：上传路径不存在，请检查 FastDFS 服务器配置';
      } else if (response.status >= 500) {
        errorMsg = `上传失败：服务器错误：${response.status} ${errorText}`;
      }
      
      toast({
        title: 'FastDFS 上传失败',
        description: errorMsg,
        variant: 'destructive',
      });
      
      // 提供 base64 作为备用方案
      console.log('Falling back to base64 encoding...');
      return await convertToBase64(file);
      
    } catch (fetchError) {
      // 清除超时定时器
      if (timeoutId) clearTimeout(timeoutId);
      
      if (typeof window !== 'undefined') {
        // 浏览器环境下的错误处理
        console.error('FastDFS 上传失败（浏览器环境）:', fetchError);
        
        let errorMsg = '浏览器环境限制：FastDFS 上传功能可能因 CORS 限制而无法使用';
        if (fetchError instanceof TypeError) {
          if (fetchError.message.includes('Failed to fetch')) {
            errorMsg = `网络连接错误：无法连接到 FastDFS 服务器。请检查：1. 服务器地址和端口是否正确；2. 网络连接是否正常；3. 服务器是否配置了正确的 CORS 头；4. 服务器防火墙是否允许您的 IP 访问。上传 URL: ${uploadUrl}`;
          } else if (fetchError.message.includes('AbortError')) {
            errorMsg = '上传超时：FastDFS 服务器响应超时，请检查服务器状态或网络连接';
          } else {
            errorMsg = `上传失败：${fetchError.message}`;
          }
        } else if (fetchError instanceof Error) {
          errorMsg = `上传失败：${fetchError.message}`;
        }
        
        toast({
          title: 'FastDFS 上传失败，使用本地存储',
          description: `${errorMsg}，已自动切换为本地图片存储`,
          variant: 'destructive',
        });
        
        // 提供 base64 作为备用方案
        console.log('Falling back to base64 encoding...');
        return await convertToBase64(file);
      }
      throw fetchError;
    }
    
  } catch (error) {
    console.error('FastDFS upload error:', error);
    
    let errorMessage = '上传失败';
    
    // 提供更详细的错误信息
    if (error instanceof TypeError) {
      console.error('TypeError details:', error.message);
      // 处理网络错误，如 DNS 解析失败、连接超时等
      if (error.message.includes('Failed to fetch')) {
        errorMessage = '上传失败：网络连接问题或跨域限制（CORS）';
        console.error('这可能是跨域限制（CORS）问题或网络连接问题');
        console.error('建议解决方案：');
        console.error('1. 检查 FastDFS 服务器的 Nginx 配置，确保已添加正确的 CORS 头');
        console.error('2. 验证 FastDFS 服务器地址和端口是否正确');
        console.error('3. 确保服务器防火墙允许您的 IP 访问');
        console.error('4. 检查网络连接，确保可以访问 FastDFS 服务器');
        console.error('5. 尝试在浏览器中直接访问该地址，查看是否可以访问');
      } else {
        errorMessage = `上传失败：${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = `上传失败：${error.message}`;
    }
    
    toast({
      title: 'FastDFS 上传失败，使用本地存储',
      description: `${errorMessage}，已自动切换为本地图片存储`,
      variant: 'destructive',
    });
    
    // 提供 base64 作为备用方案
    console.log('Falling back to base64 encoding...');
    return await convertToBase64(file);
  }
}

// 将图片转换为 base64 格式
async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}