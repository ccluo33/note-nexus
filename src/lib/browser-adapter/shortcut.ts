/**
 * 浏览器快捷键适配层，替代 Tauri Global Shortcut API
 */

type ShortcutCallback = () => void;

const shortcuts = new Map<string, ShortcutCallback>();

export async function register(accelerator: string, callback: ShortcutCallback): Promise<void> {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  // 将 Tauri 快捷键格式转换为浏览器格式
  const key = normalizeAccelerator(accelerator);
  shortcuts.set(key, callback);
  
  // 监听键盘事件
  document.addEventListener('keydown', (e) => {
    const pressed = buildKeyString(e);
    if (shortcuts.has(pressed)) {
      e.preventDefault();
      shortcuts.get(pressed)!();
    }
  });
}

export async function unregister(accelerator: string): Promise<void> {
  const key = normalizeAccelerator(accelerator);
  shortcuts.delete(key);
}

export async function unregisterAll(): Promise<void> {
  shortcuts.clear();
}

function normalizeAccelerator(accelerator: string): string {
  // 将 Tauri 格式（如 "CommandOrControl+S"）转换为浏览器格式
  return accelerator
    .replace(/CommandOrControl/gi, 'Meta')
    .replace(/Command/gi, 'Meta')
    .replace(/Control/gi, 'Ctrl')
    .replace(/Alt/gi, 'Alt')
    .replace(/Shift/gi, 'Shift')
    .replace(/\+/g, '+');
}

function buildKeyString(e: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (e.metaKey) parts.push('Meta');
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  
  if (e.key && e.key.length === 1) {
    parts.push(e.key.toUpperCase());
  } else if (e.key) {
    // 处理特殊键
    const key = e.key.replace(/^Key|^Digit|^Arrow/, '');
    parts.push(key);
  }
  
  return parts.join('+');
}

