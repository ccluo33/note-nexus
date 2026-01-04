/**
 * 浏览器 HTTP 适配层，替代 Tauri HTTP API
 */

export async function fetch(
  input: string | Request,
  init?: RequestInit
): Promise<Response> {
  // 直接使用浏览器的 fetch API
  return window.fetch(input, init);
}

