'use client'

import { useState } from 'react'
import { Store } from '@/lib/browser-adapter/store'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item'
import { Palette, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import useSettingStore from '@/stores/setting'
import { HSLValue, ColorScheme } from '@/types/theme'
import { applyThemeColors } from '@/lib/theme-utils'
import { ThemeColorPicker } from '@/components/theme-color-picker'
import { ThemePresets } from '@/components/theme-presets'

export function CustomThemeSettings() {
  const t = useTranslations('settings.general.interface.customTheme')
  const { customThemeColors } = useSettingStore()
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'custom' | 'presets' | 'import-export'>('custom')
  const [importCode, setImportCode] = useState('')
  const [exportCode, setExportCode] = useState('')

  // 实时保存颜色变化
  const handleColorChange = async (colorKey: string, value: string | null) => {
    // 同时更新亮色和暗色主题的颜色
    const updatedColors = {
      light: {
        ...customThemeColors.light,
        [colorKey]: value,
      },
      dark: {
        ...customThemeColors.dark,
        [colorKey]: value,
      },
    }

    // 立即保存到 store
    const store = await Store.load('store.json')
    await store.set('customThemeColors', updatedColors)
    await store.save()

    // 更新 store 状态（触发 re-render）
    useSettingStore.setState({ customThemeColors: updatedColors })

    // 立即应用颜色
    applyThemeColors(updatedColors)
  }

  // 应用预设方案
  const applyPreset = async (preset: ColorScheme) => {
    const updatedColors = {
      light: {
        background: preset.colors.background,
        foreground: preset.colors.foreground,
        card: preset.colors.card,
        cardForeground: preset.colors.cardForeground,
        primary: preset.colors.primary,
        primaryForeground: preset.colors.primaryForeground,
        secondary: preset.colors.secondary,
        secondaryForeground: preset.colors.secondaryForeground,
        third: preset.colors.third,
        thirdForeground: preset.colors.thirdForeground,
        muted: preset.colors.muted,
        mutedForeground: preset.colors.mutedForeground,
        accent: preset.colors.accent,
        accentForeground: preset.colors.accentForeground,
        border: preset.colors.border,
        shadow: preset.colors.shadow,
      },
      dark: {
        background: preset.colors.background,
        foreground: preset.colors.foreground,
        card: preset.colors.card,
        cardForeground: preset.colors.cardForeground,
        primary: preset.colors.primary,
        primaryForeground: preset.colors.primaryForeground,
        secondary: preset.colors.secondary,
        secondaryForeground: preset.colors.secondaryForeground,
        third: preset.colors.third,
        thirdForeground: preset.colors.thirdForeground,
        muted: preset.colors.muted,
        mutedForeground: preset.colors.mutedForeground,
        accent: preset.colors.accent,
        accentForeground: preset.colors.accentForeground,
        border: preset.colors.border,
        shadow: preset.colors.shadow,
      },
    }

    const store = await Store.load('store.json')
    await store.set('customThemeColors', updatedColors)
    await store.save()
    useSettingStore.setState({ customThemeColors: updatedColors })
    applyThemeColors(updatedColors)

    // 同时设置系统主题模式
    if (preset.mode) {
      setTheme(preset.mode)
    }
  }

  // 重置为默认主题
  const handleResetDefault = async () => {
    await useSettingStore.getState().resetCustomThemeColors()
  }

  // 生成导出代码
  const handleExport = () => {
    const exportData = {
      name: 'Custom Theme',
      colors: {
        background: customThemeColors.light.background || '#FFFFFF',
        foreground: customThemeColors.light.foreground || '#000000',
        card: customThemeColors.light.card || '#FFFFFF',
        cardForeground: customThemeColors.light.cardForeground || '#000000',
        primary: customThemeColors.light.primary || '#000000',
        primaryForeground: customThemeColors.light.primaryForeground || '#FFFFFF',
        secondary: customThemeColors.light.secondary || '#FFFFFF',
        secondaryForeground: customThemeColors.light.secondaryForeground || '#000000',
        third: customThemeColors.light.third || '#F5F5F5',
        thirdForeground: customThemeColors.light.thirdForeground || '#1F2937',
        muted: customThemeColors.light.muted || '#FFFFFF',
        mutedForeground: customThemeColors.light.mutedForeground || '#6B7280',
        accent: customThemeColors.light.accent || '#FFFFFF',
        accentForeground: customThemeColors.light.accentForeground || '#000000',
        border: customThemeColors.light.border || '#E5E7EB',
        shadow: customThemeColors.light.shadow || '#000000',
      },
    }
    setExportCode(JSON.stringify(exportData, null, 2))
  }

  // 导入配色方案
  const handleImport = async () => {
    try {
      const importData = JSON.parse(importCode) as ColorScheme
      if (importData.colors) {
        await applyPreset(importData)
        setImportCode('')
        setActiveTab('custom')
      }
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  return (
    <>
      <Item variant="outline">
        <ItemMedia variant="icon"><Palette className="size-4" /></ItemMedia>
        <ItemContent>
          <ItemTitle>{t('title')}</ItemTitle>
          <ItemDescription>{t('desc')}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            {t('button')}
          </Button>
        </ItemActions>
      </Item>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('dialogTitle')}</DialogTitle>
            <DialogDescription>{t('dialogDesc')}</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'custom' | 'presets' | 'import-export')} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="custom">{t('tabs.custom')}</TabsTrigger>
              <TabsTrigger value="presets">{t('tabs.presets')}</TabsTrigger>
              <TabsTrigger value="import-export">{t('tabs.importExport')}</TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="mt-4">
              <ThemeColorPicker
                colors={customThemeColors?.light || {
                  background: null,
                  foreground: null,
                  card: null,
                  cardForeground: null,
                  primary: null,
                  primaryForeground: null,
                  secondary: null,
                  secondaryForeground: null,
                  third: null,
                  thirdForeground: null,
                  muted: null,
                  mutedForeground: null,
                  accent: null,
                  accentForeground: null,
                  border: null,
                  shadow: null,
                }}
                onColorChange={handleColorChange}
                t={t}
              />
            </TabsContent>

            <TabsContent value="presets" className="mt-4">
              <ThemePresets onApplyPreset={applyPreset} onResetDefault={handleResetDefault} t={t} />
            </TabsContent>

            <TabsContent value="import-export" className="mt-4 space-y-4">
              {/* 导出 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">{t('export.title')}</h3>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1" />
                    {t('export.button')}
                  </Button>
                </div>
                <Textarea
                  value={exportCode}
                  onChange={(e) => setExportCode(e.target.value)}
                  placeholder={t('export.placeholder')}
                  className="font-mono text-xs"
                  rows={8}
                  readOnly
                />
              </div>

              {/* 导入 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">{t('import.title')}</h3>
                  <Button variant="outline" size="sm" onClick={handleImport} disabled={!importCode.trim()}>
                    <Upload className="h-4 w-4 mr-1" />
                    {t('import.button')}
                  </Button>
                </div>
                <Textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder={t('import.placeholder')}
                  className="font-mono text-xs"
                  rows={8}
                />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}