import { uploadImageByS3 } from "./s3";
import { uploadImageByFastDFS } from "./fastdfs";
import { Store } from "@/lib/browser-adapter/store";

export async function uploadImage(file: File) {
  const store = await Store.load('store.json');
  
  // 检查是否启用了图床功能
  const useImageRepo = await store.get<boolean>('useImageRepo')
  if (!useImageRepo) {
    return undefined
  }
  
  const mainImageHosting = await store.get<string>('mainImageHosting')
  
  // 如果没有配置图床，直接返回 undefined
  if (!mainImageHosting || mainImageHosting === 'none') {
    return undefined
  }
  
  switch (mainImageHosting) {
    case 's3':
      return uploadImageByS3(file)
    case 'fastdfs':
      return uploadImageByFastDFS(file)
    default:
      return undefined
  }
}