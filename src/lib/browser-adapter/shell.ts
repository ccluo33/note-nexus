/**
 * 浏览器 shell 适配层，替代 Tauri Shell API
 */

export async function open(url: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  
  window.open(url, '_blank', 'noopener,noreferrer');
}
