/**
 * 浏览器核心适配层，替代 Tauri Core API
 */

// API 基础 URL，根据环境配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // 生产环境使用相对路径
  : 'http://localhost:8000/api'; // 开发环境使用绝对路径
const API_VERSION = 'v1';
const FULL_API_URL = `${API_BASE_URL}/${API_VERSION}`;

/**
 * 通用的 invoke 函数，支持桌面和浏览器环境
 */
export async function invoke<T>(command: string, args?: any): Promise<T> {
  // 浏览器环境：直接调用后端 API
  console.log(`调用 API 命令: ${command}`, args);
  
  try {
    let url = '';
    let method = 'GET';
    let body = undefined;
    
    // 根据命令映射到对应的 API 端点
    switch (command) {
      case 'get_device_id':
        url = `${FULL_API_URL}/device/id`;
        break;
      
      case 'webdav_test':
        url = `${FULL_API_URL}/webdav/test`;
        method = 'POST';
        body = JSON.stringify(args);
        break;
      
      case 'webdav_backup':
        url = `${FULL_API_URL}/webdav/backup`;
        method = 'POST';
        body = JSON.stringify(args);
        break;
      
      case 'webdav_sync':
        url = `${FULL_API_URL}/webdav/sync`;
        method = 'POST';
        body = JSON.stringify(args);
        break;
      
      case 'webdav_create_dir':
        url = `${FULL_API_URL}/webdav/create-dir`;
        method = 'POST';
        body = JSON.stringify(args);
        break;
      
      case 'fetch_url_content':
        url = `${FULL_API_URL}/fetch/url-content`;
        method = 'POST';
        body = JSON.stringify(args);
        break;
      
      case 'start_mcp_stdio_server':
        url = `${FULL_API_URL}/mcp/start`;
        method = 'POST';
        body = JSON.stringify(args || {});
        break;
      
      case 'stop_mcp_server':
        url = `${FULL_API_URL}/mcp/stop`;
        method = 'POST';
        body = JSON.stringify(args);
        break;
      
      case 'send_mcp_message':
        url = `${FULL_API_URL}/mcp/send-message`;
        method = 'POST';
        body = JSON.stringify(args);
        break;
      
      case 'fastdfs_upload':
        // FastDFS上传命令
        url = `${FULL_API_URL}/fastdfs/upload`;
        method = 'POST';
        // 处理文件上传，需要使用FormData
        if (args && args.file) {
          const formData = new FormData();
          formData.append('file', args.file);
          // 添加http_url参数
          if (args.http_url) {
            formData.append('http_url', args.http_url);
          }
          // 这里需要特殊处理，不使用JSON.stringify，直接传递FormData
          return new Promise((resolve, reject) => {
            fetch(url, {
              method,
              headers: {
                'Accept': 'application/json',
              },
              body: formData,
            })
            .then(res => res.json())
            .then(data => resolve(data as T))
            .catch(err => reject(err));
          });
        }
        break;
      
      case 'fastdfs_delete':
        // FastDFS删除命令
        url = `${FULL_API_URL}/fastdfs/delete/${args?.file_id}`;
        method = 'DELETE';
        break;
      
      case 'rank_keywords':
        // 关键词排名，在浏览器环境中返回空数组
        return [] as T;
      
      case 'export_app_data':
        // 导出应用数据，在浏览器环境中返回 undefined
        return undefined as T;
      
      case 'import_app_data':
        // 导入应用数据，在浏览器环境中返回 undefined
        return undefined as T;
      
      default:
        // 对于其他命令，返回 undefined
        console.warn(`未知命令: ${command}`);
        return undefined as T;
    }
    
    // 发送 API 请求
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body,
    });
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 解析响应
    const data = await response.json();
    return data as T;
    
  } catch (error) {
    console.error(`API 命令执行失败: ${command}`, error);
    
    // 对于失败的请求，返回默认值或重新抛出错误
    switch (command) {
      case 'get_device_id':
        // 生成一个基于 localStorage 的设备 ID 作为备用
        let deviceId = localStorage.getItem('browser_device_id');
        if (!deviceId) {
          deviceId = `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('browser_device_id', deviceId);
        }
        return deviceId as T;
      
      case 'fetch_url_content':
        // 在 API 请求失败时，返回基本链接信息
        if (args && args.url) {
          const url = args.url;
          const urlObj = new URL(url);
          return {
            title: urlObj.hostname,
            meta_desc: `来自 ${urlObj.hostname} 的链接`,
            main_content: '',
            url: url
          } as T;
        }
        return undefined as T;
      
      default:
        // 对于其他命令，返回 undefined
        return undefined as T;
    }
  }
}