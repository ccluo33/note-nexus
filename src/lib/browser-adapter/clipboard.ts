/**
 * 浏览器剪贴板适配层，替代 Tauri Clipboard API
 */

export async function readText(): Promise<string> {
  try {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      throw new Error('Clipboard API is not available');
    }
    return await navigator.clipboard.readText();
  } catch (error) {
    console.error('Failed to read clipboard:', error);
    throw error;
  }
}

export async function writeText(text: string): Promise<void> {
  try {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      throw new Error('Clipboard API is not available');
    }
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to write clipboard:', error);
    throw error;
  }
}

export async function hasText(): Promise<boolean> {
  try {
    const text = await readText();
    return text.length > 0;
  } catch {
    return false;
  }
}

export async function hasImage(): Promise<boolean> {
  // 浏览器环境难以检测剪贴板中的图片
  // 返回 false，表示不支持图片剪贴板功能
  return false;
}

export async function readImageBase64(): Promise<string> {
  // 浏览器环境不支持读取剪贴板图片为 base64
  throw new Error('Reading clipboard image is not supported in browser mode');
}

export async function clear(): Promise<void> {
  // 浏览器环境不支持清空剪贴板
  console.warn('Clearing clipboard is not supported in browser mode');
}

