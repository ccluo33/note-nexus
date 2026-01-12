/**
 * 浏览器对话框适配层，替代 Tauri Dialog API
 */

export async function open(options?: {
  multiple?: boolean;
  directory?: boolean;
  filters?: Array<{ name: string; extensions: string[] }>;
  title?: string;
}): Promise<string | string[] | null> {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options?.multiple || false;
    
    if (options?.directory) {
      // 注意：浏览器中 directory 选择需要 webkitdirectory 属性
      input.setAttribute('webkitdirectory', '');
    } else if (options?.filters && options.filters.length > 0) {
      // 设置文件类型过滤
      const accept = options.filters
        .flatMap(filter => filter.extensions.map(ext => `.${ext}`))
        .join(',');
      input.accept = accept;
    }

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        resolve(null);
        return;
      }

      // 保存文件到IndexedDB
      const { writeFile } = await import('./fs');
      const savedPaths: string[] = [];

      for (const file of Array.from(files)) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const path = `/tmp/${file.name}`;
        await writeFile(path, uint8Array);
        savedPaths.push(path);
      }

      if (options?.multiple) {
        resolve(savedPaths);
      } else {
        resolve(savedPaths[0]);
      }
    };

    input.oncancel = () => {
      resolve(null);
    };

    input.click();
  });
}

export async function save(options?: {
  filters?: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
}): Promise<string | null> {
  // 浏览器中无法直接保存文件到指定路径
  // 这里返回一个提示，实际保存需要通过其他方式（如下载）
  console.warn('Browser save dialog is not fully supported. Use download API instead.');
  return options?.defaultPath || null;
}

export async function ask(message: string, options?: {
  title?: string;
  kind?: 'info' | 'warning' | 'error';
}): Promise<boolean> {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  
  return new Promise((resolve) => {
    const confirmed = window.confirm(`${options?.title || ''}\n\n${message}`);
    resolve(confirmed);
  });
}

export async function confirm(message: string, options?: {
  title?: string;
  kind?: 'info' | 'warning' | 'error';
}): Promise<boolean> {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  
  return new Promise((resolve) => {
    const confirmed = window.confirm(`${options?.title || ''}\n\n${message}`);
    resolve(confirmed);
  });
}

export async function message(message: string, options?: {
  title?: string;
  kind?: 'info' | 'warning' | 'error';
}): Promise<void> {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  return new Promise((resolve) => {
    alert(`${options?.title || ''}\n\n${message}`);
    resolve();
  });
}

