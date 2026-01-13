import { TooltipButton } from "@/components/tooltip-button"
import { ImagePlus } from "lucide-react"
import { useTranslations } from 'next-intl'
import { open } from "@/lib/browser-adapter/dialog";
import useTagStore from "@/stores/tag";
import useMarkStore from "@/stores/mark";
import { insertMark } from "@/db/marks";

// 图片扩展名
const imageExtensions = ['png', 'jpeg', 'jpg', 'gif', 'webp','svg', 'bmp', 'ico'];

export function ControlFile() {
  const t = useTranslations();
  const { currentTagId, fetchTags, getCurrentTag } = useTagStore()
  const { fetchMarks } = useMarkStore()

  async function selectImages() {
    const filePaths = await open({
      multiple: true,
      directory: false,
      filters: [{
        name: 'Image',
        extensions: imageExtensions
      }]
    });
    if (!filePaths) return
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths]
    for (const path of paths) {
      await uploadImage(path)
    }
  }

  async function uploadImage(path: string) {
    const ext = path.substring(path.lastIndexOf('.') + 1)
    if (imageExtensions.includes(ext)) {
      // 提取文件名（不含路径）
      const fileName = path.split('/').pop() || path.split('\\').pop() || path
      // 构建描述：文件名
      const desc = fileName
      // 将完整路径存储在 url 字段，用于点击时打开文件夹
      await insertMark({ 
        tagId: currentTagId, 
        type: 'image', 
        desc: desc,
        url: path 
      })
      await fetchMarks()
      await fetchTags()
      getCurrentTag()
    }
  }

  return (
    <TooltipButton icon={<ImagePlus />} tooltipText={t('record.mark.type.image')} onClick={selectImages} />
  )
}