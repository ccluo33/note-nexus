'use client'

import React, { useState, Suspense } from 'react'
import { SettingTab } from "./components/setting-tab"

// 导入所有设置页面组件
const GeneralSettingsPage = React.lazy(() => import('./general/page'))
const AiPage = React.lazy(() => import('./ai/page'))
const SyncPage = React.lazy(() => import('./sync/page'))
const ImageHostingPage = React.lazy(() => import('./imageHosting/page'))
const ImageMethodPage = React.lazy(() => import('./imageMethod/page'))
const TemplatePage = React.lazy(() => import('./template/page'))
const ReadAloudPage = React.lazy(() => import('./readAloud/page'))
const RagPage = React.lazy(() => import('./rag/page'))
const PromptPage = React.lazy(() => import('./prompt/page'))
const McpPage = React.lazy(() => import('./mcp/page'))
const FilePage = React.lazy(() => import('./file/page'))
const EditorPage = React.lazy(() => import('./editor/page'))
const DevPage = React.lazy(() => import('./dev/page'))
const DefaultModelPage = React.lazy(() => import('./defaultModel/page'))
const BackupSyncPage = React.lazy(() => import('./backupSync/page'))
const AudioPage = React.lazy(() => import('./audio/page'))

export default function SettingLayout() {
  const [activeTab, setActiveTab] = useState('general')

  // 处理标签切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div id="setting-page" className="flex h-full">
      <SettingTab onTabChange={handleTabChange} activeTab={activeTab} />
      <div className="flex-1 p-8 overflow-y-auto h-full">
        <Suspense fallback={<div className="flex items-center justify-center h-full">加载中...</div>}>
          {/* 根据 activeTab 条件渲染不同的设置页面 */}
          {activeTab === 'general' && <GeneralSettingsPage />}
          {activeTab === 'ai' && <AiPage />}
          {activeTab === 'sync' && <SyncPage />}
          {activeTab === 'imageHosting' && <ImageHostingPage />}
          {activeTab === 'imageMethod' && <ImageMethodPage />}
          {activeTab === 'template' && <TemplatePage />}
          {activeTab === 'readAloud' && <ReadAloudPage />}
          {activeTab === 'rag' && <RagPage />}
          {activeTab === 'prompt' && <PromptPage />}
          {activeTab === 'mcp' && <McpPage />}
          {activeTab === 'file' && <FilePage />}
          {activeTab === 'editor' && <EditorPage />}
          {activeTab === 'dev' && <DevPage />}
          {activeTab === 'defaultModel' && <DefaultModelPage />}
          {activeTab === 'backupSync' && <BackupSyncPage />}
          {activeTab === 'audio' && <AudioPage />}
        </Suspense>
      </div>
    </div>
  )
}
