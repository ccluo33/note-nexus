/**
 * 浏览器文件系统适配层，替代 Tauri FS
 * 使用 IndexedDB 存储文件内容
 */

// 模拟 BaseDirectory
export enum BaseDirectory {
  AppData = 'AppData',
  Desktop = 'Desktop',
  Document = 'Document',
  Download = 'Download',
  Home = 'Home',
  Picture = 'Picture',
  Public = 'Public',
  Resource = 'Resource',
  Temp = 'Temp',
  Video = 'Video',
  Audio = 'Audio',
  Cache = 'Cache',
  Config = 'Config',
  Data = 'Data',
  LocalData = 'LocalData',
  Runtime = 'Runtime',
  Executable = 'Executable',
}

export interface DirEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink?: boolean;
}

// IndexedDB 文件系统存储
class IndexedDBFileSystem {
  private dbName = 'note-gen-fs';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      // 服务器端渲染时，延迟初始化
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' });
        }
      };
    });
  }

  private async ensureInit(): Promise<void> {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB is only available in browser environment');
    }
    if (!this.db) {
      await this.init();
    }
  }

  private normalizePath(path: string, baseDir?: BaseDirectory): string {
    // 对于带 baseDir 的路径，不要添加 '/' 前缀，直接使用相对路径
    if (baseDir) {
      // 移除可能存在的 '/' 前缀，因为 baseDir 已经提供了上下文
      return path.startsWith('/') ? path.substring(1) : path;
    }
    // 对于不带 baseDir 的路径，使用绝对路径格式
    return path.startsWith('/') ? path : `/${path}`;
  }

  async readTextFile(path: string, options?: { baseDir?: BaseDirectory }): Promise<string> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      
      // 检查原始路径
      const request1 = store.get(normalizedPath);
      
      request1.onerror = () => reject(request1.error);
      request1.onsuccess = () => {
        const result1 = request1.result;
        if (result1 && result1.content) {
          // 找到原始路径的内容
          if (result1.isBinary) {
            const binaryContent = result1.content as ArrayBuffer;
            const text = new TextDecoder().decode(binaryContent);
            resolve(text);
          } else {
            resolve(result1.content as string);
          }
        } else {
          // 检查带斜杠结尾的路径（目录）
          const request2 = store.get(`${normalizedPath}/`);
          request2.onerror = () => reject(request2.error);
          request2.onsuccess = () => {
            const result2 = request2.result;
            if (result2 && result2.content) {
              // 找到带斜杠路径的内容
              if (result2.isBinary) {
                const binaryContent = result2.content as ArrayBuffer;
                const text = new TextDecoder().decode(binaryContent);
                resolve(text);
              } else {
                resolve(result2.content as string);
              }
            } else {
              // 文件不存在时返回空字符串，而不是抛出错误
              resolve('');
            }
          };
        }
      };
    });
  }

  async readFile(path: string, options?: { baseDir?: BaseDirectory }): Promise<Uint8Array> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      
      // 检查原始路径
      const request1 = store.get(normalizedPath);
      
      request1.onerror = () => reject(request1.error);
      request1.onsuccess = () => {
        const result1 = request1.result;
        if (result1 && result1.content) {
          // 找到原始路径的内容
          if (result1.isBinary) {
            const binaryContent = result1.content as ArrayBuffer;
            resolve(new Uint8Array(binaryContent));
          } else {
            const encoder = new TextEncoder();
            resolve(encoder.encode(result1.content as string));
          }
        } else {
          // 检查带斜杠结尾的路径（目录）
          const request2 = store.get(`${normalizedPath}/`);
          request2.onerror = () => reject(request2.error);
          request2.onsuccess = () => {
            const result2 = request2.result;
            if (result2 && result2.content) {
              // 找到带斜杠路径的内容
              if (result2.isBinary) {
                const binaryContent = result2.content as ArrayBuffer;
                resolve(new Uint8Array(binaryContent));
              } else {
                const encoder = new TextEncoder();
                resolve(encoder.encode(result2.content as string));
              }
            } else {
              // 文件不存在时返回空的Uint8Array，而不是抛出错误
              resolve(new Uint8Array());
            }
          };
        }
      };
    });
  }

  async writeTextFile(path: string, contents: string, options?: { baseDir?: BaseDirectory; isDirectory?: boolean }): Promise<void> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const getRequest = store.get(normalizedPath);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const now = Date.now();
        const request = store.put({
          path: normalizedPath,
          content: contents,
          isBinary: false,
          isDirectory: options?.isDirectory || false,
          createdAt: existing?.createdAt || now,
          updatedAt: now,
        });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async writeFile(path: string, contents: Uint8Array, options?: { baseDir?: BaseDirectory; isDirectory?: boolean }): Promise<void> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const getRequest = store.get(normalizedPath);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const now = Date.now();
        const request = store.put({
          path: normalizedPath,
          content: contents.buffer, // 直接保存ArrayBuffer
          isBinary: true,
          isDirectory: options?.isDirectory || false,
          createdAt: existing?.createdAt || now,
          updatedAt: now,
        });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async readDir(path: string, options?: { baseDir?: BaseDirectory }): Promise<DirEntry[]> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);
    const pathPrefix = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const allFiles = request.result || [];
        const entries: DirEntry[] = [];
        const seen = new Set<string>();

        for (const file of allFiles) {
          if (file.path.startsWith(pathPrefix)) {
            const relativePath = file.path.substring(pathPrefix.length);
            const parts = relativePath.split('/');
            const name = parts[0];

            if (name && !seen.has(name)) {
              seen.add(name);
              const isDirectory = parts.length > 1 || file.isDirectory;
              entries.push({
                name,
                path: `${pathPrefix}${name}`,
                isDirectory,
                isFile: !isDirectory,
              });
            }
          }
        }

        resolve(entries);
      };
    });
  }

  async mkdir(path: string, options?: { baseDir?: BaseDirectory; recursive?: boolean }): Promise<void> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);
    const dirPath = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.put({
        path: dirPath,
        content: '',
        isDirectory: true,
        updatedAt: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async exists(path: string, options?: { baseDir?: BaseDirectory }): Promise<boolean> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      
      // 检查原始路径
      const request1 = store.get(normalizedPath);
      
      request1.onerror = () => reject(request1.error);
      request1.onsuccess = () => {
        if (request1.result) {
          // 找到原始路径，直接返回true
          resolve(true);
        } else {
          // 检查带斜杠结尾的路径（目录）
          const request2 = store.get(`${normalizedPath}/`);
          request2.onerror = () => reject(request2.error);
          request2.onsuccess = () => {
            resolve(!!request2.result);
          };
        }
      };
    });
  }

  async stat(path: string, options?: { baseDir?: BaseDirectory }): Promise<{ isFile: boolean; isDirectory: boolean; size: number; mtime: number; birthtime: number }> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      
      // 检查原始路径
      const request1 = store.get(normalizedPath);
      
      request1.onerror = () => reject(request1.error);
      request1.onsuccess = () => {
        const result1 = request1.result;
        if (result1) {
          // 文件或目录存在
          resolve({
            isFile: !result1.isDirectory,
            isDirectory: result1.isDirectory,
            size: result1.content?.length || 0,
            mtime: result1.updatedAt || Date.now(),
            birthtime: result1.createdAt || result1.updatedAt || Date.now(),
          });
        } else {
          // 检查带斜杠结尾的路径（目录）
          const request2 = store.get(`${normalizedPath}/`);
          request2.onerror = () => reject(request2.error);
          request2.onsuccess = () => {
            const result2 = request2.result;
            if (result2) {
              // 目录存在
              resolve({
                isFile: false,
                isDirectory: true,
                size: result2.content?.length || 0,
                mtime: result2.updatedAt || Date.now(),
                birthtime: result2.createdAt || result2.updatedAt || Date.now(),
              });
            } else {
              // 文件或目录不存在
              reject(new Error(`File not found: ${normalizedPath}`));
            }
          };
        }
      };
    });
  }

  async copyFile(source: string, destination: string, options?: { baseDir?: BaseDirectory }): Promise<void> {
    const content = await this.readFile(source, options);
    await this.writeFile(destination, content, options);
  }

  async remove(path: string, options?: { baseDir?: BaseDirectory; recursive?: boolean }): Promise<void> {
    await this.ensureInit();
    const normalizedPath = this.normalizePath(path, options?.baseDir);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      // 删除文件或目录
      const request = store.delete(normalizedPath);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // 如果是目录且需要递归删除，删除所有子项
        if (options?.recursive) {
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => {
            const allFiles = getAllRequest.result || [];
            const pathPrefix = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
            
            for (const file of allFiles) {
              if (file.path.startsWith(pathPrefix)) {
                store.delete(file.path);
              }
            }
            resolve();
          };
          getAllRequest.onerror = () => reject(getAllRequest.error);
        } else {
          resolve();
        }
      };
    });
  }

  async rename(oldPath: string, newPath: string, options?: { baseDir?: BaseDirectory }): Promise<void> {
    const content = await this.readTextFile(oldPath, options);
    const statInfo = await this.stat(oldPath, options);
    await this.writeTextFile(newPath, content, { ...options, isDirectory: statInfo.isDirectory });
    await this.remove(oldPath, options);
  }
}

// 单例实例
const fsInstance = new IndexedDBFileSystem();

// 初始化文件系统（仅在浏览器环境中）
if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
  fsInstance.init().catch(console.error);
}

// 导出兼容 Tauri FS 的接口
export const readTextFile = (path: string, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.readTextFile(path, options);

export const readFile = (path: string, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.readFile(path, options);

export const writeTextFile = (path: string, contents: string, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.writeTextFile(path, contents, options);

export const writeFile = (path: string, contents: Uint8Array, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.writeFile(path, contents, options);

export const readDir = (path: string, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.readDir(path, options);

export const mkdir = (path: string, options?: { baseDir?: BaseDirectory; recursive?: boolean }) => 
  fsInstance.mkdir(path, options);

export const exists = (path: string, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.exists(path, options);

export const stat = (path: string, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.stat(path, options);

export const copyFile = (source: string, destination: string, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.copyFile(source, destination, options);

export const remove = (path: string, options?: { baseDir?: BaseDirectory; recursive?: boolean }) => 
  fsInstance.remove(path, options);

export const rename = (oldPath: string, newPath: string, options?: { baseDir?: BaseDirectory }) => 
  fsInstance.rename(oldPath, newPath, options);

