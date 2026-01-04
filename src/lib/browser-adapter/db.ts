/**
 * 浏览器数据库适配层，替代 Tauri SQL
 * 使用 IndexedDB 存储数据
 * 
 * 注意：这是一个简化版本，实际项目中建议使用 Dexie.js 或类似的库
 * 来更好地处理 SQL 到 IndexedDB 的转换
 */

export interface Database {
  execute(query: string, bindValues?: any[]): Promise<{ lastInsertId?: number; rowsAffected?: number; rows?: any[] }>;
  select<T = any>(query: string, bindValues?: any[]): Promise<T[]>;
  close(): Promise<void>;
}

class IndexedDBDatabase implements Database {
  private dbName: string;
  private db: IDBDatabase | null = null;
  private dbVersion = 1;

  constructor(dbName: string) {
    this.dbName = dbName;
  }

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
        
        // 创建表结构（根据实际需求调整）
        if (!db.objectStoreNames.contains('chats')) {
          const chatsStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
          chatsStore.createIndex('created_at', 'created_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('marks')) {
          const marksStore = db.createObjectStore('marks', { keyPath: 'id', autoIncrement: true });
          marksStore.createIndex('created_at', 'created_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
          notesStore.createIndex('created_at', 'created_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('tags')) {
          const tagsStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true });
          tagsStore.createIndex('name', 'name', { unique: true });
        }
        
        if (!db.objectStoreNames.contains('vector')) {
          const vectorStore = db.createObjectStore('vector', { keyPath: 'id', autoIncrement: true });
          vectorStore.createIndex('filename', 'filename', { unique: false });
          vectorStore.createIndex('chunk_id', 'chunk_id', { unique: false });
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

  async execute(query: string, bindValues?: any[]): Promise<{ lastInsertId?: number; rowsAffected?: number; rows: any[] }> {
    await this.ensureInit();
    
    // 简单的 SQL 解析（这是一个简化版本，实际应该使用更完善的 SQL 解析器）
    const trimmed = query.trim();
    const upper = trimmed.toUpperCase();
    
    if (upper.startsWith('INSERT')) {
      return this.handleInsert(trimmed, bindValues);
    } else if (upper.startsWith('UPDATE')) {
      return this.handleUpdate(trimmed, bindValues);
    } else if (upper.startsWith('DELETE')) {
      return this.handleDelete(trimmed, bindValues);
    } else {
      // SELECT 查询
      return { rows: await this.select(query, bindValues) };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async select<T = any>(query: string, _bindValues?: any[]): Promise<T[]> {
    await this.ensureInit();
    
    // 简单的 SELECT 解析
    const match = query.match(/FROM\s+(\w+)/i);
    if (!match) return [];
    
    const tableName = match[1];
    if (!this.db) return [];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result || [];
        
        resolve(results as T[]);
      };
    });
  }

  private async handleInsert(query: string, bindValues?: any[]): Promise<{ lastInsertId?: number; rowsAffected?: number; rows: any[] }> {
    const match = query.match(/INSERT\s+INTO\s+(\w+)/i);
    if (!match || !this.db) {
      throw new Error('Invalid INSERT query');
    }
    
    const tableName = match[1];
    const transaction = this.db.transaction([tableName], 'readwrite');
    const store = transaction.objectStore(tableName);
    
    // 解析列名和值
    const columnsMatch = query.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/i);
    const valuesMatch = query.match(/VALUES\s*\(([^)]+)\)/i);
    
    if (!columnsMatch || !valuesMatch) {
      throw new Error('Invalid INSERT query format');
    }
    
    // 提取列名
    const columns = columnsMatch[1].split(',').map(col => col.trim());
    
    // 构建对象
    const obj: any = {};
    if (bindValues) {
      columns.forEach((col, idx) => {
        obj[col] = bindValues[idx];
      });
    }
    
