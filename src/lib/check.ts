import { platform } from "@/lib/browser-adapter/app";

// 检测是否在 Tauri 环境中
export function isTauriEnvironment() {
  return typeof window !== 'undefined' && 
         (window as any).__TAURI__ !== undefined &&
         (window as any).__TAURI_INTERNALS__ !== undefined;
}

// 异步检查是否为移动设备的函数
export function isMobileDevice() {
  try {
    const platformName = platform();
    return platformName === 'android' || platformName === 'ios';
  } catch (error) {
    console.error('Error detecting platform:', error);
    return false;
  }
}
