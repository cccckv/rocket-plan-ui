"use client";

import * as React from "react";
import { VideoHistoryItem } from "@/lib/api/video-history";
import { Download, Eye, RotateCcw, Clock, CheckCircle2, XCircle, Loader2, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoHistoryCardProps {
  item: VideoHistoryItem;
  onPreview: (item: VideoHistoryItem) => void;
  onDownload: (item: VideoHistoryItem) => void;
  onReusePrompt: (item: VideoHistoryItem) => void;
  onDelete: (item: VideoHistoryItem) => void;
}

export function VideoHistoryCard({
  item,
  onPreview,
  onDownload,
  onReusePrompt,
  onDelete,
}: VideoHistoryCardProps) {
  const getStatusBadge = () => {
    switch (item.status) {
      case 'generating':
        return (
          <div className="flex items-center gap-1.5 text-xs text-blue-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>生成中</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-1.5 text-xs text-green-500">
            <CheckCircle2 className="w-3 h-3" />
            <span>成功</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1.5 text-xs text-red-500">
            <XCircle className="w-3 h-3" />
            <span>失败</span>
          </div>
        );
    }
  };

  const timeAgo = React.useMemo(() => {
    try {
      const date = new Date(item.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return '刚刚';
      if (diffMins < 60) return `${diffMins}分钟前`;
      if (diffHours < 24) return `${diffHours}小时前`;
      if (diffDays < 7) return `${diffDays}天前`;
      return date.toLocaleDateString('zh-CN');
    } catch {
      return item.createdAt;
    }
  }, [item.createdAt]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all">
      <div 
        className="relative aspect-video bg-muted cursor-pointer" style={{ aspectRatio: '3/4' }}
        onClick={() => item.status === 'success' && item.videoUrl && onPreview(item)}
      >
        {item.status === 'success' && item.videoUrl ? (
          <>
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.prompt}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={item.videoUrl}
                muted
                preload="metadata"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Play className="w-12 h-12 text-white" />
            </div>
            {item.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                {formatDuration(item.duration)}
              </div>
            )}
          </>
        ) : item.status === 'generating' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          {getStatusBadge()}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>

        <p className="text-sm line-clamp-2 min-h-[2.5rem]" title={item.prompt}>
          {item.prompt}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-hidden">
          <span className="px-2 py-0.5 bg-muted rounded truncate max-w-[120px]" title={item.model}>{item.model}</span>
          <span className="px-2 py-0.5 bg-muted rounded shrink-0">{item.type}</span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {item.status === 'success' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onDownload(item)}
            >
              <Download className="w-3 h-3 mr-1" />
              下载
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onReusePrompt(item)}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            再次生成
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
