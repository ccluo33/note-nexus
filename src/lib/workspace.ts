import { BaseDirectory } from "@/lib/browser-adapter/fs"
import { join } from '@/lib/browser-adapter/path'
import { Store } from "@/lib/browser-adapter/store"

/**
 * 获取当前工作区路径
 * 如果设置了自定义工作区，则返回自定义路径
 * 否则返回默认的 AppData/article 路径
 */
export async function getWorkspacePath(): Promise<{ path: string, isCustom: boolean }> {
  // 查询本地存储
  const store = await Store.load('store.json')
  const workspacePath = await store.get<string>('workspacePath')
  
  // 如果设置了自定义工作区路径，则使用自定义路径
  if (workspacePath) {
    return { 
      path: workspacePath,
      isCustom: true 
    }
  }
  
  // 否则使用默认路径
  return { 
    path: 'article', 
    isCustom: false 
  }
}

/**
 * 获取文件的完整路径选项
 * @param relativePath 相对于工作区的路径
 * @returns 包含文件路径和baseDir的选项
 */
export async function getFilePathOptions(relativePath: string): Promise<{ path: string, baseDir?: BaseDirectory }> {
  const workspace = await getWorkspacePath()
  
  if (workspace.isCustom) {
    // 对于自定义工作区，返回绝对路径，不设置baseDir
    const fullPath = await join(workspace.path, relativePath)
    return { path: fullPath }
  } else {
    // 对于默认工作区，使用AppData作为baseDir
    // 检查相对路径是否已经以article/开头，避免重复添加
    let finalPath = relativePath
    
    // 先移除开头的斜杠（如果有）
    finalPath = finalPath.startsWith('/') ? finalPath.substring(1) : finalPath
    
    if (finalPath === '') {
      // 空路径直接返回article
      finalPath = 'article'
    } else if (finalPath.startsWith('article/')) {
      // 已经以article/开头，保持不变
      finalPath = finalPath
    } else if (finalPath === 'article') {
      // 就是article本身，保持不变
      finalPath = finalPath
    } else {
      // 其他情况，添加article/前缀
      finalPath = `article/${finalPath}`
    }
    return { 
      path: finalPath, 
      baseDir: BaseDirectory.AppData 
    }
  }
}

/**
 * 获取通用文件路径选项
 * 不限于article目录，可处理任意AppData下的路径
 * @param path 原始路径，可能包含或不包含目录前缀
 * @param prefix 可选的目录前缀，如'article'、'image'等
 * @returns 包含文件路径和baseDir的选项
 */
export async function getGenericPathOptions(path: string, prefix?: string): Promise<{ path: string, baseDir?: BaseDirectory }> {
  const workspace = await getWorkspacePath()
  
  if (workspace.isCustom) {
    // 对于自定义工作区，返回基于自定义工作区的绝对路径
    let fullPath = workspace.path
    
    // 如果指定了prefix，且path不以prefix开头，则添加prefix
    if (prefix && !path.startsWith(`${prefix}/`) && !path.startsWith(prefix)) {
      fullPath = await join(fullPath, prefix || '', path)
    } else {
      fullPath = await join(fullPath, path)
    }
    
    return { path: fullPath }
  } else {
    // 对于默认工作区，使用AppData作为baseDir
    // 先移除开头的斜杠（如果有）
    let finalPath = path.startsWith('/') ? path.substring(1) : path
    
    // 如果指定了prefix，确保路径正确
    if (prefix) {
      if (finalPath === '') {
        // 空路径直接返回prefix
        return {
          path: prefix,
          baseDir: BaseDirectory.AppData
        }
      } else if (finalPath.startsWith(`${prefix}/`)) {
        // 已经以prefix/开头，保持不变
        return {
          path: finalPath,
          baseDir: BaseDirectory.AppData
        }
      } else if (finalPath === prefix) {
        // 就是prefix本身，保持不变
        return {
          path: finalPath,
          baseDir: BaseDirectory.AppData
        }
      } else {
        // 其他情况，添加prefix/前缀
        return {
          path: `${prefix}/${finalPath}`,
          baseDir: BaseDirectory.AppData
        }
      }
    }
    
    return { 
      path: finalPath, 
      baseDir: BaseDirectory.AppData 
    }
  }
}

/**
 * 将任何路径转换为相对于工作区的路径
 * @param path 原始路径
 * @returns 相对于工作区的路径
 */
export async function toWorkspaceRelativePath(path: string): Promise<string> {
  const workspace = await getWorkspacePath()
  
  // 先移除开头的斜杠（如果有）
  let normalizedPath = path.startsWith('/') ? path.substring(1) : path
  
  // 如果是默认工作区，移除"article/"前缀
  if (!workspace.isCustom) {
    // 使用正确的正则表达式处理路径分隔符
    const defaultDirRegex = /^article\//
    if (defaultDirRegex.test(normalizedPath)) {
      // 移除article/前缀
      return normalizedPath.replace(defaultDirRegex, '')
    }
  }
  
  // 如果是自定义工作区，移除工作区路径前缀
  if (workspace.isCustom && normalizedPath.startsWith(workspace.path)) {
    // 确保路径分隔符处理正确
    const relativePath = normalizedPath.substring(workspace.path.length)
    // 移除开头的斜杠（如果有）
    return relativePath.startsWith('/') || relativePath.startsWith('\\') ? relativePath.substring(1) : relativePath
  }
  
  // 如果路径已经是相对路径，直接返回
  return normalizedPath
}
