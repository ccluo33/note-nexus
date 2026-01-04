/**
 * 浏览器存储适配层，替代 Tauri Store
 */
export class BrowserStore {
  private prefix: string;

  constructor(storeName: string = 'store') {
    this.prefix = `store_${storeName}_`;
  }

  // 静态方法 load，用于创建新的 Store 实例
  static async load(storeName: string): Promise<BrowserStore> {
    return new BrowserStore(storeName);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return null;
      }
      const value = localStorage.getItem(this.prefix + key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing store:', error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return [];
      }
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  async values(): Promise<any[]> {
    try {
      const keys = await this.keys();
      return Promise.all(keys.map(key => this.get(key)));
    } catch (error) {
      console.error('Error getting values:', error);
      return [];
    }
  }

  async entries(): Promise<[string, any][]> {
    try {
      const keys = await this.keys();
      const entries = await Promise.all(
        keys.map(async key => [key, await this.get(key)] as [string, any])
      );
      return entries;
    } catch (error) {
      console.error('Error getting entries:', error);
      return [];
    }
  }

  async save(): Promise<void> {
    // localStorage 是同步的，不需要保存操作
    return Promise.resolve();
  }
}

// 导出兼容 Tauri Store 的接口
export const Store = BrowserStore;