    return new Promise((resolve, reject) => {
      const request = store.add(obj);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve({
          lastInsertId: request.result as number,
          rowsAffected: 1,
          rows: []
        });
      };
    });
  }

  private async handleUpdate(query: string, bindValues?: any[]): Promise<{ rowsAffected?: number; rows: any[] }> {
    const match = query.match(/UPDATE\s+(\w+)/i);
    if (!match || !this.db) {
      throw new Error('Invalid UPDATE query');
    }
    
    const tableName = match[1];
    const transaction = this.db.transaction([tableName], 'readwrite');
    const store = transaction.objectStore(tableName);
    
    // 解析 SET 子句
    const setMatch = query.match(/SET\s+(.+?)\s+WHERE/i);
    if (!setMatch) {
      throw new Error('Invalid UPDATE SET clause');
    }
    
    const setClause = setMatch[1];
    const columnPairs = setClause.split(',').map(pair => pair.trim());
    
    // 解析 WHERE 条件
    const whereMatch = query.match(/WHERE\s+(\w+)\s*=\s*\$(\d+)/i);
    if (!whereMatch) {
      throw new Error('Invalid UPDATE WHERE clause');
    }
    
    const whereValueIndex = parseInt(whereMatch[2]) - 1;
    const whereValue = bindValues?.[whereValueIndex];
    
    // 构建更新对象
    const updateObj: any = {};
    columnPairs.forEach((pair) => {
      const [col, placeholder] = pair.split('=').map(s => s.trim());
      const match = placeholder.match(/\$(\d+)/);
      if (match) {
        const valueIndex = parseInt(match[1]) - 1;
        updateObj[col] = bindValues?.[valueIndex];
      }
    });
    
    return new Promise((resolve, reject) => {
      const request = store.get(whereValue);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const currentData = request.result;
        if (currentData) {
          const updatedData = { ...currentData, ...updateObj };
          const updateRequest = store.put(updatedData);
          
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => {
            resolve({ rowsAffected: 1, rows: [] });
          };
        } else {
          resolve({ rowsAffected: 0, rows: [] });
        }
      };
    });
  }

  private async handleDelete(query: string, bindValues?: any[]): Promise<{ rowsAffected?: number; rows: any[] }> {
    const match = query.match(/DELETE\s+FROM\s+(\w+)/i);
    if (!match || !this.db) {
      throw new Error('Invalid DELETE query');
    }
    
    const tableName = match[1];
    const transaction = this.db.transaction([tableName], 'readwrite');
    const store = transaction.objectStore(tableName);
    
    // 解析 WHERE 条件
    const whereMatch = query.match(/WHERE\s+(\w+)\s*=\s*\$1/i);
    if (!whereMatch) {
      throw new Error('Invalid DELETE WHERE clause');
    }
    
    const columnName = whereMatch[1];
    const value = bindValues?.[0];
    
    // 如果 WHERE 条件是主键，直接删除
    if (columnName === 'id') {
      return new Promise((resolve, reject) => {
        const request = store.delete(value);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          resolve({ rowsAffected: 1, rows: [] });
        };
      });
    }
    
    // 否则使用索引查找并删除
    return new Promise((resolve, reject) => {
      let index;
      try {
        index = store.index(columnName);
      } catch {
        // 如果索引不存在，尝试遍历所有记录查找匹配
        const request = store.openCursor();
        
        request.onerror = () => reject(request.error);
        
        let rowsAffected = 0;
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            if (cursor.value[columnName] === value) {
              cursor.delete();
              rowsAffected++;
            }
            cursor.continue();
          } else {
            resolve({ rowsAffected, rows: [] });
          }
        };
        return;
      }
      
      const request = index.openCursor(IDBKeyRange.only(value));
      
      let rowsAffected = 0;
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          rowsAffected++;
          cursor.continue();
        } else {
          resolve({ rowsAffected, rows: [] });
        }
      };
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// 导出兼容 Tauri SQL 的接口
export async function load(database: string): Promise<Database> {
  const db = new IndexedDBDatabase(database.replace('sqlite:', ''));
  await db.init();
  return db;
}

// 为了更好的兼容性，我们也可以直接使用 Dexie.js
// 但为了简化，这里先使用基本的 IndexedDB 实现

