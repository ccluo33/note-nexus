import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function convertImage(path: string) {
  // 如果是http/https链接，直接返回
  if (path.includes('http')) {
    return path
  }
  
  try {
    // 从IndexedDB读取图片内容
    const { readFile } = await import('./browser-adapter/fs')
    const fileData = await readFile(path)
    
    // 检查文件数据是否有效
    if (!fileData || fileData.length === 0) {
      throw new Error('Empty image data')
    }
    
    // 将ArrayBufferLike转换为ArrayBuffer，然后创建Blob
    const arrayBuffer = fileData.buffer as ArrayBuffer;
    const blob = new Blob([new Uint8Array(arrayBuffer)], { type: 'image/*' })
    
    // 创建可访问的URL
    const url = URL.createObjectURL(blob)
    
    return url
  } catch (error) {
    console.error('Failed to convert image:', error)
    // 如果读取失败，返回原始路径
    return path
  }
}

export async function convertImageByWorkspace(path: string) {
  // 复用convertImage函数的逻辑，确保图片能正确加载
  return convertImage(path)
}

export function convertBytesToSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return '0 Bytes';
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

export function arrayBuffer2String(buffer: ArrayBuffer) {
  const decoder = new TextDecoder('iso-8859-1');
  return decoder.decode(buffer);
}

export function scrollToBottom() {
  const md = document.querySelector('#chats-wrapper')
  if (md) {
    // 使用 requestAnimationFrame 确保在下一帧渲染后滚动
    requestAnimationFrame(() => {
      // 再使用 setTimeout 确保复杂内容（如代码块）已完全渲染
      setTimeout(() => {
        md.scroll(0, md.scrollHeight)
      }, 0)
    })
  }
}