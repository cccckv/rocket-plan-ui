"use client";

import * as React from "react";
import {
  ImagePlus,
  Images,
  Film,
  Package,
  Settings2,
  GalleryHorizontalEnd,
  Wand,
  Sparkle,
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
import { useI18n } from "@/lib/i18n/context";

type TabType = "reference" | "frame";

export function VideoGeneratorForm() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = React.useState<TabType>("reference");
  const [prompt, setPrompt] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleGenerate = () => {
    console.log({ prompt, selectedFiles });
  };

  return (
    <div className="animate-fade-in">
      <div className="relative rounded-3xl max-w-5xl mx-auto">
        <GlowingCard className="rounded-3xl border border-border bg-card/85 p-4 shadow-lg backdrop-blur-xl overflow-hidden">
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

          <div className="relative flex items-start gap-2 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-14 w-10 flex-col items-center justify-center gap-1 rounded-md border border-dashed transition shrink-0 border-muted-foreground/50 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
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

          <div className="pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Select defaultValue="veo">
                <SelectTrigger className="h-8 w-auto px-3 py-0 text-xs font-medium rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 border-0 cursor-pointer transition-colors [&>svg]:hidden">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veo">Veo 3.1 Quality (Exp)</SelectItem>
                  <SelectItem value="sora">Sora</SelectItem>
                  <SelectItem value="kling">Kling</SelectItem>
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
                      <Select defaultValue="720p">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720P</SelectItem>
                          <SelectItem value="1080p">1080P</SelectItem>
                          <SelectItem value="4k">4K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        {t.form.aspectRatio}
                      </label>
                      <Select defaultValue="9:16">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9:16">9:16 ({t.form.vertical})</SelectItem>
                          <SelectItem value="16:9">16:9 ({t.form.horizontal})</SelectItem>
                          <SelectItem value="1:1">1:1 ({t.form.square})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        {t.form.duration}
                      </label>
                      <Select defaultValue="8s">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5s">5 {t.form.seconds}</SelectItem>
                          <SelectItem value="8s">8 {t.form.seconds}</SelectItem>
                          <SelectItem value="15s">15 {t.form.seconds}</SelectItem>
                          <SelectItem value="25s">25 {t.form.seconds}</SelectItem>
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
                className="h-8 px-3 text-xs shadow-sm"
                disabled={!prompt.trim()}
                onClick={handleGenerate}
              >
                <Sparkle className="h-4 w-4 text-emerald-500" />
                20
              </Button>
            </div>
          </div>
        </GlowingCard>
      </div>
    </div>
  );
}
