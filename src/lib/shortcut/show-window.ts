import emitter from '@/lib/emitter';

export default function initShowWindow() {
    // 浏览器环境中不需要处理窗口显示，忽略此事件
    emitter.on('openWindow', async () => {
        console.log('openWindow event received in browser environment');
    });
}
