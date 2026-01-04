/**
 * 浏览器事件适配层，替代 Tauri Event API
 */

export type UnlistenFn = () => void;

export interface Event<T> {
  event: string;
  payload: T;
}

export type EventCallback<T> = (event: Event<T>) => void;

/**
 * 监听事件
 * 在浏览器环境中，我们使用自定义事件系统来模拟 Tauri 的事件监听
 */
export async function listen<T>(
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: EventCallback<T>
): Promise<UnlistenFn> {
  // 浏览器环境不支持 Tauri 的事件系统
  // 返回一个空的取消监听函数
  console.warn(`Tauri event '${event}' is not supported in browser mode`);
  
  return () => {
    // 空函数，用于取消监听
  };
}

/**
 * 发送事件
 */
export async function emit<T>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  payload?: T
): Promise<void> {
  // 浏览器环境不支持 Tauri 的事件系统
  console.warn(`Tauri emit event '${event}' is not supported in browser mode`);
}

/**
 * 监听一次性事件
 */
export async function once<T>(
  event: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: EventCallback<T>
): Promise<UnlistenFn> {
  // 浏览器环境不支持 Tauri 的事件系统
  console.warn(`Tauri once event '${event}' is not supported in browser mode`);
  
  return () => {
    // 空函数，用于取消监听
  };
}