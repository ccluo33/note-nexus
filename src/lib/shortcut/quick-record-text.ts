import emitter from '@/lib/emitter';

export default function initQuickRecordText() {
    emitter.on('quickRecordText', async () => {
        // 浏览器环境中直接触发快速记录文本处理事件
        emitter.emit('quickRecordTextHandler');
    });
}
