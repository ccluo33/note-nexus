import { SyncStateEnum } from '@/lib/sync/github.types';
import { Store } from "@/lib/browser-adapter/store";
import { create } from 'zustand'
import { GithubFile } from "@/lib/sync/github";

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

  // GitHub 图床配置
  imageRepoState: SyncStateEnum
  setImageRepoState: (state: SyncStateEnum) => void
  imageRepoInfo: any
  setImageRepoInfo: (info: any) => void
  imageRepoUserInfo: any
  setImageRepoUserInfo: (info: any) => void

  // 图片管理
  images: GithubFile[]
  path: string
  getImages: () => void
  setPath: (path: string) => void
  pushImage: (image: GithubFile) => void
  deleteImage: (image: GithubFile) => void
}

const useImageStore = create<MarkState>((set) => ({
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

  // GitHub 图床配置
  imageRepoState: SyncStateEnum.fail,
  setImageRepoState: (state) => {
    set({ imageRepoState: state })
  },
  imageRepoInfo: undefined,
  setImageRepoInfo: (info) => {
    set({ imageRepoInfo: info })
  },
  imageRepoUserInfo: undefined,
  setImageRepoUserInfo: (info) => {
    set({ imageRepoUserInfo: info })
  },

  // 图片管理
  images: [],
  path: '',
  getImages: () => {
    // 暂时为空实现，后续可根据实际需求添加逻辑
  },
  setPath: (path) => {
    set({ path })
  },
  pushImage: (image) => {
    set((state) => ({
      images: [...state.images, image]
    }))
  },
  deleteImage: (image) => {
    set((state) => ({
      images: state.images.filter((img) => img.url !== image.url)
    }))
  },
}))

export default useImageStore