'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import useImageStore from '@/stores/imageHosting';
import { SyncStateEnum } from '@/lib/sync/github.types';
import { testFastDFSConnection } from '@/lib/imageHosting/fastdfs';
import { Store } from "@/lib/browser-adapter/store";

interface FastDFSConfig {
  trackerServer: string;
  port: number;
  httpUrl: string;
  groupName?: string;
  storagePath?: string;
}

export function FastDFSImageHosting() {
  const t = useTranslations();
  const { setFastDFSConfig, fastDFSState, setFastDFSState, mainImageHosting, setMainImageHosting } = useImageStore();
  
  const [config, setConfig] = useState<FastDFSConfig>({
    trackerServer: '',
    port: 22122,
    httpUrl: '',
    groupName: 'group1',
    storagePath: ''
  });

  // 初始化配置
  useEffect(() => {
    const initConfig = async () => {
      const store = await Store.load('store.json');
      const savedConfig = await store.get<FastDFSConfig>('fastDFSConfig');
      if (savedConfig) {
        setConfig(savedConfig);
        // 如果配置完整，自动进行连接检测
        if (savedConfig.trackerServer && savedConfig.httpUrl) {
          setFastDFSState(SyncStateEnum.checking);
          try {
            const isConnected = await testFastDFSConnection(savedConfig);
            if (isConnected) {
              setFastDFSState(SyncStateEnum.success);
            } else {
              setFastDFSState(SyncStateEnum.fail);
            }
          } catch (error) {
            setFastDFSState(SyncStateEnum.fail);
            console.error('FastDFS connection test failed:', error);
          }
        }
      }
    };
    initConfig();
  }, [setFastDFSConfig]);

  // 自动保存和测试配置
  const handleConfigChange = async (newConfig: FastDFSConfig) => {
    setConfig(newConfig);
    
    // 自动保存配置
    try {
      await setFastDFSConfig(newConfig);
    } catch (error) {
      console.error('Failed to save FastDFS config:', error);
    }
    
    // 如果必填字段都已填写，自动测试连接
    if (newConfig.trackerServer && newConfig.httpUrl) {
      setFastDFSState(SyncStateEnum.checking);

      try {
        const isConnected = await testFastDFSConnection(newConfig);
        if (isConnected) {
          setFastDFSState(SyncStateEnum.success);
        } else {
          setFastDFSState(SyncStateEnum.fail);
        }
      } catch (error) {
        setFastDFSState(SyncStateEnum.fail);
        console.error('FastDFS connection test failed:', error);
      }
    } else {
      setFastDFSState(SyncStateEnum.fail);
    }
  };

  // 设为主要图床
  const handleSetAsPrimary = async () => {
    if (fastDFSState !== SyncStateEnum.success) {
      toast({
        title: '连接错误',
        description: '请先测试连接成功后再设置为主要图床',
        variant: 'destructive',
      });
      return;
    }

    await setMainImageHosting('fastdfs');
    toast({
      title: '设置成功',
      description: '已将FastDFS设为主要图床',
    });
  };

  const getStatusIcon = () => {
    switch (fastDFSState) {
      case SyncStateEnum.success:
        return <CheckCircle className="size-4 text-green-500" />;
      case SyncStateEnum.checking:
        return <Loader2 className="size-4 animate-spin text-blue-500" />;
      case SyncStateEnum.fail:
      default:
        return <XCircle className="size-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (fastDFSState) {
      case SyncStateEnum.success:
        return '已连接';
      case SyncStateEnum.checking:
        return '连接中...';
      case SyncStateEnum.fail:
      default:
        return '未连接';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>FastDFS</CardTitle>
            <CardDescription>
              配置FastDFS图片存储服务
            </CardDescription>
          </div>
          <Button 
            onClick={handleSetAsPrimary}
            disabled={mainImageHosting === 'fastdfs' || fastDFSState !== SyncStateEnum.success}
            size="sm"
          >
            {mainImageHosting === 'fastdfs' ? 
              '当前主要图床' : 
              '设为主要图床'
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 状态显示 */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">连接状态</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{getStatusText()}</span>
          </div>
        </div>

        {/* 基本配置 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trackerServer">Tracker服务器地址</Label>
            <Input
              id="trackerServer"
              type="text"
              value={config.trackerServer}
              onChange={(e) => handleConfigChange({ ...config, trackerServer: e.target.value })}
              placeholder="192.168.1.100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Tracker端口</Label>
            <Input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) => handleConfigChange({ ...config, port: parseInt(e.target.value) || 22122 })}
              placeholder="22122"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="httpUrl">HTTP访问地址</Label>
            <Input
              id="httpUrl"
              type="text"
              value={config.httpUrl}
              onChange={(e) => handleConfigChange({ ...config, httpUrl: e.target.value })}
              placeholder="http://192.168.1.100:8888"
            />
          </div>
        </div>

        {/* 高级配置 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">存储组名</Label>
            <Input
              id="groupName"
              type="text"
              value={config.groupName || ''}
              onChange={(e) => handleConfigChange({ ...config, groupName: e.target.value })}
              placeholder="group1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storagePath">存储路径前缀</Label>
            <Input
              id="storagePath"
              type="text"
              value={config.storagePath || ''}
              onChange={(e) => handleConfigChange({ ...config, storagePath: e.target.value })}
              placeholder="M00/"
            />
            <p className="text-xs text-muted-foreground">
              图片存储在FastDFS中的路径前缀，通常为M00/
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}