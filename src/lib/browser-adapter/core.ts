/**
 * 浏览器核心适配层，替代 Tauri Core API
 */

export async function invoke<T>(command: string): Promise<T> {
  // 浏览器环境不支持 Tauri 的 invoke 命令
  console.warn(`Tauri invoke command '${command}' is not supported in browser mode`);
  
  // 对于特定的命令，返回默认值
  if (command === 'get_device_id') {
    // 生成一个基于 localStorage 的设备 ID
    let deviceId = localStorage.getItem('browser_device_id');
    if (!deviceId) {
      deviceId = `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('browser_device_id', deviceId);
    }
    return deviceId as T;
  }
  
  // 对于其他命令，返回 undefined
  return undefined as T;
}