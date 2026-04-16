"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { AlertCircle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, VisuallyHidden } from "@/components/ui/dialog";
import { VideoHistoryGrid } from "@/components/video-history-grid";
import { VideoInputBar } from "@/components/video-input-bar";
import { useI18n } from "@/lib/i18n/context";
import { getBalance, getCreditCosts, DEFAULT_CREDIT_COSTS } from "@/lib/api/credits";
import { getModelSpecs } from "@/lib/model-specs";
import { createVideoTask, pollTaskStatus, VideoTask } from "@/lib/api/videos";
import { getAvailableModels, isModelAvailableForTab } from "@/lib/model-categories";
import { useVideoHistory } from "@/hooks/use-video-history";
import { VideoHistoryItem, deleteVideoHistory } from "@/lib/api/video-history";

type TabType = "reference" | "frame";

interface VideoGeneratorFormWithHistoryProps {
  onCreditsChange?: () => void;
}

export function VideoGeneratorFormWithHistory({ onCreditsChange }: VideoGeneratorFormWithHistoryProps) {
  const { t } = useI18n();
  const router = useRouter();
  const history = useVideoHistory();
  
  const [activeTab, setActiveTab] = React.useState<TabType>("reference");
  const [prompt, setPrompt] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [firstFrame, setFirstFrame] = React.useState<File | null>(null);
  const [lastFrame, setLastFrame] = React.useState<File | null>(null);
  const [previewVideo, setPreviewVideo] = React.useState<VideoHistoryItem | null>(null);
  const [selectedModel, setSelectedModel] = React.useState("veo3.1-fast");
  const [creditCosts, setCreditCosts] = React.useState<Record<string, number>>(DEFAULT_CREDIT_COSTS);
  const [userCredits, setUserCredits] = React.useState(0);
  const [showInsufficientDialog, setShowInsufficientDialog] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationError, setGenerationError] = React.useState<string | null>(null);
  const [resolution, setResolution] = React.useState("720p");
  const [aspectRatio, setAspectRatio] = React.useState("9:16");
  const [duration, setDuration] = React.useState("8s");
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!isModelAvailableForTab(selectedModel, activeTab)) {
      const availableModels = getAvailableModels(activeTab);
      if (availableModels.length > 0) {
        setSelectedModel(availableModels[0]);
      }
    }
  }, [activeTab, selectedModel]);

  React.useEffect(() => {
    const checkLoginStatus = () => {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) 
        : null;
      setIsLoggedIn(!!token);
      if (token) {
        loadCreditData();
        history.loadInitial();
      }
    };
    
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const loadCreditData = async () => {
    try {
      const [costs, balance] = await Promise.all([
        getCreditCosts(),
        getBalance(),
      ]);
      const costsMap: Record<string, number> = {};
      costs.costs.forEach(c => {
        costsMap[c.model] = c.cost;
      });
      setCreditCosts({ ...DEFAULT_CREDIT_COSTS, ...costsMap });
      setUserCredits(balance.credits);
    } catch (error) {
      console.error('Failed to load credit data:', error);
      if ((error as any).response?.status === 401) {
        setIsLoggedIn(false);
        setUserCredits(0);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
      }
    }
  };

  const currentCost = creditCosts[selectedModel] || 3;
  const hasEnoughCredits = userCredits >= currentCost;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleFirstFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFirstFrame(e.target.files[0]);
    }
  };

  const handleLastFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLastFrame(e.target.files[0]);
    }
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFirstFrameRemove = () => {
    setFirstFrame(null);
  };

  const handleLastFrameRemove = () => {
    setLastFrame(null);
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
    };
    
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
      return file;
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) 
      : null;
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (!hasEnoughCredits) {
      setShowInsufficientDialog(true);
      return;
    }

    if (!prompt.trim()) {
      setGenerationError("Please enter a prompt");
      return;
    }

    if (activeTab === "reference" && selectedFiles.length > 3) {
      setGenerationError("Maximum 3 reference images allowed");
      return;
    }

    if (activeTab === "frame" && (!firstFrame || !lastFrame)) {
      setGenerationError("Both first frame and last frame are required");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const tempId = `temp-${Date.now()}`;
    history.prependOptimistic({
      id: tempId,
      prompt: prompt.trim(),
      model: selectedModel,
      type: activeTab === "reference" ? "image-to-video" : "image-to-video",
      status: 'generating',
      createdAt: new Date().toISOString(),
    });

    try {
      const durationInSeconds = parseInt(duration.replace('s', ''));
      
      const requestPayload: any = {
        model: selectedModel,
        prompt: prompt.trim(),
        duration: durationInSeconds,
        aspectRatio: aspectRatio,
        resolution: resolution.toUpperCase().replace('P', 'P'),
        enhancePrompt: true,
        generateAudio: true,
      };

      if (activeTab === "reference" && selectedFiles.length > 0) {
        requestPayload.type = 'image-to-video';
        
        if (selectedFiles.length === 1) {
          const compressed = await compressImage(selectedFiles[0]);
          requestPayload.imageBase64 = await fileToBase64(compressed);
        } else {
          const compressedFiles = await Promise.all(
            selectedFiles.slice(0, 3).map(file => compressImage(file))
          );
          const base64Images = await Promise.all(
            compressedFiles.map(file => fileToBase64(file))
          );
          requestPayload.referenceImagesBase64 = base64Images;
        }
      } else if (activeTab === "frame" && firstFrame && lastFrame) {
        requestPayload.type = 'image-to-video';
        const compressedFirst = await compressImage(firstFrame);
        const compressedLast = await compressImage(lastFrame);
        requestPayload.firstFrameBase64 = await fileToBase64(compressedFirst);
        requestPayload.lastFrameBase64 = await fileToBase64(compressedLast);
      } else {
        requestPayload.type = 'text-to-video';
      }

      const task = await createVideoTask(requestPayload);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const updatedTask = await pollTaskStatus(task.id);
          
          if (updatedTask.status === 'completed') {
            history.replaceItem(tempId, {
              id: updatedTask.id,
              videoUrl: updatedTask.resultUrl || updatedTask.localPath,
              status: 'success',
            });
            
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsGenerating(false);

            if (onCreditsChange) {
              onCreditsChange();
            }
            await loadCreditData();
          } else if (updatedTask.status === 'failed') {
            history.replaceItem(tempId, {
              status: 'failed',
              errorMsg: updatedTask.errorMsg || 'Video generation failed',
            });
            
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsGenerating(false);
            setGenerationError(updatedTask.errorMsg || 'Video generation failed');
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 30000);

    } catch (error: any) {
      setIsGenerating(false);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create video task';
      setGenerationError(errorMsg);
      history.replaceItem(tempId, {
        status: 'failed',
        errorMsg,
      });
      console.error('Generation error:', error);
    }
  };

  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handlePreview = (item: VideoHistoryItem) => {
    setPreviewVideo(item);
  };

  const handleDownload = async (item: VideoHistoryItem) => {
    if (!item.videoUrl) return;
    try {
      const link = document.createElement('a');
      link.href = item.videoUrl;
      link.target = '_blank';
      link.download = `video-${item.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleReusePrompt = (item: VideoHistoryItem) => {
    setPrompt(item.prompt);
    setSelectedModel(item.model);
    if (item.type === 'image-to-video') {
      setActiveTab('reference');
    }
  };

  const handleDelete = async (item: VideoHistoryItem) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      await deleteVideoHistory(item.id);
      history.removeItem(item.id);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="h-full min-h-[600px] pb-40 px-4">
      {generationError && (
        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm mb-4">
          {generationError}
        </div>
      )}
      
      <VideoHistoryGrid
        items={history.items}
        loading={history.loading}
        loadingMore={history.loadingMore}
        error={history.error}
        hasMore={history.hasMore}
        onLoadMore={history.loadMore}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onReusePrompt={handleReusePrompt}
        onDelete={handleDelete}
        onRetry={history.loadInitial}
      />

      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="w-auto h-auto max-w-[min(90vw,calc(70vh*9/16))] max-h-[85vh] p-1 overflow-visible flex flex-col">
          <VisuallyHidden>
            <DialogTitle>预览</DialogTitle>
          </VisuallyHidden>
          {previewVideo && previewVideo.videoUrl && (
            <>
              <div className="relative bg-black flex items-end justify-center overflow-hidden rounded-t-lg" style={{ aspectRatio: '9/16', flexShrink: 0 }}>
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-full w-auto h-auto"
                />
              </div>
              <div className="px-6 py-2 bg-background shrink-0 rounded-b-lg -mt-4">
                <p className="text-sm text-muted-foreground truncate" title={previewVideo.prompt}>
                  {previewVideo.prompt}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <VideoInputBar
        prompt={prompt}
        onPromptChange={setPrompt}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedFiles={selectedFiles}
        firstFrame={firstFrame}
        lastFrame={lastFrame}
        onFileChange={handleFileChange}
        onFirstFrameChange={handleFirstFrameChange}
        onLastFrameChange={handleLastFrameChange}
        onFileRemove={handleFileRemove}
        onFirstFrameRemove={handleFirstFrameRemove}
        onLastFrameRemove={handleLastFrameRemove}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        canAfford={hasEnoughCredits}
        currentCost={currentCost}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        resolution={resolution}
        onResolutionChange={setResolution}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        duration={duration}
        onDurationChange={setDuration}
        isLoggedIn={isLoggedIn}
      />

      <Dialog open={showInsufficientDialog} onOpenChange={setShowInsufficientDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              {t.credits.insufficient}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t.credits.insufficientMessage
                ?.replace('{required}', currentCost.toFixed(2))
                .replace('{available}', userCredits.toFixed(2))}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowInsufficientDialog(false)} className="flex-1">
                {t.credits.close}
              </Button>
              <Button
                onClick={() => {
                  setShowInsufficientDialog(false);
                  router.push('/dashboard/credits');
                }}
                className="flex-1"
              >
                <Coins className="h-4 w-4 mr-2" />
                {t.credits.purchase}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
