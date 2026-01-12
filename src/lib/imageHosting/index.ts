import { uploadImageByS3 } from "./s3";
import { uploadImageByFastDFS } from "./fastdfs";
import { Store } from "@/lib/browser-adapter/store";

export async function uploadImage(file: File) {
  const store = await Store.load('store.json');
  
  // 检查是否启用了图床功能，默认启用
  const useImageRepo = await store.get<boolean>('useImageRepo') !== false
  console.log('Image upload - useImageRepo:', useImageRepo)
  if (!useImageRepo) {
    console.error('Image hosting is not enabled. Please enable it in settings.')
    return undefined
  }
  
  // 获取主要图床，默认使用 fastdfs
  const mainImageHosting = await store.get<string>('mainImageHosting') || 'fastdfs'
  console.log('Image upload - mainImageHosting:', mainImageHosting)
  
  // 如果没有配置图床，直接返回 undefined
  if (!mainImageHosting || mainImageHosting === 'none') {
    console.error('No image hosting configured. Please configure it in settings.')
    return undefined
  }
  
  try {
    switch (mainImageHosting) {
      case 's3':
        return await uploadImageByS3(file)
      case 'fastdfs':
        return await uploadImageByFastDFS(file)
      default:
        console.error(`Invalid image hosting type: ${mainImageHosting}`)
        return undefined
    }
  } catch (error) {
    console.error('Image upload failed:', error)
    throw error
  }
}