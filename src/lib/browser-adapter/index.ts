/**
 * 浏览器适配层统一导出
 * 用于替代 Tauri API
 */

// 检测是否在浏览器环境
export const isBrowser = typeof window !== 'undefined';

// 导出所有适配模块
export * from './storage';
export * from './fs';
export * from './path';
export * from './dialog';
export * from './core';
export * from './app';
export * from './http';
export * from './clipboard';
export * from './shortcut';
export * from './window';
export * from './event';

