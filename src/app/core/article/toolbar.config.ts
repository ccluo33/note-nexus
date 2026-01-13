import { isMobileDevice } from '@/lib/check'
import emitter from '@/lib/emitter'

export const createToolbarConfig = (t: any, editorWidth?: number) => {
  // 定义工具栏分组
  const group1 = [
    { name: 'undo', tipPosition: 's' },
    { name: 'redo', tipPosition: 's' },
  ]

  const markTool = {
    name: 'mark',
    tipPosition: 's',
    tip: t('toolbar.mark.tooltip'),
    className: 'right',
    icon: '<svg><use xlink:href="#vditor-icon-mark"></svg>',
    click: () => emitter.emit('toolbar-mark'),
  }

  const group2Mobile = [
    markTool,
    {
      name: 'continue',
      tipPosition: 's',
      tip: t('toolbar.continue.tooltip'),
      className: 'right',
      icon: '<svg><use xlink:href="#vditor-icon-list-plus"></svg>',
      click: () => emitter.emit('toolbar-continue'),
    },
    {
      name: 'translation',
      tipPosition: 's',
      tip: t('toolbar.translation.tooltip'),
      className: 'right',
      icon: '<svg><use xlink:href="#vditor-icon-translation"></svg>',
      click: () => emitter.emit('toolbar-translation'),
    },
  ]

  const group2PC = [
    {
      name: 'continue',
      tipPosition: 's',
      tip: t('toolbar.continue.tooltip'),
      className: 'right',
      icon: '<svg><use xlink:href="#vditor-icon-list-plus"></svg>',
      click: () => emitter.emit('toolbar-continue'),
    },
    {
      name: 'translation',
      tipPosition: 's',
      tip: t('toolbar.translation.tooltip'),
      className: 'right',
      icon: '<svg><use xlink:href="#vditor-icon-translation"></svg>',
      click: () => emitter.emit('toolbar-translation'),
    },
  ]

  const group3 = [
    { name: 'headings', tipPosition: 's', className: 'bottom' },
    { name: 'bold', tipPosition: 's' },
    { name: 'italic', tipPosition: 's' },
    { name: 'strike', tipPosition: 's' },
  ]

  const group4 = [
    { name: 'line', tipPosition: 's' },
    { name: 'quote', tipPosition: 's' },
    { name: 'list', tipPosition: 's' },
    { name: 'ordered-list', tipPosition: 's' },
    { name: 'check', tipPosition: 's' },
    { name: 'code', tipPosition: 's' },
    { name: 'inline-code', tipPosition: 's' },
    { name: 'upload', tipPosition: 's', tip: t('toolbar.upload.tooltip') },
    { name: 'link', tipPosition: 's' },
    { name: 'table', tipPosition: 's' },
  ]

  const groupLast = [
    { name: 'edit-mode', tipPosition: 's', className: 'bottom edit-mode-button' },
    { name: 'preview', tipPosition: 's' },
    { name: 'outline', tipPosition: 's' },
  ]

  // 根据编辑器宽度决定显示哪些组
  // 按钮宽度: 36px, 分割线宽度: 19px
  const BUTTON_WIDTH = 36
  const DIVIDER_WIDTH = 19
  
  // 计算每组的宽度
  const group1Width = group1.length * BUTTON_WIDTH // 2 * 36 = 72
  const group2PCWidth = group2PC.length * BUTTON_WIDTH // 2 * 36 = 72
  const group3Width = group3.length * BUTTON_WIDTH // 4 * 36 = 144
  const group4Width = group4.length * BUTTON_WIDTH // 10 * 36 = 360
  const groupLastWidth = groupLast.length * BUTTON_WIDTH // 3 * 36 = 108
  
  // 计算累计宽度阈值（包含分割线）
  const baseWidth = group1Width + DIVIDER_WIDTH + group2PCWidth // 72 + 19 + 72 = 163
  const withLinkTableUploadWidth = baseWidth + DIVIDER_WIDTH + 3 * BUTTON_WIDTH // 163 + 19 + 108 = 290 (link, table, upload)
  const withLastWidth = withLinkTableUploadWidth + DIVIDER_WIDTH + groupLastWidth // 290 + 19 + 108 = 417
  const withGroup3Width = withLinkTableUploadWidth + DIVIDER_WIDTH + group3Width + DIVIDER_WIDTH + groupLastWidth // 290 + 19 + 144 + 19 + 108 = 580
  const withGroup4Width = withLinkTableUploadWidth + DIVIDER_WIDTH + group3Width + DIVIDER_WIDTH + group4Width + DIVIDER_WIDTH + groupLastWidth // 290 + 19 + 144 + 19 + 360 + 19 + 108 = 959
  
  let config: any[] = []
  
  if (isMobileDevice()) {
    config = [...group1, '|', ...group2Mobile, '|', ...groupLast]
  } else if (editorWidth) {
    // 基础组：始终显示 group1 + group2PC
    config = [...group1, '|', ...group2PC]
    
    // 根据宽度逐步添加更多组
    if (editorWidth >= withLinkTableUploadWidth) {
      // 添加常用的 link、table、upload 按钮
      config.push('|', { name: 'link', tipPosition: 's' }, { name: 'table', tipPosition: 's' }, { name: 'upload', tipPosition: 's', tip: t('toolbar.upload.tooltip') })
    }
    
    if (editorWidth >= withLastWidth) {
      config.push('|', ...groupLast)
    }
    
    if (editorWidth >= withGroup3Width) {
      // 在 link/table/upload 组和最后一组之间插入 group3
      const lastGroupIndex = config.length - groupLast.length - 1
      config.splice(lastGroupIndex, 0, '|', ...group3)
    }
    
    if (editorWidth >= withGroup4Width) {
      // 在 group3 和最后一组之间插入剩余的 group4 按钮
      const lastGroupIndex = config.length - groupLast.length - 1
      // 从 group4 中移除已经显示的 link、table、upload 按钮
      const remainingGroup4 = group4.filter(btn => !['link', 'table', 'upload'].includes(btn.name))
      config.splice(lastGroupIndex, 0, '|', ...remainingGroup4)
    }
    
    // 如果宽度不足以显示最后一组，也要保证它显示
    if (editorWidth < withLastWidth) {
      config.push('|', ...groupLast)
    }
  } else {
    // 默认显示所有
    config = [
      ...group1,
      '|',
      ...group2PC,
      '|',
      ...group3,
      '|',
      ...group4,
      '|',
      ...groupLast,
    ]
  }

  return config
}