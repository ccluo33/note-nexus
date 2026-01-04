/**
 * 浏览器存储适配层，替代 Tauri Store
 * 使用 localStorage 实现
 */

export interface Store {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  entries(): Promise<[string, any][]>;
  keys(): Promise<string[]>;
  values(): Promise<any[]>;
  length(): Promise<number>;
  save(): Promise<void>;
}

class LocalStorageStore implements Store {
  private storeName: string;
  private prefix: string;

  constructor(storeName: string) {
    this.storeName = storeName;
    this.prefix = `store_${storeName}_`;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    const value = localStorage.getItem(this.getKey(key));
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: any): Promise<void> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(this.getKey(key));
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    const keys = await this.keys();
    for (const key of keys) {
      localStorage.removeItem(this.getKey(key));
    }
  }

  async has(key: string): Promise<boolean> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  async entries(): Promise<[string, any][]> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    const keys = await this.keys();
    const entries: [string, any][] = [];
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        entries.push([key, value]);
      }
    }
    return entries;
  }

  async keys(): Promise<string[]> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }

  async values(): Promise<any[]> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    const keys = await this.keys();
    const values: any[] = [];
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        values.push(value);
      }
    }
    return values;
  }

  async length(): Promise<number> {
    return (await this.keys()).length;
  }

  async save(): Promise<void> {
    // localStorage 是自动保存的，这里不需要做任何操作
  }
}

export async function load(storeName: string): Promise<Store> {
  return new LocalStorageStore(storeName);
}

export const Store = {
  load
};
