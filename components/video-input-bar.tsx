"use client";

import * as React from "react";
import { ImagePlus, X, Film, Images, Package, Settings2, Loader2, Coins, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useI18n } from "@/lib/i18n/context";
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
import { getModelSpecs } from "@/lib/model-specs";
import { getAvailableModels } from "@/lib/model-categories";

type TabType = "reference" | "frame";

interface VideoInputBarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedFiles: File[];
  firstFrame: File | null;
  lastFrame: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFirstFrameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLastFrameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (index: number) => void;
  onFirstFrameRemove: () => void;
  onLastFrameRemove: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canAfford: boolean;
  currentCost: number;
  disabled?: boolean;
  selectedModel: string;
  onModelChange: (value: string) => void;
  resolution: string;
  onResolutionChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  duration: string;
  onDurationChange: (value: string) => void;
  isLoggedIn: boolean;
}

export function VideoInputBar({
  prompt,
  onPromptChange,
  activeTab,
  onTabChange,
  selectedFiles,
  firstFrame,
  lastFrame,
  onFileChange,
  onFirstFrameChange,
  onLastFrameChange,
  onFileRemove,
  onFirstFrameRemove,
  onLastFrameRemove,
  onGenerate,
  isGenerating,
  canAfford,
  currentCost,
  disabled = false,
  selectedModel,
  onModelChange,
  resolution,
  onResolutionChange,
  aspectRatio,
  onAspectRatioChange,
  duration,
  onDurationChange,
  isLoggedIn,
}: VideoInputBarProps) {
  const { t } = useI18n();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const firstFrameInputRef = React.useRef<HTMLInputElement>(null);
  const lastFrameInputRef = React.useRef<HTMLInputElement>(null);

  const modelSpecs = React.useMemo(() => getModelSpecs(selectedModel), [selectedModel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!disabled && !isGenerating && prompt.trim() && canAfford) {
        onGenerate();
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-56 right-0 z-50 pointer-events-none">
      <div className="w-full px-4 py-4 flex justify-center">
        <GlowingCard className="rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden max-w-5xl w-full pointer-events-auto">
          <div className="p-3 space-y-3">
            <div className="bg-muted shrink-0 w-fit flex h-8 p-0.5 rounded-full">
              <button
                type="button"
                className={`flex items-center justify-center transition-all h-7 px-3 rounded-full text-xs whitespace-nowrap gap-1.5 ${
                  activeTab === "reference"
                    ? "bg-background/70 text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onTabChange("reference")}
                disabled={isGenerating}
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
                onClick={() => onTabChange("frame")}
                disabled={isGenerating}
              >
                <Film className="h-4 w-4 shrink-0" />
                <span>{t.form.tabFrame}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 h-full">
              {activeTab === "reference" ? (
                <div className="flex gap-2 shrink-0 h-full items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />

                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative w-10 aspect-[3/4] rounded-md overflow-hidden border-2 border-dashed border-muted-foreground/50 bg-muted/40 group shrink-0"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Ref ${idx + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileRemove(idx);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {selectedFiles.length < 3 && (
                    <button
                      type="button"
                      className="w-10 aspect-[3/4] rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/40 hover:border-primary/40 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                      aria-label="Add reference image"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled || isGenerating}
                    >
                      <ImagePlus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2 shrink-0 h-full items-center">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => !firstFrame && firstFrameInputRef.current?.click()}
                      className="relative w-10 aspect-[3/4] rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/40 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground overflow-hidden cursor-pointer"
                      disabled={disabled || isGenerating}
                    >
                      {firstFrame ? (
                        <>
                          <img
                            src={URL.createObjectURL(firstFrame)}
                            alt="首帧"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFirstFrameRemove();
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors z-10 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-3 w-3" />
                          <span className="text-[9px]">首帧</span>
                        </>
                      )}
                    </button>
                    <input
                      ref={firstFrameInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFirstFrameChange}
                    />
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => !lastFrame && lastFrameInputRef.current?.click()}
                      className="relative w-10 aspect-[3/4] rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/40 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground overflow-hidden cursor-pointer"
                      disabled={disabled || isGenerating}
                    >
                      {lastFrame ? (
                        <>
                          <img
                            src={URL.createObjectURL(lastFrame)}
                            alt="尾帧"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLastFrameRemove();
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors z-10 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-3 w-3" />
                          <span className="text-[9px]">尾帧</span>
                        </>
                      )}
                    </button>
                    <input
                      ref={lastFrameInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onLastFrameChange}
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 relative overflow-hidden">
                <textarea
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.form.placeholder}
                  className="w-full bg-transparent border-0 resize-none text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground min-h-[40px] max-h-[60px] py-2 overflow-hidden"
                  disabled={disabled || isGenerating}
                  maxLength={8000}
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 60) + 'px';
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Select value={selectedModel} onValueChange={onModelChange} disabled={isGenerating}>
                <SelectTrigger className="h-8 w-auto min-w-[140px] max-w-[220px] px-3 py-0 text-xs font-medium rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 border-0 cursor-pointer transition-colors [&>svg]:hidden">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 shrink-0" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {activeTab === "reference" ? (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Reference Images</div>
                      {getAvailableModels("reference").map((modelId) => (
                        <SelectItem key={modelId} value={modelId}>
                          {modelId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">First/Last Frame</div>
                      {getAvailableModels("frame").map((modelId) => (
                        <SelectItem key={modelId} value={modelId}>
                          {modelId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 px-3 py-0 text-xs font-medium rounded-full"
                    disabled={isGenerating}
                  >
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 shrink-0" />
                      <span>{resolution} · {aspectRatio} · {duration}</span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        {t.form.resolution}
                      </label>
                      <Select value={resolution} onValueChange={onResolutionChange}>
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
                      <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9:16">9:16 ({t.form.vertical})</SelectItem>
                          <SelectItem value="16:9">16:9 ({t.form.horizontal})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        {t.form.duration}
                      </label>
                      <Select value={duration} onValueChange={onDurationChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4s">4 {t.form.seconds}</SelectItem>
                          <SelectItem value="5s">5 {t.form.seconds}</SelectItem>
                          <SelectItem value="6s">6 {t.form.seconds}</SelectItem>
                          <SelectItem value="7s">7 {t.form.seconds}</SelectItem>
                          <SelectItem value="8s">8 {t.form.seconds}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                onClick={onGenerate}
                disabled={disabled || isGenerating || !prompt.trim() || (isLoggedIn && !canAfford)}
                className="h-8 px-3 py-0 text-xs font-medium rounded-full"
                size="default"
                title={
                  !isLoggedIn 
                    ? 'Click to login and generate videos' 
                    : !canAfford 
                    ? t.credits.insufficientMessage?.replace('{required}', currentCost.toFixed(2))
                    : ''
                }
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Generating</span>
                  </>
                ) : !isLoggedIn ? (
                  <>
                    <span>Login to Generate</span>
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4 text-amber-500 mr-2" />
                    <span>{currentCost.toFixed(2)}</span>
                    {!canAfford && (
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
      </div>
    </div>
  );
}
