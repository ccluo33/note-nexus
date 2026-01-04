/**
 * 浏览器 opener 适配层，替代 Tauri Opener API
 */

export async function openPath(path: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  
  console.warn(`openPath called in browser mode: ${path}. This function is not supported in browser environment.`);
  
  return;
}
