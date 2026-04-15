"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import {
  ImagePlus,
  Images,
  Settings2,
  Wand2,
  Sparkles,
  X,
  AlertCircle,
  Coins,
  Loader2,
  Download,
  Layers,
  Heart,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowingCard } from "@/components/ui/glowing-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBalance } from "@/lib/api/credits";
import { useRouter } from "next/navigation";
import {
  generateImageWithPolling,
  IMAGE_MODELS,
  CreateImageRequest,
  ImageGenerationResult,
  ImageModelConfig,
  ImageTaskResponse,
} from "@/lib/api/images";
import { useI18n } from "@/lib/i18n/context";

interface ImageGeneratorFormProps {
  onCreditsChange?: () => void;
}

export function ImageGeneratorForm({ onCreditsChange }: ImageGeneratorFormProps = {}) {
  const router = useRouter();
  const { t } = useI18n();
  const [prompt, setPrompt] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [selectedModel, setSelectedModel] = React.useState("gemini-2.5-flash-image");
  const [aspectRatio, setAspectRatio] = React.useState("1:1");
  const [imageSize, setImageSize] = React.useState("1K");
  const [quality, setQuality] = React.useState("standard");
  const [style, setStyle] = React.useState("vivid");

  const currentModelConfig = React.useMemo(
    () => IMAGE_MODELS.find(m => m.id === selectedModel) || IMAGE_MODELS[0],
    [selectedModel]
  );

  React.useEffect(() => {
    if (!currentModelConfig.supportedResolutions.some(r => r.value === imageSize)) {
      setImageSize(currentModelConfig.supportedResolutions[0].value);
    }
  }, [selectedModel, currentModelConfig, imageSize]);
  const [userCredits, setUserCredits] = React.useState(0);
  const [showInsufficientDialog, setShowInsufficientDialog] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedImages, setGeneratedImages] = React.useState<ImageGenerationResult[]>([]);
  const [savedImages, setSavedImages] = React.useState<ImageGenerationResult[]>([]);
  const [generationError, setGenerationError] = React.useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'current' | 'saved'>('current');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const loadCreditData = async () => {
    try {
      const balance = await getBalance();
      setUserCredits(balance.credits);
    } catch (error) {
      console.error('Failed to load credit data:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert(t.images.selectImagesError);
      return;
    }

    if (selectedFiles.length + imageFiles.length > 5) {
      alert(t.images.maxImagesError);
      return;
    }

    const compressedFiles = await Promise.all(
      imageFiles.map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          try {
            return await imageCompression(file, {
              maxSizeMB: 5,
              maxWidthOrHeight: 2048,
              useWebWorker: true,
            });
          } catch (error) {
            console.error('Image compression failed:', error);
            return file;
          }
        }
        return file;
      })
    );

    setSelectedFiles(prev => [...prev, ...compressedFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentModelCost = () => {
    const model = IMAGE_MODELS.find(m => m.id === selectedModel);
    return model?.cost || 0;
  };

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!prompt.trim()) {
      return;
    }

    const cost = getCurrentModelCost();
    if (userCredits < cost) {
      setShowInsufficientDialog(true);
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setActiveTab('current');

    try {
      let referenceImageUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        const base64Promises = selectedFiles.map(file => 
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        );
        referenceImageUrls = await Promise.all(base64Promises);
      }

      const request: CreateImageRequest = {
        model: selectedModel,
        prompt: prompt.trim(),
        n: 1,
        aspectRatio,
        resolution: imageSize,
        quality,
        style,
        referenceImages: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
      };

      const result = await generateImageWithPolling(
        request,
        (task: ImageTaskResponse) => {
          if (task.status === 'failed') {
            setGenerationError(task.errorMsg || t.images.generateFirst);
          }
        },
        10000
      );
      setGeneratedImages([result]);
      setSelectedIndex(0);
      await loadCreditData();
      if (onCreditsChange) {
        onCreditsChange();
      }
    } catch (error: any) {
      console.error('Image generation failed:', error);
      setGenerationError(
        error.response?.data?.message ||
        error.message ||
        t.images.generateFirst
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getImageSrc = (image: ImageGenerationResult): string => {
    if (image.imageUrl) {
      return image.imageUrl;
    }
    return '';
  };

  const downloadImage = async (image: ImageGenerationResult) => {
    const src = getImageSrc(image);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleSave = (image: ImageGenerationResult) => {
    setSavedImages(prev => {
      const src = getImageSrc(image);
      if (prev.some(img => getImageSrc(img) === src)) return prev;
      return [image, ...prev];
    });
  };

  const handleRemove = (image: ImageGenerationResult) => {
    const src = getImageSrc(image);
    setSavedImages(prev => prev.filter(img => getImageSrc(img) !== src));
  };

  const displayImages = activeTab === 'current' ? generatedImages : savedImages;
  const selectedImage = displayImages[selectedIndex] || null;
  const isSaved = selectedImage ? savedImages.some(img => getImageSrc(img) === getImageSrc(selectedImage)) : false;
  const currentCost = getCurrentModelCost();
  const canAfford = userCredits >= currentCost;
  const isGemini = selectedModel.includes('gemini');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
      {/* Left Controls */}
      <div className="lg:col-span-4 space-y-4">
        <GlowingCard className="p-6 rounded-3xl border border-border bg-card/85 shadow-lg backdrop-blur-xl">
          <div className="space-y-6">
            {/* Model Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t.images.model}
              </label>
              <Select value={selectedModel} onValueChange={(value) => {
                const newModel = IMAGE_MODELS.find(m => m.id === value);
                if (newModel && !newModel.supportedAspectRatios.find(r => r.value === aspectRatio)) {
                  setAspectRatio(newModel.supportedAspectRatios[0].value);
                }
                setSelectedModel(value);
              }} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Gemini Models
                  </div>
                  {IMAGE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.cost} {t.credits.costs}
                        </span>
                      </div>
                    </SelectItem>
                  ))}

                </SelectContent>
              </Select>
            </div>

            <div className="h-px bg-border/50" />

            {/* Prompt */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">{t.images.prompt}</label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.images.promptPlaceholder}
                  className="w-full h-32 bg-muted border border-border rounded-xl p-4 resize-none text-sm transition-all focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
                  disabled={isGenerating}
                  maxLength={1000}
                />
                <Sparkles className="absolute bottom-3 right-3 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t.images.aspectRatio}</label>
              <div className="grid grid-cols-5 gap-2">
                {currentModelConfig.supportedAspectRatios.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    disabled={isGenerating}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      aspectRatio === ratio.value
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={ratio.label}
                  >
                    <span className="text-xl mb-1">{ratio.icon}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">{ratio.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                {t.images.resolution}
              </label>
              <div className={`grid gap-2 ${currentModelConfig.supportedResolutions.length === 1 ? 'grid-cols-1' : currentModelConfig.supportedResolutions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {currentModelConfig.supportedResolutions.map((res) => (
                  <button
                    key={res.value}
                    onClick={() => setImageSize(res.value)}
                    disabled={isGenerating}
                    className={`flex items-center justify-center p-2 rounded-lg border text-sm font-medium transition-all ${
                      imageSize === res.value
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={res.label}
                  >
                    {res.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Images */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">
                <Images className="w-4 h-4 inline mr-1.5" />
                {t.images.referenceImages}
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFiles.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-border bg-muted">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-background/80 text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {selectedFiles.length < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square flex items-center justify-center border border-dashed border-border rounded-lg hover:border-primary hover:bg-muted/50 cursor-pointer"
                    >
                      <ImagePlus size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer transition-all border-border bg-muted hover:border-primary"
                >
                  <ImagePlus className="w-5 h-5 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">{t.images.uploadReference}</p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !canAfford}
              className="w-full py-6 text-base font-bold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t.images.generating}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  {t.images.generate} ({currentCost} {t.credits.costs})
                </>
              )}
            </Button>

            {generationError && (
              <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
                {generationError}
              </div>
            )}

            {/* Credits */}
            <div className="text-xs text-muted-foreground text-center">
              {t.credits.balance}: {userCredits.toFixed(2)} {t.credits.costs}
            </div>
          </div>
        </GlowingCard>
      </div>

      {/* Right Display */}
      <div className="lg:col-span-8">
        <GlowingCard className="h-full flex flex-col rounded-3xl border border-border bg-card/85 backdrop-blur-xl overflow-hidden min-h-[600px]">
          {/* Header */}
          <div className="p-2 border-b border-border flex justify-between items-center bg-background/80">
            <div className="flex bg-muted rounded-lg p-1 border border-border">
              <button
                onClick={() => { setActiveTab('current'); setSelectedIndex(0); }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'current' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Images size={14} />
                {t.images.current}
              </button>
              <button
                onClick={() => { setActiveTab('saved'); setSelectedIndex(0); }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'saved' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers size={14} />
                {t.images.saved}
                {savedImages.length > 0 && (
                  <span className="bg-muted text-xs px-1.5 py-0.5 rounded-full">{savedImages.length}</span>
                )}
              </button>
            </div>

            {selectedImage && !isGenerating && (
              <div className="flex gap-2">
                {activeTab === 'current' && (
                  <Button
                    variant={isSaved ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => isSaved ? handleRemove(selectedImage) : handleSave(selectedImage)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? t.images.saved : t.images.save}
                  </Button>
                )}
                {activeTab === 'saved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(selectedImage)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t.images.delete}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => selectedImage && downloadImage(selectedImage)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.images.download}
                </Button>
              </div>
            )}
          </div>

          {/* Display Area */}
          <div className="flex-1 flex flex-col relative bg-background/30 min-h-0">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
              {isGenerating ? (
                <div className="text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-border rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-primary font-medium animate-pulse">{t.images.generating}</p>
                </div>
              ) : selectedImage ? (
                <div className="relative h-full w-full flex items-center justify-center">
                  <img
                    src={getImageSrc(selectedImage)}
                    alt="Generated"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl ring-1 ring-border"
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground max-w-sm">
                  {activeTab === 'saved' ? (
                    <>
                      <div className="w-16 h-16 bg-muted rounded-2xl mx-auto mb-4 flex items-center justify-center border border-border">
                        <Heart className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t.images.noImages}</h3>
                      <p className="text-sm">{t.images.generateFirst}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-muted rounded-2xl mx-auto mb-4 flex items-center justify-center border border-border">
                        <Sparkles className="text-muted-foreground" size={32} />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">{t.images.generateFirst}</h3>
                      <p className="text-sm">{t.images.promptPlaceholder}</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {!isGenerating && displayImages.length > 0 && (
              <div className="h-24 bg-background/80 border-t border-border p-3 flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative h-full aspect-square rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedIndex === idx
                        ? 'border-primary ring-2 ring-primary/20 opacity-100 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-90 hover:border-border'
                    }`}
                  >
                    <img src={getImageSrc(img)} alt="" className="w-full h-full object-cover" />
                    {activeTab === 'current' && savedImages.some(s => s.imageUrl === img.imageUrl) && (
                      <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                        <Heart size={8} className="fill-white text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </GlowingCard>
      </div>

      {/* Insufficient Credits Dialog */}
      <Dialog open={showInsufficientDialog} onOpenChange={setShowInsufficientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              {t.credits.insufficient}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t.credits.insufficientMessage
                .replace('{required}', currentCost.toFixed(2))
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
