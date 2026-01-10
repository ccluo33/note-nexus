/**
 * 浏览器窗口适配层，替代 Tauri Window API
 */

export interface WindowOptions {
  title?: string;
  width?: number;
  height?: number;
  resizable?: boolean;
  decorations?: boolean;
  transparent?: boolean;
  alwaysOnTop?: boolean;
}

export interface Monitor {
  name: string;
  scaleFactor: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

class BrowserWindow {
  async minimize(): Promise<void> {
    // 浏览器环境不支持最小化
    console.warn('Window minimize is not supported in browser mode');
  }

  async maximize(): Promise<void> {
    // 浏览器环境不支持最大化
    console.warn('Window maximize is not supported in browser mode');
  }

  async toggleMaximize(): Promise<void> {
    // 浏览器环境不支持切换最大化
    console.warn('Window toggleMaximize is not supported in browser mode');
  }

  async close(): Promise<void> {
    // 浏览器环境不支持关闭窗口
    console.warn('Window close is not supported in browser mode');
  }

  async hide(): Promise<void> {
    // 浏览器环境不支持隐藏窗口
    console.warn('Window hide is not supported in browser mode');
  }

  async show(): Promise<void> {
    // 浏览器环境不支持显示窗口
    console.warn('Window show is not supported in browser mode');
  }

  async setFocus(): Promise<void> {
    // 浏览器环境不支持设置焦点
    console.warn('Window setFocus is not supported in browser mode');
  }

  async setTitle(title: string): Promise<void> {
    // 在浏览器中设置文档标题
    if (typeof document !== 'undefined') {
      document.title = title;
    }
  }

  async setResizable(): Promise<void> {
    // 浏览器环境不支持设置可调整大小
    console.warn('Window setResizable is not supported in browser mode');
  }

  async setSize(): Promise<void> {
    // 浏览器环境不支持设置窗口大小
    console.warn('Window setSize is not supported in browser mode');
  }

  async setPosition(): Promise<void> {
    // 浏览器环境不支持设置窗口位置
    console.warn('Window setPosition is not supported in browser mode');
  }

  async setDecorations(): Promise<void> {
    // 浏览器环境不支持设置装饰
    console.warn('Window setDecorations is not supported in browser mode');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setAlwaysOnTop(_alwaysOnTop: boolean): Promise<void> {
    // 浏览器环境不支持设置始终置顶
    console.warn('Window setAlwaysOnTop is not supported in browser mode');
  }

  async setFullscreen(fullscreen: boolean): Promise<void> {
    // 在浏览器中可以使用全屏 API
    if (typeof document !== 'undefined' && document.documentElement) {
      if (fullscreen) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  }

  async setIcon(): Promise<void> {
    // 浏览器环境不支持设置图标
    console.warn('Window setIcon is not supported in browser mode');
  }

  async center(): Promise<void> {
    // 浏览器环境不支持居中窗口
    console.warn('Window center is not supported in browser mode');
  }

  async requestUserAttention(): Promise<void> {
    // 浏览器环境不支持请求用户注意
    console.warn('Window requestUserAttention is not supported in browser mode');
  }

  async setSizeConstraints(): Promise<void> {
    // 浏览器环境不支持设置大小约束
    console.warn('Window setSizeConstraints is not supported in browser mode');
  }

  async onResized(callback: (size: Size) => void): Promise<() => void> {
    // 在浏览器中监听窗口大小变化
    if (typeof window !== 'undefined') {
      const handler = () => {
        callback({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }
    return () => {};
  }

  async onMoved(): Promise<() => void> {
    // 浏览器环境不支持监听窗口移动
    console.warn('Window onMoved is not supported in browser mode');
    return () => {};
  }

  async onFocused(callback: (focused: boolean) => void): Promise<() => void> {
    // 在浏览器中监听焦点变化
    if (typeof window !== 'undefined') {
      const handler = () => {
        callback(document.hasFocus());
      };
      window.addEventListener('focus', handler);
      window.addEventListener('blur', handler);
      return () => {
        window.removeEventListener('focus', handler);
        window.removeEventListener('blur', handler);
      };
    }
    return () => {};
  }

  async onCloseRequested(callback: () => void): Promise<() => void> {
    // 在浏览器中监听页面关闭
    if (typeof window !== 'undefined') {
      const handler = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        callback();
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
    return () => {};
  }

  async scaleFactor(): Promise<number> {
    // 在浏览器中获取设备像素比
    if (typeof window !== 'undefined') {
      return window.devicePixelRatio || 1;
    }
    return 1;
  }

  async innerPosition(): Promise<Position> {
    // 浏览器环境不支持获取窗口位置
    console.warn('Window innerPosition is not supported in browser mode');
    return { x: 0, y: 0 };
  }

  async outerPosition(): Promise<Position> {
    // 浏览器环境不支持获取窗口位置
    console.warn('Window outerPosition is not supported in browser mode');
    return { x: 0, y: 0 };
  }

  async innerSize(): Promise<Size> {
    // 在浏览器中获取窗口内部大小
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 0, height: 0 };
  }

  async outerSize(): Promise<Size> {
    // 在浏览器中获取窗口外部大小
    if (typeof window !== 'undefined') {
      return {
        width: window.outerWidth,
        height: window.outerHeight,
      };
    }
    return { width: 0, height: 0 };
  }

  async isMaximized(): Promise<boolean> {
    // 浏览器环境不支持检查是否最大化
    return false;
  }

  async isMinimized(): Promise<boolean> {
    // 浏览器环境不支持检查是否最小化
    return false;
  }

  async isDecorated(): Promise<boolean> {
    // 浏览器环境不支持检查是否有装饰
    return false;
  }

  async isResizable(): Promise<boolean> {
    // 浏览器环境不支持检查是否可调整大小
    return true;
  }

  async isFullscreen(): Promise<boolean> {
    // 在浏览器中检查是否全屏
    if (typeof document !== 'undefined') {
      return !!document.fullscreenElement;
    }
    return false;
  }

  async isVisible(): Promise<boolean> {
    // 浏览器环境不支持检查是否可见
    return true;
  }

  async isFocused(): Promise<boolean> {
    // 在浏览器中检查是否有焦点
    if (typeof document !== 'undefined') {
      return document.hasFocus();
    }
    return false;
  }
}

let currentWindowInstance: BrowserWindow | null = null;

export function getCurrentWindow(): BrowserWindow {
  if (!currentWindowInstance) {
    currentWindowInstance = new BrowserWindow();
  }
  return currentWindowInstance;
}

export async function getAllWindows(): Promise<BrowserWindow[]> {
  // 浏览器环境只支持一个窗口
  return [getCurrentWindow()];
}

export async function availableMonitors(): Promise<Monitor[]> {
  // 浏览器环境不支持获取显示器信息
  if (typeof window !== 'undefined' && typeof screen !== 'undefined') {
    return [{
      name: 'Primary Monitor',
      scaleFactor: window.devicePixelRatio || 1,
      position: { x: 0, y: 0 },
      size: {
        width: screen.width,
        height: screen.height,
      },
    }];
  }
  return [];
}

export async function currentMonitor(): Promise<Monitor | null> {
  const monitors = await availableMonitors();
  return monitors[0] || null;
}

export async function primaryMonitor(): Promise<Monitor | null> {
  const monitors = await availableMonitors();
  return monitors[0] || null;
}
