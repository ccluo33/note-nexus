/**
 * 浏览器路径适配层，替代 Tauri Path API
 */

export async function join(...paths: string[]): Promise<string> {
  // 简单的路径拼接，处理斜杠
  const normalized = paths
    .filter(p => p)
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');
  
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

export async function appDataDir(): Promise<string> {
  return '/appdata';
}

export async function resolve(...paths: string[]): Promise<string> {
  return join(...paths);
}

export async function normalize(path: string): Promise<string> {
  return path.replace(/\/+/g, '/').replace(/\/$/, '');
}

export async function dirname(path: string): Promise<string> {
  const parts = path.split('/').filter(p => p);
  if (parts.length <= 1) return '/';
  parts.pop();
  return '/' + parts.join('/');
}

export async function basename(path: string, ext?: string): Promise<string> {
  const parts = path.split('/').filter(p => p);
  let name = parts[parts.length - 1] || '';
  if (ext && name.endsWith(ext)) {
    name = name.substring(0, name.length - ext.length);
  }
  return name;
}

export async function extname(path: string): Promise<string> {
  const parts = path.split('/');
  const filename = parts[parts.length - 1] || '';
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot) : '';
}

