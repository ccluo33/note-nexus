"use client";

import { useTranslations } from 'next-intl'
import baseConfig from '../config'
import useSettingStore from "@/stores/setting"
import { Separator } from "@/components/ui/separator";

export function SettingTab({ onTabChange, activeTab }: { onTabChange: (tab: string) => void, activeTab: string }) {
  const t = useTranslations('settings')
  const { setLastSettingPage } = useSettingStore()
  
  // Add translations to the config
  const config = baseConfig.map(item => {
    if (typeof item === 'string') return item
    return {
      ...item,
      title: t(`${item.anchor}.title`)
    }
  })

  function handleNavigation(anchor: string) {
    onTabChange(anchor)
    // 记录最后访问的设置页面
    setLastSettingPage(anchor)
  }

  return (
    <div className="flex flex-col w-56 justify-between h-full bg-sidebar border-r">
      <ul className="w-full p-4 flex flex-col justify-between flex-1 overflow-y-auto">
        {
          config.map((item, index) => {
            if (typeof item === 'string') return (
              <Separator key={index} className="my-2" />
            )
            return (
              <li
                key={item.anchor}
                className={activeTab === item.anchor ? '!bg-zinc-800 text-white setting-anchor' : 'setting-anchor'}
                onClick={() => handleNavigation(item.anchor)}
              >
                {item.icon}
                <span>{item.title}</span>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}