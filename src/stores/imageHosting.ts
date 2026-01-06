import { SyncStateEnum } from '@/lib/sync/github.types';
import { Store } from "@/lib/browser-adapter/store";
import { create } from 'zustand'

interface S3Config {
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucket: string
  endpoint?: string
  customDomain?: string
  pathPrefix?: string
}

interface FastDFSConfig {
  trackerServer: string;
  port: number;
  httpUrl: string;
  groupName?: string;
  storagePath?: string;
}

interface MarkState {
  initMainHosting: () => Promise<void>

  // 主要图床
  mainImageHosting: string
  setMainImageHosting: (mainImageHosting: string) => Promise<void>
  
  // S3 配置
  s3Config?: S3Config
  setS3Config: (config: S3Config) => Promise<void>
  s3State: SyncStateEnum
  setS3State: (state: SyncStateEnum) => void

  // FastDFS 配置
  fastDFSConfig?: FastDFSConfig
  setFastDFSConfig: (config: FastDFSConfig) => Promise<void>
  fastDFSState: SyncStateEnum
  setFastDFSState: (state: SyncStateEnum) => void
}

const useImageStore = create<MarkState>((set, get) => ({
  initMainHosting: async () => {
    const store = await Store.load('store.json');
    const mainImageHosting = await store.get<string>('mainImageHosting')
    if (mainImageHosting) {
      set({ mainImageHosting })
    }
    
    // 初始化 S3 配置
    const s3Config = await store.get<S3Config>('s3Config');
    if (s3Config) {
      set({ s3Config })
    }
    
    // 初始化 FastDFS 配置
    const fastDFSConfig = await store.get<FastDFSConfig>('fastDFSConfig');
    if (fastDFSConfig) {
      set({ fastDFSConfig })
    }
  },

  // 主要图床
  mainImageHosting: 'fastdfs',
  setMainImageHosting: async (mainImageHosting) => {
    set({ mainImageHosting })
    const store = await Store.load('store.json');
    await store.set('mainImageHosting', mainImageHosting)
    await store.save()
  },

  // S3 配置
  s3Config: undefined,
  setS3Config: async (config) => {
    set({ s3Config: config })
    const store = await Store.load('store.json');
    await store.set('s3Config', config)
    await store.save()
  },
  s3State: SyncStateEnum.fail,
  setS3State: (s3State) => {
    set({ s3State })
  },

  // FastDFS 配置
  fastDFSConfig: undefined,
  setFastDFSConfig: async (config) => {
    set({ fastDFSConfig: config })
    const store = await Store.load('store.json');
    await store.set('fastDFSConfig', config)
    await store.save()
  },
  fastDFSState: SyncStateEnum.fail,
  setFastDFSState: (fastDFSState) => {
    set({ fastDFSState })
  },
}))

export default useImageStore