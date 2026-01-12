import { createWorker } from 'tesseract.js';
import { readFile } from "@/lib/browser-adapter/fs";
import { Store } from "@/lib/browser-adapter/store";

export default async function ocr(path: string): Promise<string> {
  try {
    const stroe = await Store.load('store.json')
    const lang = await stroe.get<string>('tesseractList')
    const langArr = (lang as string)?.split(',') || ['eng']
    
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject('OCR 识别失败'), 30000)
    })

    const workerPromise = (async () => {
      // 读取图片文件
      const image = await readFile(path);
      // 将ArrayBuffer转换为Uint8Array后创建Blob
      const blob = new Blob([new Uint8Array(image)], { type: 'image/*' })
      const worker = await createWorker(langArr)
      const ret = (await worker.recognize(blob)).data.text;
      await worker.terminate();
      return ret
    })()

    return await Promise.race([workerPromise, timeoutPromise])
  } catch (error) {
    console.error('OCR error:', error);
    return 'OCR 识别失败: ' + (error instanceof Error ? error.message : String(error))
  }
}