/**
 * 浏览器应用适配层，替代 Tauri App API
 */

export async function getVersion(): Promise<string> {
  // 从 package.json 或环境变量获取版本
  return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
}

export async function getName(): Promise<string> {
  return 'note-gen';
}

export async function getTauriVersion(): Promise<string | null> {
  return null; // 网页版没有 Tauri 版本
}

export function platform(): string {
  // 检测用户代理字符串来判断平台
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('android')) {
    return 'android';
  } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    return 'ios';
  } else if (userAgent.includes('mac')) {
    return 'macos';
  } else if (userAgent.includes('win')) {
    return 'windows';
  } else if (userAgent.includes('linux')) {
    return 'linux';
  }
  
  return 'unknown';
}

export async function arch(): Promise<string> {
  // 检测架构
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('x86_64') || userAgent.includes('x64') || userAgent.includes('Win64') || userAgent.includes('WOW64')) {
    return 'x86_64';
  } else if (userAgent.includes('i686') || userAgent.includes('i386')) {
    return 'x86';
  } else if (userAgent.includes('arm64') || userAgent.includes('aarch64')) {
    return 'aarch64';
  } else if (userAgent.includes('arm')) {
    return 'arm';
  }
  
  return 'unknown';
}

