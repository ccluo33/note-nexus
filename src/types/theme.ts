/**
 * HSL颜色值类型，包含色相（0-360）、饱和度（0-100）和亮度（0-100）
 */
export type HSLValue = [number, number, number]

/**
 * 自定义主题颜色类型，包含亮色和暗色主题的颜色配置
 */
export interface CustomThemeColors {
  light: {
    background: string | null
    foreground: string | null
    card: string | null
    cardForeground: string | null
    primary: string | null
    primaryForeground: string | null
    secondary: string | null
    secondaryForeground: string | null
    third: string | null
    thirdForeground: string | null
    muted: string | null
    mutedForeground: string | null
    accent: string | null
    accentForeground: string | null
    border: string | null
    shadow: string | null
  }
  dark: {
    background: string | null
    foreground: string | null
    card: string | null
    cardForeground: string | null
    primary: string | null
    primaryForeground: string | null
    secondary: string | null
    secondaryForeground: string | null
    third: string | null
    thirdForeground: string | null
    muted: string | null
    mutedForeground: string | null
    accent: string | null
    accentForeground: string | null
    border: string | null
    shadow: string | null
  }
}

/**
 * 主题方案类型，包含主题名称、模式、颜色配置等信息
 */
export interface ColorScheme {
  name: string
  mode?: 'light' | 'dark'
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    third: string
    thirdForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    border: string
    shadow: string
  }
  isReset?: boolean
}