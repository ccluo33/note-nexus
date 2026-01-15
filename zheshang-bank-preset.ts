// 浙商银行能量红主题配色方案（基于theme-presets.tsx结构）
import { ColorScheme } from '@/types/theme'

// 浙商银行能量红主题预设
export const zheshangBankPreset: ColorScheme = {
  name: '浙商银行',
  mode: 'light',
  colors: {
    background: '#FFFFFF',              // 纯白背景
    foreground: '#000000',              // 纯黑前景
    card: '#FFFFFF',                    // 卡片背景
    cardForeground: '#000000',          // 卡片前景
    primary: '#E60012',                 // 浙商银行能量红（主色）
    primaryForeground: '#FFFFFF',        // 主色文字
    secondary: '#FFF5F5',               // 浅红色背景（主色变体）
    secondaryForeground: '#E60012',      // 浅红色文字
    third: '#FFCCCC',                   // 淡红色背景（主色变体）
    thirdForeground: '#CC0000',          // 淡红色文字
    muted: '#F7F7F7',                   // 浅灰色背景
    mutedForeground: '#737373',          // 灰色文字
    accent: '#003366',                  // 深蓝色强调色（与主色互补）
    accentForeground: '#FFFFFF',         // 强调色文字
    border: '#FFCCCC',                  // 淡红色边框
    shadow: '#E60012'                   // 主色阴影
  }
}

// 深色模式版本（可选）
export const zheshangBankDarkPreset: ColorScheme = {
  name: '浙商银行（深色）',
  mode: 'dark',
  colors: {
    background: '#1A1A1A',              // 深灰背景
    foreground: '#FFFFFF',              // 白色前景
    card: '#262626',                    // 卡片背景
    cardForeground: '#FFFFFF',          // 卡片前景
    primary: '#E60012',                 // 浙商银行能量红（主色）
    primaryForeground: '#FFFFFF',        // 主色文字
    secondary: '#331A1A',               // 深红色背景（主色变体）
    secondaryForeground: '#FF6666',      // 深红色文字
    third: '#4D1F1F',                   // 暗红色背景（主色变体）
    thirdForeground: '#FF9999',          // 暗红色文字
    muted: '#2D2D2D',                   // 中灰色背景
    mutedForeground: '#B0B0B0',          // 灰色文字
    accent: '#336699',                  // 蓝色强调色（与主色互补）
    accentForeground: '#FFFFFF',         // 强调色文字
    border: '#4D1F1F',                  // 暗红色边框
    shadow: '#000000'                   // 黑色阴影
  }
}