const ERROR_REQUEST_CANCELLED = 'Request canceled';

async function fetch(input: string, init?: RequestInit) {
  // abort early here if needed
  const signal = init?.signal;
  if (signal?.aborted) {
      throw new Error(ERROR_REQUEST_CANCELLED);
  }
  
  // Remove Tauri-specific fields before creating the request
  if (init) {
      // @ts-expect-error - removing Tauri-specific fields
      delete init.maxRedirections;
      // @ts-expect-error - removing Tauri-specific fields
      delete init.connectTimeout;
      // @ts-expect-error - removing Tauri-specific fields
      delete init.proxy;
      // @ts-expect-error - removing Tauri-specific fields
      delete init.danger;
  }
  
  try {
    // 使用浏览器原生的 fetch API
    const response = await window.fetch(input, init);
    
    // 克隆响应，因为响应体只能读取一次
    const clonedResponse = response.clone();
    
    // 创建新的响应，确保headers被正确处理
    const res = new Response(clonedResponse.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    
    // 确保url属性被正确设置
    Object.defineProperty(res, 'url', { value: response.url });
    
    return res;
  } catch (error) {
    if (signal?.aborted) {
      throw new Error(ERROR_REQUEST_CANCELLED);
    }
    throw error;
  }
}

export { fetch };
