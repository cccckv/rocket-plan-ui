"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import {
  ImagePlus,
  Images,
  Film,
  Package,
  Settings2,
  GalleryHorizontalEnd,
  Wand,
  Sparkle,
  X,
  AlertCircle,
  Coins,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlowingCard } from "@/components/ui/glowing-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/context";
import { getBalance, getCreditCosts, DEFAULT_CREDIT_COSTS } from "@/lib/api/credits";
import { useRouter } from "next/navigation";
import { getModelSpecs } from "@/lib/model-specs";
import { createVideoTask, pollTaskStatus, VideoTask } from "@/lib/api/videos";

type TabType = "reference" | "frame";

interface VideoGeneratorFormProps {
  onCreditsChange?: () => void;
}

export function VideoGeneratorForm({ onCreditsChange }: VideoGeneratorFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabType>("reference");
  const [prompt, setPrompt] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [firstFrame, setFirstFrame] = React.useState<File | null>(null);
  const [lastFrame, setLastFrame] = React.useState<File | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [selectedModel, setSelectedModel] = React.useState("veo3.1-fast");
  const [creditCosts, setCreditCosts] = React.useState<Record<string, number>>(DEFAULT_CREDIT_COSTS);
  const [userCredits, setUserCredits] = React.useState(0);
  const [showInsufficientDialog, setShowInsufficientDialog] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentTask, setCurrentTask] = React.useState<VideoTask | null>(null);
  const [generationError, setGenerationError] = React.useState<string | null>(null);
  const [resolution, setResolution] = React.useState("720p");
  const [aspectRatio, setAspectRatio] = React.useState("9:16");
  const [duration, setDuration] = React.useState("8s");
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const firstFrameInputRef = React.useRef<HTMLInputElement>(null);
  const lastFrameInputRef = React.useRef<HTMLInputElement>(null);
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const checkLoginStatus = () => {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) 
        : null;
      setIsLoggedIn(!!token);
      if (token) {
        loadCreditData();
      }
    };
    
    checkLoginStatus();
    
    // Listen for storage changes (login/logout in other tabs)
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
  const modelSpecs = React.useMemo(() => getModelSpecs(selectedModel), [selectedModel]);

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

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
    };
    
    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
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
    // Re-check login status before generation
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) 
      : null;
    
    console.log('[DEBUG] handleGenerate - token exists:', !!token);
    console.log('[DEBUG] handleGenerate - isLoggedIn state:', isLoggedIn);
    
    if (!token) {
      console.log('[DEBUG] No token found, redirecting to login');
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

    // Validate Reference tab (max 3 images)
    if (activeTab === "reference" && selectedFiles.length > 3) {
      setGenerationError("Maximum 3 reference images allowed");
      return;
    }

    // Validate Frame tab (both frames required)
    if (activeTab === "frame" && (!firstFrame || !lastFrame)) {
      setGenerationError("Both first frame and last frame are required");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setCurrentTask(null);

    try {
      const durationInSeconds = parseInt(duration.replace('s', ''));
      
      // Base request payload
      const requestPayload: any = {
        model: selectedModel,
        prompt: prompt.trim(),
        duration: durationInSeconds,
        aspectRatio: aspectRatio,
        resolution: resolution.toUpperCase().replace('P', 'P'),
        enhancePrompt: true,
        generateAudio: true,
      };

      // Handle Reference Images tab
      if (activeTab === "reference" && selectedFiles.length > 0) {
        requestPayload.type = 'image-to-video';
        
        if (selectedFiles.length === 1) {
          // Single image - use imageBase64
          const compressed = await compressImage(selectedFiles[0]);
          requestPayload.imageBase64 = await fileToBase64(compressed);
        } else {
          // Multiple images - use referenceImagesBase64
          const compressedFiles = await Promise.all(
            selectedFiles.slice(0, 3).map(file => compressImage(file))
          );
          const base64Images = await Promise.all(
            compressedFiles.map(file => fileToBase64(file))
          );
          requestPayload.referenceImagesBase64 = base64Images;
        }
      }
      // Handle Frame tab
      else if (activeTab === "frame" && firstFrame && lastFrame) {
        requestPayload.type = 'image-to-video';
        const compressedFirst = await compressImage(firstFrame);
        const compressedLast = await compressImage(lastFrame);
        requestPayload.firstFrameBase64 = await fileToBase64(compressedFirst);
        requestPayload.lastFrameBase64 = await fileToBase64(compressedLast);
      }
      // Default: Text-to-Video
      else {
        requestPayload.type = 'text-to-video';
      }

      const task = await createVideoTask(requestPayload);

      setCurrentTask(task);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const updatedTask = await pollTaskStatus(task.id);
          setCurrentTask(updatedTask);

          if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsGenerating(false);

            if (updatedTask.status === 'failed') {
              setGenerationError(updatedTask.errorMsg || 'Video generation failed');
            }

            if (onCreditsChange) {
              onCreditsChange();
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 30000);

    } catch (error: any) {
      setIsGenerating(false);
      setGenerationError(error.response?.data?.message || error.message || 'Failed to create video task');
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

  return (
    <div className="animate-fade-in">
      <div className="relative rounded-3xl mx-auto" style={{ maxWidth: '1000px' }}>
        <GlowingCard className="rounded-3xl border border-border bg-card/85 shadow-lg backdrop-blur-xl overflow-hidden" style={{ padding: '24px' }}>
          <div className="mb-3">
            <div className="bg-muted shrink-0 w-fit flex h-8 p-0.5 rounded-full">
              <button
                type="button"
                className={`flex items-center justify-center transition-all h-7 px-3 rounded-full text-xs whitespace-nowrap gap-1.5 ${
                  activeTab === "reference"
                    ? "bg-background/70 text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("reference")}
              >
                <Images className="h-4 w-4 shrink-0" />
                <span>{t.form.tabReference}</span>
              </button>
              <button
                type="button"
                className={`flex items-center justify-center transition-all h-7 px-3 rounded-full text-xs whitespace-nowrap gap-1.5 ${
                  activeTab === "frame"
                    ? "bg-background/70 text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("frame")}
              >
                <Film className="h-4 w-4 shrink-0" />
                <span>{t.form.tabFrame}</span>
              </button>
            </div>
          </div>

          {activeTab === "reference" ? (
            <div className="relative flex items-start gap-2 rounded-xl transition-all duration-300">
              <div className="flex items-center gap-2 shrink-0" style={{ marginLeft: '5px' }}>
                <div className="flex items-center gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative w-14 aspect-[3/4] rounded-md overflow-hidden border-2 border-dashed border-muted-foreground/50 bg-muted/40 group shrink-0"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPreviewImage(URL.createObjectURL(file))}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="w-14 aspect-[3/4] rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/40 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                    aria-label="Add reference image"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    aria-label="Upload reference images"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <Textarea
                className="overflow-hidden min-h-[64px] max-h-[140px] w-full resize-none border-0 bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 shadow-none pl-2"
                maxLength={8000}
                placeholder={t.form.placeholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2" style={{ marginLeft: '5px' }}>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => !firstFrame && firstFrameInputRef.current?.click()}
                    className="relative w-14 aspect-[3/4] rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/40 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground overflow-hidden cursor-pointer"
                  >
                    {firstFrame ? (
                      <>
                        <img
                          src={URL.createObjectURL(firstFrame)}
                          alt="首帧"
                          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(URL.createObjectURL(firstFrame));
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFirstFrame(null);
                            if (firstFrameInputRef.current) {
                              firstFrameInputRef.current.value = '';
                            }
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors z-10 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-4 w-4" />
                        <span className="text-xs">首帧</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={firstFrameInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFirstFrameChange}
                  />
                </div>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => !lastFrame && lastFrameInputRef.current?.click()}
                    className="relative w-14 aspect-[3/4] rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/40 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground overflow-hidden cursor-pointer"
                  >
                    {lastFrame ? (
                      <>
                        <img
                          src={URL.createObjectURL(lastFrame)}
                          alt="尾帧"
                          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(URL.createObjectURL(lastFrame));
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLastFrame(null);
                            if (lastFrameInputRef.current) {
                              lastFrameInputRef.current.value = '';
                            }
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors z-10 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-4 w-4" />
                        <span className="text-xs">尾帧</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={lastFrameInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLastFrameChange}
                  />
                </div>

                <Textarea
                  className="overflow-hidden min-h-[64px] max-h-[140px] flex-1 resize-none border-0 bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 shadow-none pl-2"
                  maxLength={8000}
                  placeholder={t.form.placeholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-8 w-auto px-3 py-0 text-xs font-medium rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 border-0 cursor-pointer transition-colors [&>svg]:hidden">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veo3.1-fast-components">Veo 3.1 Fast Components ({creditCosts['veo3.1-fast-components']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo_3_1-fast-components">Veo 3.1 Fast Components Alt ({creditCosts['veo_3_1-fast-components']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo_3_1-fast">Veo 3.1 Fast ({creditCosts['veo_3_1-fast']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo_3_1-fast-4K">Veo 3.1 Fast 4K ({creditCosts['veo_3_1-fast-4K']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3.1-fast">Veo 3.1 Fast ({creditCosts['veo3.1-fast']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3-fast">Veo 3 Fast ({creditCosts['veo3-fast']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3.1">Veo 3.1 ({creditCosts['veo3.1']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo_3_1">Veo 3.1 Alt ({creditCosts['veo_3_1']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3.1-components">Veo 3.1 Components ({creditCosts['veo3.1-components']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo_3_1-components">Veo 3.1 Components Alt ({creditCosts['veo_3_1-components']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3">Veo 3 ({creditCosts['veo3']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo_3_1-4K">Veo 3.1 4K ({creditCosts['veo_3_1-4K']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo_3_1-components-4K">Veo 3.1 Components 4K ({creditCosts['veo_3_1-components-4K']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo_3_1-fast-components-4K">Veo 3.1 Fast Components 4K ({creditCosts['veo_3_1-fast-components-4K']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3.1-4k">Veo 3.1 4K ({creditCosts['veo3.1-4k']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3.1-components-4k">Veo 3.1 Components 4K ({creditCosts['veo3.1-components-4k']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3-fast-frames">Veo 3 Fast Frames ({creditCosts['veo3-fast-frames']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3-frames">Veo 3 Frames ({creditCosts['veo3-frames']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3-pro-frames">Veo 3 Pro Frames ({creditCosts['veo3-pro-frames']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3.1-pro">Veo 3.1 Pro ({creditCosts['veo3.1-pro']?.toFixed(2)} {t.credits.costs})</SelectItem>
                  <SelectItem value="veo3.1-pro-4k">Veo 3.1 Pro 4K ({creditCosts['veo3.1-pro-4k']?.toFixed(2)} {t.credits.costs})</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    rounded="full"
                    className="h-8 px-3 py-2 text-xs font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 lucide-settings-2" />
                      <span>720P · 9:16 · 8s</span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        {t.form.resolution}
                      </label>
                      <Select value={resolution} onValueChange={setResolution}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720P</SelectItem>
                          <SelectItem value="1080p">1080P</SelectItem>
                          <SelectItem 
                            value="4k" 
                            disabled={!modelSpecs.supports4K}
                          >
                            4K {!modelSpecs.supports4K && '(不支持)'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        {t.form.aspectRatio}
                      </label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9:16">9:16 ({t.form.vertical})</SelectItem>
                          <SelectItem value="16:9">16:9 ({t.form.horizontal})</SelectItem>
                          <SelectItem value="1:1" disabled>
                            1:1 ({t.form.square}) (不支持)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        {t.form.duration}
                      </label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4s">4 {t.form.seconds}</SelectItem>
                          <SelectItem value="5s">5 {t.form.seconds}</SelectItem>
                          <SelectItem value="6s">6 {t.form.seconds}</SelectItem>
                          <SelectItem value="7s">7 {t.form.seconds}</SelectItem>
                          <SelectItem value="8s">8 {t.form.seconds}</SelectItem>
                          <SelectItem value="15s" disabled>
                            15 {t.form.seconds} (不支持)
                          </SelectItem>
                          <SelectItem value="25s" disabled>
                            25 {t.form.seconds} (不支持)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    rounded="full"
                    className="h-8 px-3 text-xs"
                  >
                    <GalleryHorizontalEnd className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.form.generate} 1 {t.form.videos}</span>
                    <span className="sm:hidden">1</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t.form.generate} 1 {t.form.videos}</DropdownMenuItem>
                  <DropdownMenuItem>{t.form.generate} 2 {t.form.videos}</DropdownMenuItem>
                  <DropdownMenuItem>{t.form.generate} 4 {t.form.videos}</DropdownMenuItem>
                  <DropdownMenuItem>{t.form.generate} 8 {t.form.videos}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="secondary"
                size="sm"
                rounded="full"
                className="h-8 px-3 text-xs"
              >
                <Wand className="h-4 w-4" />
                <span className="hidden sm:inline">{t.form.enhancePrompt}</span>
              </Button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {prompt.length}/8000
              </span>
              <Button
                size="sm"
                rounded="full"
                className="h-8 px-3 text-xs shadow-sm relative"
                disabled={!prompt.trim() || isGenerating || (isLoggedIn && !hasEnoughCredits)}
                onClick={handleGenerate}
                title={
                  !isLoggedIn 
                    ? 'Click to login and generate videos' 
                    : !hasEnoughCredits 
                    ? t.credits.insufficientMessage.replace('{required}', currentCost.toFixed(2)).replace('{available}', userCredits.toFixed(2)) 
                    : ''
                }
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    <span>Generating...</span>
                  </>
                ) : !isLoggedIn ? (
                  <>
                    <span>Login to Generate</span>
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4 text-amber-500 mr-1" />
                    <span>{currentCost.toFixed(2)}</span>
                    {!hasEnoughCredits && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </GlowingCard>

        {/* Generation Status Display */}
        {currentTask && (
          <GlowingCard glowIntensity="medium" className="mt-6">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                {currentTask.status === 'pending' || currentTask.status === 'queued' && (
                  <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
                )}
                {currentTask.status === 'generating' && (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                )}
                {currentTask.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {currentTask.status === 'failed' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {currentTask.status === 'pending' && 'Preparing...'}
                    {currentTask.status === 'queued' && 'Queued'}
                    {currentTask.status === 'generating' && 'Generating Video...'}
                    {currentTask.status === 'completed' && 'Video Ready!'}
                    {currentTask.status === 'failed' && 'Generation Failed'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentTask.status === 'pending' && 'Your request is being prepared'}
                    {currentTask.status === 'queued' && 'Waiting in queue...'}
                    {currentTask.status === 'generating' && 'AI is creating your video'}
                    {currentTask.status === 'completed' && 'Your video is ready to view'}
                    {currentTask.status === 'failed' && (currentTask.errorMsg || 'An error occurred')}
                  </p>
                </div>
              </div>

              {/* Video Player for Completed Tasks */}
              {currentTask.status === 'completed' && (currentTask.resultUrl || currentTask.localPath) && (
                <div className="space-y-3">
                  <video
                    controls
                    className="w-full rounded-lg bg-black"
                    src={currentTask.resultUrl || currentTask.localPath}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const url = currentTask.resultUrl || currentTask.localPath;
                        if (url) {
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `video-${currentTask.id}.mp4`;
                          a.click();
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Video
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCurrentTask(null);
                        setIsGenerating(false);
                        setGenerationError(null);
                      }}
                    >
                      Generate New Video
                    </Button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {currentTask.status === 'failed' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCurrentTask(null);
                    setIsGenerating(false);
                    setGenerationError(null);
                  }}
                >
                  Try Again
                </Button>
              )}
            </div>
          </GlowingCard>
        )}

        {/* General Error Display */}
        {generationError && !currentTask && (
          <GlowingCard glowIntensity="medium" className="mt-6">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-500">Error</h3>
                  <p className="text-xs text-muted-foreground mt-1">{generationError}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setGenerationError(null);
                  setIsGenerating(false);
                }}
              >
                Dismiss
              </Button>
            </div>
          </GlowingCard>
        )}
      </div>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="w-fit max-w-[95vw] h-fit max-h-[95vh] overflow-hidden p-0 border-0 gap-0">
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showInsufficientDialog} onOpenChange={setShowInsufficientDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{t.credits.insufficient}</h3>
              <p className="text-sm text-muted-foreground">
                {t.credits.insufficientMessage
                  .replace('{required}', currentCost.toFixed(2))
                  .replace('{available}', userCredits.toFixed(2))}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowInsufficientDialog(false)}
              >
                {t.credits.close}
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowInsufficientDialog(false);
                  router.push('/dashboard/credits');
                }}
              >
                {t.credits.viewHistory}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
